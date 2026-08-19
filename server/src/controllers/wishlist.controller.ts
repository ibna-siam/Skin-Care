import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.userId },
      include: {
        items: {
          orderBy: { addedAt: 'desc' },
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

    const items = wishlist?.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      addedAt: item.addedAt,
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
    })) || [];

    return sendSuccess(res, items);
  } catch (error) {
    next(error);
  }
}

export async function toggleWishlist(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, 'Please log in to manage your wishlist', 401);
    }

    const { productId } = req.body;
    if (!productId) {
      return sendError(res, 'Product ID is required', 400);
    }

    let wishlist = await prisma.wishlist.findUnique({
      where: { userId: req.user.userId },
    });

    if (!wishlist) {
      wishlist = await prisma.wishlist.create({
        data: { userId: req.user.userId },
      });
    }

    const existing = await prisma.wishlistItem.findUnique({
      where: {
        wishlistId_productId: {
          wishlistId: wishlist.id,
          productId,
        },
      },
    });

    if (existing) {
      await prisma.wishlistItem.delete({ where: { id: existing.id } });
      return sendSuccess(res, { inWishlist: false }, 'Removed from wishlist');
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId,
        },
      });
      return sendSuccess(res, { inWishlist: true }, 'Added to wishlist');
    }
  } catch (error) {
    next(error);
  }
}
