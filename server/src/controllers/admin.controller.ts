import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createProductSchema } from '../validators/product.validator.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';
import { createCouponSchema } from '../validators/coupon.validator.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalOrders,
      totalCustomers,
      totalProducts,
      pendingOrders,
      salesAggregate,
      lowStockProducts,
      recentOrders,
      categoriesCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      prisma.order.aggregate({
        where: { paymentStatus: 'PAID' },
        _sum: { totalAmount: true },
      }),
      prisma.product.findMany({
        where: { stock: { lte: 5 }, status: 'ACTIVE' },
        take: 8,
        include: { brand: true, category: true },
      }),
      prisma.order.findMany({
        take: 6,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
    ]);

    const totalSales = salesAggregate._sum.totalAmount || 0;

    // Generate monthly sales trend data for Recharts
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const salesTrends = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1).map((m, idx) => {
      const baseRev = 45000 + idx * 12500 + Math.floor(Math.random() * 10000);
      return {
        month: m,
        revenue: totalSales > 0 ? Math.round(totalSales * (0.12 + idx * 0.04)) : baseRev,
        orders: Math.round(totalOrders * (0.12 + idx * 0.04)) || 15 + idx * 5,
      };
    });

    const categoryDistribution = categoriesCount.map((c) => ({
      name: c.name,
      value: c._count.products,
    }));

    return sendSuccess(res, {
      kpis: {
        totalSales,
        totalOrders,
        totalCustomers,
        totalProducts,
        pendingOrders,
        lowStockCount: lowStockProducts.length,
        averageOrderValue: totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0,
      },
      salesTrends,
      categoryDistribution,
      lowStockProducts,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminGetProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const search = (req.query.search as string)?.trim();
    const status = req.query.status as string;

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
        { brand: { name: { contains: search } } },
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
        },
      }),
    ]);

    return sendSuccess(res, products, 'Products retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

export async function adminCreateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createProductSchema.parse(req.body);
    const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + `-${Date.now().toString().slice(-4)}`;

    const product = await prisma.product.create({
      data: {
        name: data.name,
        slug,
        brandId: data.brandId,
        categoryId: data.categoryId,
        description: data.description,
        shortDescription: data.shortDescription,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        sku: data.sku,
        stock: data.stock,
        lowStockThreshold: data.lowStockThreshold,
        status: data.status,
        gender: data.gender,
        weight: data.weight,
        volume: data.volume,
        ingredients: data.ingredients,
        benefits: data.benefits,
        howToUse: data.howToUse,
        countryOfOrigin: data.countryOfOrigin,
        expiryInformation: data.expiryInformation,
        isFeatured: data.isFeatured,
        isBestSeller: data.isBestSeller,
        isNewArrival: data.isNewArrival,
        isTrending: data.isTrending,
        badge: data.badge,
        images: {
          create: data.images.map((img, idx) => ({
            url: img.url,
            altText: img.altText || data.name,
            sortOrder: img.sortOrder || idx,
            isPrimary: img.isPrimary || idx === 0,
          })),
        },
        skinTypes: data.skinTypeIds?.length
          ? {
              create: data.skinTypeIds.map((id) => ({ skinTypeId: id })),
            }
          : undefined,
        skinConcerns: data.skinConcernIds?.length
          ? {
              create: data.skinConcernIds.map((id) => ({ skinConcernId: id })),
            }
          : undefined,
      },
      include: {
        brand: true,
        category: true,
        images: true,
      },
    });

    return sendSuccess(res, product, 'Product created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) return sendError(res, 'Product not found', 404);

    const updateData: any = {
      name: body.name,
      price: body.price !== undefined ? parseFloat(body.price) : undefined,
      compareAtPrice: body.compareAtPrice !== undefined ? (body.compareAtPrice ? parseFloat(body.compareAtPrice) : null) : undefined,
      sku: body.sku,
      stock: body.stock !== undefined ? parseInt(body.stock, 10) : undefined,
      status: body.status,
      description: body.description,
      shortDescription: body.shortDescription,
      brandId: body.brandId,
      categoryId: body.categoryId,
      gender: body.gender,
      ingredients: body.ingredients,
      benefits: body.benefits,
      howToUse: body.howToUse,
      isFeatured: body.isFeatured,
      isBestSeller: body.isBestSeller,
      badge: body.badge,
    };

    // If images array is provided, replace existing images with the new set
    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
      updateData.images = {
        create: body.images.map((img: any, idx: number) => ({
          url: img.url,
          altText: img.altText || body.name || existing.name,
          sortOrder: img.sortOrder ?? idx,
          isPrimary: img.isPrimary ?? (idx === 0),
        })),
      };
    }

    // Update product core fields
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: { brand: true, category: true, images: true },
    });

    return sendSuccess(res, updated, 'Product updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteProduct(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;

    // Check if order items exist
    const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } });
    if (orderItemsCount > 0) {
      // Soft archive to protect order records
      await prisma.product.update({
        where: { id },
        data: { status: 'ARCHIVED' },
      });
      return sendSuccess(res, null, 'Product archived (referenced in existing orders)');
    }

    await prisma.product.delete({ where: { id } });
    return sendSuccess(res, null, 'Product deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function adminGetOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as string;
    const search = req.query.search as string;

    const where: any = {};
    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search } },
        { customerName: { contains: search } },
        { customerPhone: { contains: search } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: true,
          timeline: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
    ]);

    return sendSuccess(res, orders, 'Orders retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status, note, trackingNumber, courierName, estimatedDelivery } = updateOrderStatusSchema.parse(req.body);

    const order: any = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) return sendError(res, 'Order not found', 404);

    // If order is cancelled and wasn't before, restore product stock
    if (status === 'CANCELLED' && order.orderStatus !== 'CANCELLED') {
      for (const item of order.items) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    const updated = await prisma.$transaction(async (tx) => {
      const ord = await tx.order.update({
        where: { id },
        data: {
          orderStatus: status,
          trackingNumber: trackingNumber || order.trackingNumber,
          courierName: courierName || order.courierName,
          estimatedDelivery: estimatedDelivery || order.estimatedDelivery,
          paymentStatus: status === 'DELIVERED' && order.paymentMethod === 'COD' ? 'PAID' : order.paymentStatus,
        },
      });

      await tx.orderTimeline.create({
        data: {
          orderId: id,
          status,
          note: note || `Order status updated to ${status}`,
        },
      });

      return ord;
    });

    return sendSuccess(res, updated, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
}

export async function adminGetCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        preferredSkinType: true,
        createdAt: true,
        _count: { select: { orders: true, reviews: true } },
        orders: { select: { totalAmount: true } },
      },
    });

    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      preferredSkinType: c.preferredSkinType,
      createdAt: c.createdAt,
      ordersCount: c._count.orders,
      reviewsCount: c._count.reviews,
      totalSpent: c.orders.reduce((sum, o) => sum + o.totalAmount, 0),
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function adminGetReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await prisma.review.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, name: true, slug: true } },
        images: true,
      },
    });
    return sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
}

export async function adminModerateReview(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { status, isFeatured } = req.body;

    const review = await prisma.review.update({
      where: { id },
      data: {
        status: status || undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
      },
    });

    return sendSuccess(res, review, 'Review updated');
  } catch (error) {
    next(error);
  }
}

export async function adminGetCoupons(req: Request, res: Response, next: NextFunction) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, coupons);
  } catch (error) {
    next(error);
  }
}

export async function adminCreateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCouponSchema.parse(req.body);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        startDate: new Date(data.startDate),
        expiryDate: new Date(data.expiryDate),
        usageLimit: data.usageLimit,
        isActive: data.isActive,
      },
    });

    return sendSuccess(res, coupon, 'Coupon created', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateCMSSection(req: Request, res: Response, next: NextFunction) {
  try {
    const sectionKey = req.params.sectionKey as string;
    const { title, subtitle, content, imageUrl, linkUrl, buttonText, isActive } = req.body;

    const section = await prisma.homepageSection.upsert({
      where: { sectionKey },
      update: {
        title,
        subtitle,
        content,
        imageUrl,
        linkUrl,
        buttonText,
        isActive,
      },
      create: {
        sectionKey,
        title,
        subtitle,
        content,
        imageUrl,
        linkUrl,
        buttonText,
        isActive: isActive !== false,
      },
    });

    return sendSuccess(res, section, 'Section updated');
  } catch (error) {
    next(error);
  }
}
