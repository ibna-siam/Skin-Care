import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: {
          select: { products: { where: { status: 'ACTIVE' } } },
        },
      },
    });

    const formatted = categories.map((c) => ({
      ...c,
      productCount: c._count.products,
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { products: { where: { status: 'ACTIVE' } } },
        },
      },
    });

    const formatted = brands.map((b) => ({
      ...b,
      productCount: b._count.products,
    }));

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getSkinTaxonomies(req: Request, res: Response, next: NextFunction) {
  try {
    const [skinTypes, skinConcerns] = await Promise.all([
      prisma.skinType.findMany({ orderBy: { name: 'asc' } }),
      prisma.skinConcern.findMany({ orderBy: { name: 'asc' } }),
    ]);

    return sendSuccess(res, { skinTypes, skinConcerns });
  } catch (error) {
    next(error);
  }
}
