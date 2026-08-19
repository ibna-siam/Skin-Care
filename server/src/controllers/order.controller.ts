import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createOrderSchema } from '../validators/order.validator.js';
import { calculateShippingFee, normalizeBDPhone } from '@skincare/shared';
import { PaymentService } from '../payment/PaymentService.js';

export async function createOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createOrderSchema.parse(req.body);
    const userId = req.user?.userId || null;
    const customerPhone = normalizeBDPhone(data.customerPhone);

    // 1. Fetch products and calculate real server-side prices
    const productIds = data.items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { images: { where: { isPrimary: true }, take: 1 } },
    });

    if (products.length !== productIds.length) {
      return sendError(res, 'One or more products in your cart are no longer available', 400);
    }

    // 2. Validate stock and build order items
    let subtotal = 0;
    const orderItemsData: any[] = [];

    for (const item of data.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product || product.status !== 'ACTIVE') {
        return sendError(res, `Product ${product?.name || item.productId} is unavailable`, 400);
      }
      if (product.stock < item.quantity) {
        return sendError(res, `Only ${product.stock} units of ${product.name} are available`, 400);
      }

      const itemSubtotal = product.price * item.quantity;
      subtotal += itemSubtotal;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        productSku: product.sku,
        productImage: product.images[0]?.url || '',
        price: product.price,
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // 3. Compute discount from coupon (server-side verification)
    let discount = 0;
    let isFreeDeliveryCoupon = false;

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase().trim() },
      });

      if (coupon && coupon.isActive && new Date(coupon.expiryDate) >= new Date()) {
        if (!coupon.minOrderAmount || subtotal >= coupon.minOrderAmount) {
          if (coupon.type === 'PERCENTAGE') {
            discount = (subtotal * coupon.value) / 100;
            if (coupon.maxDiscountAmount && discount > coupon.maxDiscountAmount) {
              discount = coupon.maxDiscountAmount;
            }
          } else if (coupon.type === 'FIXED') {
            discount = Math.min(coupon.value, subtotal);
          } else if (coupon.type === 'FREE_DELIVERY') {
            isFreeDeliveryCoupon = true;
          }
        }
      }
    }

    discount = Math.round(discount);

    // 4. Calculate Bangladesh shipping fee
    let shippingFee = calculateShippingFee(data.district, subtotal, data.deliveryMethod === 'EXPRESS');
    if (isFreeDeliveryCoupon) {
      shippingFee = 0;
    }

    const totalAmount = Math.max(0, subtotal - discount + shippingFee);

    // 5. Generate Order Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `SKN${Date.now().toString().slice(-4)}${randomSuffix}`;

    // 6. Database Transaction: Create Order, Items, Decrement stock, create timeline
    const order = await prisma.$transaction(async (tx) => {
      // Decrement stock
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: item.quantity },
          },
        });
      }

      // Record coupon usage
      if (data.couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: data.couponCode.toUpperCase().trim() },
        });
        if (coupon) {
          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
          await tx.couponUsage.create({
            data: {
              couponId: coupon.id,
              userId: userId || undefined,
            },
          });
        }
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: userId || undefined,
          customerName: data.customerName,
          customerPhone,
          customerEmail: data.customerEmail.toLowerCase(),
          division: data.division,
          district: data.district,
          area: data.area,
          fullAddress: data.fullAddress,
          postalCode: data.postalCode,
          deliveryMethod: data.deliveryMethod,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
          orderStatus: 'PENDING',
          subtotal,
          discount,
          couponCode: data.couponCode,
          shippingFee,
          totalAmount,
          notes: data.notes,
          items: {
            create: orderItemsData,
          },
          timeline: {
            create: {
              status: 'PENDING',
              note: 'Order placed by customer',
            },
          },
        },
        include: {
          items: true,
          timeline: true,
        },
      });

      return newOrder;
    });

    // 7. Initiate payment via provider
    const paymentProvider = PaymentService.getProvider(data.paymentMethod);
    const paymentResult = await paymentProvider.initiatePayment({
      id: order.id,
      orderNumber: order.orderNumber,
      totalAmount: order.totalAmount,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerEmail: order.customerEmail,
    });

    // Record Payment Entry
    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: order.totalAmount,
        paymentMethod: data.paymentMethod,
        transactionId: paymentResult.transactionId,
        status: data.paymentMethod === 'COD' ? 'PENDING' : 'PENDING',
      },
    });

    return sendSuccess(res, {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        orderStatus: order.orderStatus,
      },
      payment: paymentResult,
    }, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function trackOrder(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderNumber, phone } = req.query as { orderNumber: string; phone: string };

    if (!orderNumber || !phone) {
      return sendError(res, 'Order Number and Phone Number are required', 400);
    }

    const normalizedPhone = normalizeBDPhone(phone);

    const order = await prisma.order.findFirst({
      where: {
        orderNumber: orderNumber.trim().toUpperCase(),
        OR: [
          { customerPhone: normalizedPhone },
          { customerPhone: phone.trim() },
        ],
      },
      include: {
        items: true,
        timeline: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!order) {
      return sendError(res, 'No order found matching this Order ID and Phone number', 404);
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
}

export async function getCustomerOrders(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        timeline: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });

    return sendSuccess(res, orders);
  } catch (error) {
    next(error);
  }
}

export async function getOrderDetails(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const userId = req.user?.userId;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        timeline: { orderBy: { createdAt: 'asc' } },
        payments: true,
      },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    if (userId && order.userId && order.userId !== userId && req.user?.role === 'CUSTOMER') {
      return sendError(res, 'Access denied', 403);
    }

    return sendSuccess(res, order);
  } catch (error) {
    next(error);
  }
}
