import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = (req.headers['x-session-id'] as string) || (req.query.sessionId as string);

    if (!userId && !sessionId) {
      return sendSuccess(res, { items: [], subtotal: 0, count: 0 });
    }

    const cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                images: { where: { isPrimary: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!cart) {
      return sendSuccess(res, { items: [], subtotal: 0, count: 0 });
    }

    const items = cart.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * item.quantity,
      product: {
        id: item.product.id,
        name: item.product.name,
        slug: item.product.slug,
        price: item.product.price,
        compareAtPrice: item.product.compareAtPrice,
        stock: item.product.stock,
        brand: item.product.brand?.name,
        image: item.product.images[0]?.url || '',
      },
    }));

    const subtotal = items.reduce((acc, curr) => acc + curr.totalPrice, 0);
    const count = items.reduce((acc, curr) => acc + curr.quantity, 0);

    return sendSuccess(res, { id: cart.id, items, subtotal, count });
  } catch (error) {
    next(error);
  }
}

export async function addToCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = (req.headers['x-session-id'] as string) || req.body.sessionId;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return sendError(res, 'Product ID is required', 400);
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      return sendError(res, 'Product unavailable', 404);
    }

    if (product.stock < quantity) {
      return sendError(res, `Only ${product.stock} items available in stock`, 400);
    }

    // Find or create cart
    let cart = await prisma.cart.findFirst({
      where: userId ? { userId } : { sessionId },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId: userId || null,
          sessionId: sessionId || null,
        },
      });
    }

    // Upsert CartItem
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      if (newQuantity > product.stock) {
        return sendError(res, `Cannot add more than ${product.stock} units in stock`, 400);
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity, unitPrice: product.price },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          unitPrice: product.price,
        },
      });
    }

    return sendSuccess(res, null, 'Product added to cart');
  } catch (error) {
    next(error);
  }
}

export async function updateCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { quantity } = req.body;

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id } });
      return sendSuccess(res, null, 'Item removed from cart');
    }

    const cartItem: any = await prisma.cartItem.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!cartItem) {
      return sendError(res, 'Item not found in cart', 404);
    }

    if (quantity > cartItem.product.stock) {
      return sendError(res, `Only ${cartItem.product.stock} items available in stock`, 400);
    }

    await prisma.cartItem.update({
      where: { id },
      data: { quantity },
    });

    return sendSuccess(res, null, 'Cart updated');
  } catch (error) {
    next(error);
  }
}

export async function removeCartItem(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.cartItem.deleteMany({ where: { id } });
    return sendSuccess(res, null, 'Item removed');
  } catch (error) {
    next(error);
  }
}

export async function clearCart(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user?.userId;
    const sessionId = (req.headers['x-session-id'] as string) || req.body?.sessionId || (req.query?.sessionId as string);

    if (userId || sessionId) {
      const cart = await prisma.cart.findFirst({
        where: userId ? { userId } : { sessionId },
      });
      if (cart) {
        await prisma.cartItem.deleteMany({
          where: { cartId: cart.id },
        });
      }
    }

    return sendSuccess(res, { items: [], subtotal: 0, count: 0 }, 'Cart cleared successfully');
  } catch (error) {
    next(error);
  }
}
