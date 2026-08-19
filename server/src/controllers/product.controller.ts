import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { productQuerySchema } from '../validators/product.validator.js';

export async function getProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const query = productQuerySchema.parse(req.query);
    const {
      page,
      limit,
      category,
      brand,
      skinType,
      skinConcern,
      gender,
      minPrice,
      maxPrice,
      rating,
      availability,
      sort,
      search,
      isBestSeller,
      isFeatured,
    } = query;

    const skip = (page - 1) * limit;

    const where: any = {
      status: 'ACTIVE',
    };

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { brand: { name: { contains: search } } },
        { category: { name: { contains: search } } },
      ];
    }

    if (category) {
      where.category = { slug: category };
    }

    if (brand) {
      const brandSlugs = brand.split(',');
      where.brand = { slug: { in: brandSlugs } };
    }

    if (skinType) {
      const skinTypeSlugs = skinType.split(',');
      where.skinTypes = {
        some: {
          skinType: { slug: { in: skinTypeSlugs } },
        },
      };
    }

    if (skinConcern) {
      const skinConcernSlugs = skinConcern.split(',');
      where.skinConcerns = {
        some: {
          skinConcern: { slug: { in: skinConcernSlugs } },
        },
      };
    }

    if (gender && gender !== 'ALL') {
      where.gender = { in: [gender, 'ALL', 'UNISEX'] };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    if (rating !== undefined) {
      where.averageRating = { gte: rating };
    }

    if (availability === 'in_stock') {
      where.stock = { gt: 0 };
    }

    if (isBestSeller === 'true') {
      where.isBestSeller = true;
    }

    if (isFeatured === 'true') {
      where.isFeatured = true;
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'best_selling':
        orderBy = [{ isBestSeller: 'desc' }, { reviewCount: 'desc' }];
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'discount':
        orderBy = { compareAtPrice: 'desc' };
        break;
      case 'featured':
      default:
        orderBy = [{ isFeatured: 'desc' }, { isBestSeller: 'desc' }, { averageRating: 'desc' }];
        break;
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          brand: true,
          category: true,
          images: {
            orderBy: { sortOrder: 'asc' },
          },
          skinTypes: {
            include: { skinType: true },
          },
          skinConcerns: {
            include: { skinConcern: true },
          },
        },
      }),
    ]);

    const formatted = products.map((p) => ({
      ...p,
      skinTypes: p.skinTypes.map((st) => st.skinType),
      skinConcerns: p.skinConcerns.map((sc) => sc.skinConcern),
    }));

    return sendSuccess(res, formatted, 'Products retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

export async function getProductBySlug(req: Request, res: Response, next: NextFunction) {
  try {
    const slug = req.params.slug as string;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        images: {
          orderBy: { sortOrder: 'asc' },
        },
        variants: true,
        skinTypes: {
          include: { skinType: true },
        },
        skinConcerns: {
          include: { skinConcern: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            images: true,
          },
        },
      },
    });

    if (!product) {
      return sendError(res, 'Product not found', 404);
    }

    // Related products in same category
    const relatedProducts = await prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: product.id },
        status: 'ACTIVE',
      },
      take: 4,
      include: {
        brand: true,
        images: { where: { isPrimary: true } },
      },
    });

    // Frequently bought together
    const frequentlyBought = await prisma.product.findMany({
      where: {
        id: { not: product.id },
        status: 'ACTIVE',
        isBestSeller: true,
      },
      take: 2,
      include: {
        brand: true,
        images: { where: { isPrimary: true } },
      },
    });

    const formatted = {
      ...product,
      skinTypes: product.skinTypes.map((st: any) => st.skinType),
      skinConcerns: product.skinConcerns.map((sc: any) => sc.skinConcern),
      relatedProducts,
      frequentlyBought,
    };

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function getSearchSuggestions(req: Request, res: Response, next: NextFunction) {
  try {
    const q = (req.query.q as string)?.trim() || '';
    if (!q || q.length < 2) {
      return sendSuccess(res, { products: [], brands: [], categories: [] });
    }

    const [products, brands, categories] = await Promise.all([
      prisma.product.findMany({
        where: {
          name: { contains: q },
          status: 'ACTIVE',
        },
        take: 5,
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          images: { where: { isPrimary: true }, take: 1 },
        },
      }),
      prisma.brand.findMany({
        where: { name: { contains: q } },
        take: 3,
        select: { id: true, name: true, slug: true },
      }),
      prisma.category.findMany({
        where: { name: { contains: q } },
        take: 3,
        select: { id: true, name: true, slug: true },
      }),
    ]);

    return sendSuccess(res, { products, brands, categories });
  } catch (error) {
    next(error);
  }
}
