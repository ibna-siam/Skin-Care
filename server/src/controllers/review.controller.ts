import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function submitReview(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, 'You must be logged in to submit a review', 401);
    }

    const { productId, rating, title, comment, images } = req.body;

    if (!productId || !rating || !title || !comment) {
      return sendError(res, 'Rating, title, and comment are required', 400);
    }

    // Check if user purchased the product
    const orderWithProduct = await prisma.order.findFirst({
      where: {
        userId: req.user.userId,
        orderStatus: { in: ['DELIVERED', 'SHIPPED', 'CONFIRMED'] },
        items: {
          some: { productId },
        },
      },
    });

    const isVerifiedPurchase = !!orderWithProduct;

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.user.userId,
        userName: user?.name || 'Customer',
        userAvatar: user?.avatarUrl,
        rating: Math.min(5, Math.max(1, rating)),
        title,
        comment,
        isVerifiedPurchase,
        status: 'APPROVED', // Auto-approved for verified or admin moderation
        images: images?.length
          ? {
              create: images.map((url: string) => ({ url })),
            }
          : undefined,
      },
    });

    // Update Product average rating and review count
    const stats = await prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Number((stats._avg.rating || 5).toFixed(1)),
        reviewCount: stats._count.rating,
      },
    });

    return sendSuccess(res, review, 'Review submitted successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function getProductReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const productId = req.params.productId as string;
    if (!productId) return sendError(res, 'Product ID required', 400);

    const reviews = await prisma.review.findMany({
      where: {
        productId,
        status: 'APPROVED',
      },
      include: {
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const stats = await prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return sendSuccess(res, {
      reviews,
      averageRating: stats._avg?.rating || 5.0,
      totalReviews: (stats._count && typeof stats._count === 'object' && 'rating' in stats._count ? stats._count.rating : reviews.length),
    });
  } catch (error) {
    next(error);
  }
}

export async function getFeaturedReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const reviews = await prisma.review.findMany({
      where: {
        status: 'APPROVED',
        isFeatured: true,
      },
      take: 8,
      include: {
        product: { select: { id: true, name: true, slug: true } },
        images: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return sendSuccess(res, reviews);
  } catch (error) {
    next(error);
  }
}


