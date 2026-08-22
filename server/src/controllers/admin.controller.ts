import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { createProductSchema } from '../validators/product.validator.js';
import { updateOrderStatusSchema } from '../validators/order.validator.js';
import { createCouponSchema } from '../validators/coupon.validator.js';
import { EmailNotificationService } from '../notifications/email.service.js';
import { SMSNotificationService } from '../notifications/sms.service.js';
import { CourierService } from '../courier/CourierService.js';

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
  try {
    const range = (req.query.range as string) || '30d';
    const customStart = req.query.startDate as string;
    const customEnd = req.query.endDate as string;

    const now = new Date();
    let currentStart = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();
    let grouping: 'hour' | 'day' | 'month' = 'day';

    if (range === 'today') {
      currentStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const diff = now.getTime() - currentStart.getTime();
      prevEnd = new Date(currentStart.getTime());
      prevStart = new Date(currentStart.getTime() - (24 * 60 * 60 * 1000));
      grouping = 'hour';
    } else if (range === 'yesterday') {
      const yesterdayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 0, 0, 0);
      const yesterdayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59, 999);
      currentStart = yesterdayStart;
      prevEnd = yesterdayStart;
      prevStart = new Date(yesterdayStart.getTime() - (24 * 60 * 60 * 1000));
      grouping = 'hour';
    } else if (range === '7d') {
      currentStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(currentStart.getTime());
      prevStart = new Date(currentStart.getTime() - 7 * 24 * 60 * 60 * 1000);
      grouping = 'day';
    } else if (range === '90d') {
      currentStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(currentStart.getTime());
      prevStart = new Date(currentStart.getTime() - 90 * 24 * 60 * 60 * 1000);
      grouping = 'day';
    } else if (range === 'this_year') {
      currentStart = new Date(now.getFullYear(), 0, 1);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      grouping = 'month';
    } else if (range === 'custom' && customStart && customEnd) {
      currentStart = new Date(customStart);
      const customEndTime = new Date(customEnd);
      const diff = customEndTime.getTime() - currentStart.getTime();
      prevEnd = new Date(currentStart.getTime());
      prevStart = new Date(currentStart.getTime() - diff);
      grouping = diff > 60 * 24 * 60 * 60 * 1000 ? 'month' : 'day';
    } else {
      // Default: 30 days
      currentStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevEnd = new Date(currentStart.getTime());
      prevStart = new Date(currentStart.getTime() - 30 * 24 * 60 * 60 * 1000);
      grouping = 'day';
    }

    // Parallel execution of all required metrics
    const [
      currentOrders,
      prevOrders,
      currentSalesAgg,
      prevSalesAgg,
      currentCustomers,
      prevCustomers,
      allTimeOrdersCount,
      allTimeCustomersCount,
      allTimeProductsCount,
      pendingOrdersCount,
      lowStockProducts,
      recentOrders,
      recentReviews,
      recentUsers,
      categoriesCount,
      ordersInRange,
      topOrderItems,
    ] = await Promise.all([
      // Current period order count
      prisma.order.count({
        where: { createdAt: { gte: currentStart } },
      }),
      // Prev period order count
      prisma.order.count({
        where: { createdAt: { gte: prevStart, lt: prevEnd } },
      }),
      // Current period sales
      prisma.order.aggregate({
        where: { createdAt: { gte: currentStart }, orderStatus: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      // Prev period sales
      prisma.order.aggregate({
        where: { createdAt: { gte: prevStart, lt: prevEnd }, orderStatus: { not: 'CANCELLED' } },
        _sum: { totalAmount: true },
      }),
      // Current period customers
      prisma.user.count({
        where: { role: 'CUSTOMER', createdAt: { gte: currentStart } },
      }),
      // Prev period customers
      prisma.user.count({
        where: { role: 'CUSTOMER', createdAt: { gte: prevStart, lt: prevEnd } },
      }),
      // All time totals
      prisma.order.count(),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count({ where: { orderStatus: 'PENDING' } }),
      // Low stock products
      prisma.product.findMany({
        where: { stock: { lte: 10 }, status: 'ACTIVE' },
        take: 8,
        orderBy: { stock: 'asc' },
        include: { brand: true, category: true },
      }),
      // Recent orders
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { items: true },
      }),
      // Recent reviews
      prisma.review.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { name: true } } },
      }),
      // Recent customer signups
      prisma.user.findMany({
        where: { role: 'CUSTOMER' },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { id: true, name: true, email: true, createdAt: true },
      }),
      // Category count
      prisma.category.findMany({
        include: { _count: { select: { products: true } } },
      }),
      // Orders in range for time-series chart
      prisma.order.findMany({
        where: { createdAt: { gte: currentStart }, orderStatus: { not: 'CANCELLED' } },
        select: { totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'asc' },
      }),
      // Top selling items
      prisma.orderItem.groupBy({
        by: ['productId'],
        where: { order: { orderStatus: { not: 'CANCELLED' } } },
        _sum: { quantity: true, subtotal: true },
        _count: { orderId: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    // Populate top products details
    const topProductIds = topOrderItems.map((item) => item.productId);
    const topProductsInfo = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
      include: { brand: true, category: true, images: { take: 1 } },
    });

    const topProducts = topOrderItems.map((item) => {
      const p = topProductsInfo.find((prod) => prod.id === item.productId);
      return {
        id: item.productId,
        name: p?.name || 'Unknown Product',
        sku: p?.sku || 'N/A',
        price: p?.price || 0,
        stock: p?.stock ?? 0,
        averageRating: p?.averageRating || 5.0,
        unitsSold: item._sum.quantity || 0,
        revenue: item._sum.subtotal || 0,
        ordersCount: item._count.orderId || 0,
        imageUrl: p?.images?.[0]?.url || null,
        brand: p?.brand?.name || '',
      };
    });

    // Compute KPI percentage changes
    const curSales = currentSalesAgg._sum.totalAmount || 0;
    const prevSales = prevSalesAgg._sum.totalAmount || 0;
    const salesChange = prevSales > 0 ? ((curSales - prevSales) / prevSales) * 100 : curSales > 0 ? 100 : 0;

    const ordersChange = prevOrders > 0 ? ((currentOrders - prevOrders) / prevOrders) * 100 : currentOrders > 0 ? 100 : 0;

    const customersChange = prevCustomers > 0 ? ((currentCustomers - prevCustomers) / prevCustomers) * 100 : currentCustomers > 0 ? 100 : 0;

    const curAov = currentOrders > 0 ? Math.round(curSales / currentOrders) : 0;
    const prevAov = prevOrders > 0 ? Math.round(prevSales / prevOrders) : 0;
    const aovChange = prevAov > 0 ? ((curAov - prevAov) / prevAov) * 100 : 0;

    // Time-series buckets
    const timeSeriesMap: Record<string, { label: string; revenue: number; orders: number }> = {};

    if (grouping === 'hour') {
      for (let h = 0; h < 24; h += 2) {
        const hourStr = `${h.toString().padStart(2, '0')}:00`;
        timeSeriesMap[hourStr] = { label: hourStr, revenue: 0, orders: 0 };
      }
      ordersInRange.forEach((ord) => {
        const h = new Date(ord.createdAt).getHours();
        const roundedHour = Math.floor(h / 2) * 2;
        const key = `${roundedHour.toString().padStart(2, '0')}:00`;
        if (timeSeriesMap[key]) {
          timeSeriesMap[key].revenue += ord.totalAmount;
          timeSeriesMap[key].orders += 1;
        }
      });
    } else if (grouping === 'month') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      monthNames.forEach((m) => {
        timeSeriesMap[m] = { label: m, revenue: 0, orders: 0 };
      });
      ordersInRange.forEach((ord) => {
        const m = monthNames[new Date(ord.createdAt).getMonth()];
        if (timeSeriesMap[m]) {
          timeSeriesMap[m].revenue += ord.totalAmount;
          timeSeriesMap[m].orders += 1;
        }
      });
    } else {
      // Group by day
      const daysCount = Math.min(Math.ceil((now.getTime() - currentStart.getTime()) / (24 * 60 * 60 * 1000)), 90);
      for (let d = daysCount - 1; d >= 0; d--) {
        const dateObj = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
        const dayStr = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const key = dateObj.toISOString().slice(0, 10);
        timeSeriesMap[key] = { label: dayStr, revenue: 0, orders: 0 };
      }
      ordersInRange.forEach((ord) => {
        const key = new Date(ord.createdAt).toISOString().slice(0, 10);
        if (timeSeriesMap[key]) {
          timeSeriesMap[key].revenue += ord.totalAmount;
          timeSeriesMap[key].orders += 1;
        }
      });
    }

    const salesTrends = Object.values(timeSeriesMap);

    const categoryDistribution = categoriesCount.map((c) => ({
      name: c.name,
      value: c._count.products,
    }));

    // Synthesize real activity feed
    const activityFeed: Array<{
      id: string;
      type: 'order' | 'review' | 'user' | 'inventory';
      title: string;
      description: string;
      timestamp: Date;
    }> = [];

    recentOrders.forEach((o) => {
      activityFeed.push({
        id: `ord-${o.id}`,
        type: 'order',
        title: `New Order #${o.orderNumber}`,
        description: `${o.customerName} placed an order for ৳${o.totalAmount.toLocaleString()} (${o.paymentMethod})`,
        timestamp: o.createdAt,
      });
    });

    recentReviews.forEach((r) => {
      activityFeed.push({
        id: `rev-${r.id}`,
        type: 'review',
        title: `New Review for ${r.product.name}`,
        description: `${r.userName} rated ${r.rating}★: "${r.title}"`,
        timestamp: r.createdAt,
      });
    });

    recentUsers.forEach((u) => {
      activityFeed.push({
        id: `usr-${u.id}`,
        type: 'user',
        title: `Customer Registered`,
        description: `${u.name} joined via ${u.email}`,
        timestamp: u.createdAt,
      });
    });

    lowStockProducts.slice(0, 3).forEach((p) => {
      activityFeed.push({
        id: `stk-${p.id}`,
        type: 'inventory',
        title: `Low Stock Warning`,
        description: `${p.name} has only ${p.stock} units left in stock`,
        timestamp: p.updatedAt,
      });
    });

    activityFeed.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return sendSuccess(res, {
      range,
      kpis: {
        totalSales: curSales,
        salesChange: Math.round(salesChange * 10) / 10,
        totalOrders: currentOrders,
        ordersChange: Math.round(ordersChange * 10) / 10,
        totalCustomers: currentCustomers,
        customersChange: Math.round(customersChange * 10) / 10,
        averageOrderValue: curAov,
        aovChange: Math.round(aovChange * 10) / 10,
        allTimeSales: (await prisma.order.aggregate({ _sum: { totalAmount: true } }))._sum.totalAmount || 0,
        allTimeOrders: allTimeOrdersCount,
        allTimeCustomers: allTimeCustomersCount,
        activeProducts: allTimeProductsCount,
        pendingOrders: pendingOrdersCount,
        lowStockCount: lowStockProducts.length,
      },
      salesTrends,
      categoryDistribution,
      topProducts,
      lowStockProducts,
      recentOrders,
      activityFeed: activityFeed.slice(0, 10),
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
    const categoryId = req.query.categoryId as string;
    const brandId = req.query.brandId as string;
    const stockLevel = req.query.stockLevel as string;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { sku: { contains: search, mode: 'insensitive' } },
        { brand: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (categoryId && categoryId !== 'ALL') {
      where.categoryId = categoryId;
    }
    if (brandId && brandId !== 'ALL') {
      where.brandId = brandId;
    }

    if (stockLevel === 'OUT_OF_STOCK') {
      where.stock = { lte: 0 };
    } else if (stockLevel === 'CRITICAL') {
      where.stock = { gt: 0, lte: 3 };
    } else if (stockLevel === 'LOW_STOCK') {
      where.stock = { gt: 3, lte: 10 };
    } else if (stockLevel === 'HEALTHY') {
      where.stock = { gt: 10 };
    }

    const orderBy: any = {};
    if (sortBy === 'price') {
      orderBy.price = sortOrder;
    } else if (sortBy === 'stock') {
      orderBy.stock = sortOrder;
    } else if (sortBy === 'name') {
      orderBy.name = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [total, products, statusCounts, outOfStockCount, lowStockCount] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          brand: true,
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          skinTypes: { include: { skinType: true } },
          skinConcerns: { include: { skinConcern: true } },
        },
      }),
      prisma.product.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.product.count({ where: { stock: { lte: 0 } } }),
      prisma.product.count({ where: { stock: { gt: 0, lte: 10 } } }),
    ]);

    const countsMap: Record<string, number> = {};
    statusCounts.forEach((sc) => {
      countsMap[sc.status] = sc._count.id;
    });

    const formattedProducts = products.map((p) => ({
      ...p,
      skinTypes: p.skinTypes.map((st) => st.skinType),
      skinConcerns: p.skinConcerns.map((sc) => sc.skinConcern),
    }));

    return sendSuccess(res, formattedProducts, 'Products retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      countsByStatus: countsMap,
      outOfStockCount,
      lowStockCount,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateProductStock(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { stock, lowStockThreshold } = req.body;

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stock: stock !== undefined ? parseInt(stock, 10) : undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold, 10) : undefined,
      },
    });

    return sendSuccess(res, updated, 'Stock updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function adminBulkUpdateProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const { productIds, status } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0 || !status) {
      return sendError(res, 'productIds array and status are required', 400);
    }

    const updated = await prisma.product.updateMany({
      where: { id: { in: productIds } },
      data: { status },
    });

    return sendSuccess(res, updated, `Updated ${productIds.length} products to ${status}`);
  } catch (error) {
    next(error);
  }
}

export async function adminExportProducts(req: Request, res: Response, next: NextFunction) {
  try {
    const products = await prisma.product.findMany({
      orderBy: { name: 'asc' },
      include: { brand: true, category: true },
    });

    const headers = [
      'Product ID',
      'SKU',
      'Product Name',
      'Brand',
      'Category',
      'Price (BDT)',
      'Compare At Price (BDT)',
      'Stock Level',
      'Low Stock Threshold',
      'Status',
      'Gender',
      'Rating',
      'Reviews Count',
    ];

    const rows = products.map((p) => [
      `"${p.id}"`,
      `"${p.sku}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.brand?.name || ''}"`,
      `"${p.category?.name || ''}"`,
      p.price,
      p.compareAtPrice || '',
      p.stock,
      p.lowStockThreshold,
      `"${p.status}"`,
      `"${p.gender}"`,
      p.averageRating,
      p.reviewCount,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="skincare-products-inventory-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvContent);
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
        skinTypes: { include: { skinType: true } },
        skinConcerns: { include: { skinConcern: true } },
      },
    });

    const formatted = {
      ...product,
      skinTypes: product.skinTypes.map((st) => st.skinType),
      skinConcerns: product.skinConcerns.map((sc) => sc.skinConcern),
    };

    return sendSuccess(res, formatted, 'Product created successfully', 201);
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
      lowStockThreshold: body.lowStockThreshold !== undefined ? parseInt(body.lowStockThreshold, 10) : undefined,
      status: body.status,
      description: body.description,
      shortDescription: body.shortDescription,
      brandId: body.brandId,
      categoryId: body.categoryId,
      gender: body.gender,
      ingredients: body.ingredients,
      benefits: body.benefits,
      howToUse: body.howToUse,
      countryOfOrigin: body.countryOfOrigin,
      expiryInformation: body.expiryInformation,
      weight: body.weight,
      volume: body.volume,
      isFeatured: body.isFeatured !== undefined ? Boolean(body.isFeatured) : undefined,
      isBestSeller: body.isBestSeller !== undefined ? Boolean(body.isBestSeller) : undefined,
      isNewArrival: body.isNewArrival !== undefined ? Boolean(body.isNewArrival) : undefined,
      isTrending: body.isTrending !== undefined ? Boolean(body.isTrending) : undefined,
      badge: body.badge,
    };

    // If images array is provided, replace existing images with the new set
    if (Array.isArray(body.images) && body.images.length > 0) {
      await prisma.productImage.deleteMany({
        where: { productId: id },
      });
      updateData.images = {
        create: body.images.map((img: any, idx: number) => ({
          url: typeof img === 'string' ? img : img.url,
          altText: img.altText || body.name || existing.name,
          sortOrder: img.sortOrder ?? idx,
          isPrimary: img.isPrimary ?? (idx === 0),
        })),
      };
    }

    // Sync Skin Types
    if (Array.isArray(body.skinTypeIds)) {
      await prisma.productSkinType.deleteMany({ where: { productId: id } });
      if (body.skinTypeIds.length > 0) {
        await prisma.productSkinType.createMany({
          data: body.skinTypeIds.map((skinTypeId: string) => ({
            productId: id,
            skinTypeId,
          })),
        });
      }
    }

    // Sync Skin Concerns
    if (Array.isArray(body.skinConcernIds)) {
      await prisma.productSkinConcern.deleteMany({ where: { productId: id } });
      if (body.skinConcernIds.length > 0) {
        await prisma.productSkinConcern.createMany({
          data: body.skinConcernIds.map((skinConcernId: string) => ({
            productId: id,
            skinConcernId,
          })),
        });
      }
    }

    // Update product core fields
    const updated = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        skinTypes: { include: { skinType: true } },
        skinConcerns: { include: { skinConcern: true } },
      },
    });

    const formatted = {
      ...updated,
      skinTypes: updated.skinTypes.map((st) => st.skinType),
      skinConcerns: updated.skinConcerns.map((sc) => sc.skinConcern),
    };

    return sendSuccess(res, formatted, 'Product updated successfully');
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
    const paymentStatus = req.query.paymentStatus as string;
    const paymentMethod = req.query.paymentMethod as string;
    const search = (req.query.search as string)?.trim();
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }
    if (paymentStatus && paymentStatus !== 'ALL') {
      where.paymentStatus = paymentStatus;
    }
    if (paymentMethod && paymentMethod !== 'ALL') {
      where.paymentMethod = paymentMethod;
    }
    if (search) {
      where.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search, mode: 'insensitive' } },
        { customerEmail: { contains: search, mode: 'insensitive' } },
        { trackingNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    const orderBy: any = {};
    if (sortBy === 'totalAmount') {
      orderBy.totalAmount = sortOrder;
    } else if (sortBy === 'orderStatus') {
      orderBy.orderStatus = sortOrder;
    } else {
      orderBy.createdAt = sortOrder;
    }

    const [total, orders, statusCounts] = await Promise.all([
      prisma.order.count({ where }),
      prisma.order.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          items: true,
          timeline: { orderBy: { createdAt: 'desc' } },
          payments: { orderBy: { createdAt: 'desc' }, take: 1 },
          shipments: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
      // Status breakdown for tab badges
      prisma.order.groupBy({
        by: ['orderStatus'],
        _count: { id: true },
      }),
    ]);

    const countsMap: Record<string, number> = {};
    statusCounts.forEach((sc) => {
      countsMap[sc.orderStatus] = sc._count.id;
    });

    return sendSuccess(res, orders, 'Orders retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      countsByStatus: countsMap,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminGetOrderDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                slug: true,
                stock: true,
                images: { take: 1 },
              },
            },
          },
        },
        timeline: { orderBy: { createdAt: 'asc' } },
        payments: { orderBy: { createdAt: 'desc' } },
        shipments: { orderBy: { createdAt: 'desc' } },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            preferredSkinType: true,
            createdAt: true,
            _count: { select: { orders: true, reviews: true } },
          },
        },
      },
    });

    if (!order) return sendError(res, 'Order not found', 404);
    return sendSuccess(res, order, 'Order detail retrieved');
  } catch (error) {
    next(error);
  }
}

export async function adminBulkUpdateOrderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderIds, status, note } = req.body;
    if (!Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return sendError(res, 'orderIds array and status are required', 400);
    }

    const updatedOrders = await prisma.$transaction(async (tx) => {
      // Update all matching orders
      const updated = await tx.order.updateMany({
        where: { id: { in: orderIds } },
        data: {
          orderStatus: status,
          paymentStatus: status === 'DELIVERED' ? 'PAID' : undefined,
        },
      });

      // Insert timeline entry for each updated order
      await tx.orderTimeline.createMany({
        data: orderIds.map((id: string) => ({
          orderId: id,
          status,
          note: note || `Bulk status update to ${status}`,
        })),
      });

      return updated;
    });

    return sendSuccess(res, updatedOrders, `Updated ${orderIds.length} orders to ${status}`);
  } catch (error) {
    next(error);
  }
}

export async function adminExportOrders(req: Request, res: Response, next: NextFunction) {
  try {
    const status = req.query.status as string;
    const where: any = {};
    if (status && status !== 'ALL') {
      where.orderStatus = status;
    }

    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000,
      include: { items: true },
    });

    // CSV format
    const headers = [
      'Order Number',
      'Date',
      'Customer Name',
      'Customer Phone',
      'Customer Email',
      'Division',
      'District',
      'Area',
      'Full Address',
      'Total Amount (BDT)',
      'Payment Method',
      'Payment Status',
      'Order Status',
      'Items Count',
      'Courier Name',
      'Tracking Number',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toISOString().slice(0, 19)}"`,
      `"${o.customerName.replace(/"/g, '""')}"`,
      `"${o.customerPhone}"`,
      `"${o.customerEmail}"`,
      `"${o.division}"`,
      `"${o.district}"`,
      `"${o.area}"`,
      `"${o.fullAddress.replace(/"/g, '""')}"`,
      o.totalAmount,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      o.items.length,
      `"${o.courierName || ''}"`,
      `"${o.trackingNumber || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="skincare-orders-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvContent);
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
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const search = (req.query.search as string)?.trim();
    const segment = (req.query.segment as string) || 'ALL';
    const skinType = (req.query.skinType as string) || 'ALL';
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

    const where: any = { role: 'CUSTOMER' };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (skinType && skinType !== 'ALL') {
      where.preferredSkinType = skinType;
    }

    // Fetch all customers matching basic where to compute segmentation
    const allMatchingCustomers = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        preferredSkinType: true,
        createdAt: true,
        addresses: { where: { isDefault: true }, take: 1 },
        orders: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
            orderStatus: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        reviews: { select: { id: true } },
        wishlist: { select: { items: { select: { id: true } } } },
        cart: { select: { items: { select: { id: true } } } },
      },
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Compute RFM and segment tags for each customer
    const formattedCustomers = allMatchingCustomers.map((c) => {
      const nonCancelledOrders = c.orders.filter((o) => o.orderStatus !== 'CANCELLED');
      const totalSpent = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);
      const ordersCount = nonCancelledOrders.length;
      const lastOrder = nonCancelledOrders[0]?.createdAt || null;
      const lastOrderDate = lastOrder ? new Date(lastOrder) : null;
      const aov = ordersCount > 0 ? Math.round(totalSpent / ordersCount) : 0;

      // Assign Segment
      let customerSegment: 'VIP' | 'REPEAT' | 'NEW' | 'INACTIVE' | 'PROSPECT' = 'PROSPECT';

      if (totalSpent >= 10000 || ordersCount >= 4) {
        customerSegment = 'VIP';
      } else if (ordersCount >= 2) {
        customerSegment = 'REPEAT';
      } else if (new Date(c.createdAt) >= thirtyDaysAgo) {
        customerSegment = 'NEW';
      } else if (lastOrderDate && lastOrderDate < sixtyDaysAgo) {
        customerSegment = 'INACTIVE';
      } else if (ordersCount === 0) {
        customerSegment = 'PROSPECT';
      }

      return {
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        preferredSkinType: c.preferredSkinType,
        createdAt: c.createdAt,
        ordersCount,
        totalSpent,
        averageOrderValue: aov,
        lastOrderDate,
        segment: customerSegment,
        city: c.addresses[0]?.district || c.addresses[0]?.division || '—',
        wishlistCount: c.wishlist?.items.length || 0,
        cartCount: c.cart?.items.length || 0,
        reviewsCount: c.reviews.length,
      };
    });

    // Compute segment counts across all customers
    let vipCount = 0;
    let repeatCount = 0;
    let newCount = 0;
    let inactiveCount = 0;
    let prospectCount = 0;
    let totalRevenue = 0;

    formattedCustomers.forEach((c) => {
      totalRevenue += c.totalSpent;
      if (c.segment === 'VIP') vipCount++;
      else if (c.segment === 'REPEAT') repeatCount++;
      else if (c.segment === 'NEW') newCount++;
      else if (c.segment === 'INACTIVE') inactiveCount++;
      else if (c.segment === 'PROSPECT') prospectCount++;
    });

    // Filter by selected segment if not ALL
    let filtered = formattedCustomers;
    if (segment && segment !== 'ALL') {
      filtered = formattedCustomers.filter((c) => c.segment === segment);
    }

    // Sort
    filtered.sort((a, b) => {
      if (sortBy === 'totalSpent') {
        return sortOrder === 'asc' ? a.totalSpent - b.totalSpent : b.totalSpent - a.totalSpent;
      }
      if (sortBy === 'ordersCount') {
        return sortOrder === 'asc' ? a.ordersCount - b.ordersCount : b.ordersCount - a.ordersCount;
      }
      if (sortBy === 'name') {
        return sortOrder === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name);
      }
      // default createdAt
      return sortOrder === 'asc'
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    const total = filtered.length;
    const paginated = filtered.slice((page - 1) * limit, page * limit);

    return sendSuccess(res, paginated, 'Customers retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      segmentCounts: {
        ALL: formattedCustomers.length,
        VIP: vipCount,
        REPEAT: repeatCount,
        NEW: newCount,
        INACTIVE: inactiveCount,
        PROSPECT: prospectCount,
      },
      metrics: {
        totalCustomers: formattedCustomers.length,
        totalLifetimeValue: totalRevenue,
        averageCLV: formattedCustomers.length > 0 ? Math.round(totalRevenue / formattedCustomers.length) : 0,
        repeatRate: formattedCustomers.length > 0 ? Math.round(((vipCount + repeatCount) / formattedCustomers.length) * 100) : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function adminGetCustomerDetail(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        addresses: { orderBy: { isDefault: 'desc' } },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: { items: true },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          include: { product: { select: { name: true, slug: true } } },
        },
        wishlist: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, price: true, stock: true, images: { take: 1 } },
                },
              },
            },
          },
        },
        cart: {
          include: {
            items: {
              include: {
                product: {
                  select: { id: true, name: true, price: true, stock: true, images: { take: 1 } },
                },
              },
            },
          },
        },
        searchHistories: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!user) return sendError(res, 'Customer not found', 404);

    const nonCancelledOrders = user.orders.filter((o) => o.orderStatus !== 'CANCELLED');
    const totalSpent = nonCancelledOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return sendSuccess(res, {
      ...user,
      totalSpent,
      ordersCount: nonCancelledOrders.length,
      averageOrderValue: nonCancelledOrders.length > 0 ? Math.round(totalSpent / nonCancelledOrders.length) : 0,
    });
  } catch (error) {
    next(error);
  }
}

export async function adminExportCustomers(req: Request, res: Response, next: NextFunction) {
  try {
    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      orderBy: { createdAt: 'desc' },
      include: {
        addresses: { where: { isDefault: true }, take: 1 },
        orders: {
          where: { orderStatus: { not: 'CANCELLED' } },
          select: { totalAmount: true },
        },
      },
    });

    const headers = [
      'Customer ID',
      'Name',
      'Email',
      'Phone',
      'Preferred Skin Type',
      'Division',
      'District',
      'Area',
      'Full Address',
      'Orders Count',
      'Total Spent (BDT)',
      'Registered At',
    ];

    const rows = customers.map((c) => {
      const totalSpent = c.orders.reduce((sum, o) => sum + o.totalAmount, 0);
      const addr = c.addresses[0];
      return [
        `"${c.id}"`,
        `"${c.name.replace(/"/g, '""')}"`,
        `"${c.email}"`,
        `"${c.phone || ''}"`,
        `"${c.preferredSkinType || ''}"`,
        `"${addr?.division || ''}"`,
        `"${addr?.district || ''}"`,
        `"${addr?.area || ''}"`,
        `"${(addr?.fullAddress || '').replace(/"/g, '""')}"`,
        c.orders.length,
        totalSpent,
        `"${new Date(c.createdAt).toISOString().slice(0, 10)}"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="skincare-customers-crm-${new Date().toISOString().slice(0, 10)}.csv"`);
    return res.send(csvContent);
  } catch (error) {
    next(error);
  }
}

export async function adminGetReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '20', 10);
    const status = req.query.status as string;
    const rating = req.query.rating as string;
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (status && status !== 'ALL') {
      where.status = status;
    }
    if (rating && rating !== 'ALL') {
      where.rating = parseInt(rating, 10);
    }
    if (search) {
      where.OR = [
        { userName: { contains: search, mode: 'insensitive' } },
        { comment: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { product: { name: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [total, reviews, statusCounts] = await Promise.all([
      prisma.review.count({ where }),
      prisma.review.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          product: { select: { id: true, name: true, slug: true, images: { take: 1 } } },
          images: true,
        },
      }),
      prisma.review.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
    ]);

    const countsMap: Record<string, number> = { ALL: 0, PENDING: 0, APPROVED: 0, REJECTED: 0 };
    statusCounts.forEach((sc) => {
      countsMap[sc.status] = sc._count.id;
      countsMap.ALL += sc._count.id;
    });

    return sendSuccess(res, reviews, 'Reviews retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      countsByStatus: countsMap,
    });
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
      include: { product: true },
    });

    // If review is approved/rejected, update product's average rating & review count
    if (status) {
      const approvedReviews = await prisma.review.findMany({
        where: { productId: review.productId, status: 'APPROVED' },
        select: { rating: true },
      });

      const count = approvedReviews.length;
      const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

      await prisma.product.update({
        where: { id: review.productId },
        data: {
          averageRating: Math.round(avg * 10) / 10,
          reviewCount: count,
        },
      });
    }

    return sendSuccess(res, review, 'Review updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const review = await prisma.review.delete({ where: { id } });

    // Update product rating stats
    const approvedReviews = await prisma.review.findMany({
      where: { productId: review.productId, status: 'APPROVED' },
      select: { rating: true },
    });

    const count = approvedReviews.length;
    const avg = count > 0 ? approvedReviews.reduce((sum, r) => sum + r.rating, 0) / count : 0;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        averageRating: Math.round(avg * 10) / 10,
        reviewCount: count,
      },
    });

    return sendSuccess(res, null, 'Review deleted');
  } catch (error) {
    next(error);
  }
}

export async function adminGetCoupons(req: Request, res: Response, next: NextFunction) {
  try {
    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const now = new Date();
    const formatted = coupons.map((c) => {
      let status = 'ACTIVE';
      if (!c.isActive) status = 'DISABLED';
      else if (new Date(c.expiryDate) < now) status = 'EXPIRED';

      return {
        ...c,
        computedStatus: status,
      };
    });

    return sendSuccess(res, formatted);
  } catch (error) {
    next(error);
  }
}

export async function adminCreateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCouponSchema.parse(req.body);

    const coupon = await prisma.coupon.create({
      data: {
        code: data.code.toUpperCase().trim(),
        type: data.type,
        value: data.value,
        minOrderAmount: data.minOrderAmount,
        maxDiscountAmount: data.maxDiscountAmount,
        startDate: new Date(data.startDate),
        expiryDate: new Date(data.expiryDate),
        usageLimit: data.usageLimit,
        isActive: data.isActive !== false,
      },
    });

    return sendSuccess(res, coupon, 'Coupon created', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        code: body.code ? body.code.toUpperCase().trim() : undefined,
        type: body.type,
        value: body.value !== undefined ? parseFloat(body.value) : undefined,
        minOrderAmount: body.minOrderAmount !== undefined ? parseFloat(body.minOrderAmount) : undefined,
        maxDiscountAmount: body.maxDiscountAmount !== undefined ? (body.maxDiscountAmount ? parseFloat(body.maxDiscountAmount) : null) : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        expiryDate: body.expiryDate ? new Date(body.expiryDate) : undefined,
        usageLimit: body.usageLimit !== undefined ? (body.usageLimit ? parseInt(body.usageLimit, 10) : null) : undefined,
        isActive: body.isActive !== undefined ? body.isActive : undefined,
      },
    });

    return sendSuccess(res, coupon, 'Coupon updated');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.coupon.delete({ where: { id } });
    return sendSuccess(res, null, 'Coupon deleted');
  } catch (error) {
    next(error);
  }
}

export async function adminGetCMSSections(req: Request, res: Response, next: NextFunction) {
  try {
    let sections = await prisma.homepageSection.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Fetch MediaAsset slot overrides
    const mediaSlots = await prisma.mediaAsset.findMany({
      where: {
        slot: { in: ['homepage.hero', 'homepage.men_skincare', 'homepage.women_skincare', 'homepage.skin_guide_card', 'homepage.promo_banner'] },
      },
    });

    const slotMap: Record<string, string> = {};
    mediaSlots.forEach((m) => {
      if (m.slot && m.url) slotMap[m.slot] = m.url;
    });

    sections = sections.map((s) => {
      if (s.sectionKey === 'hero' && slotMap['homepage.hero']) {
        return { ...s, imageUrl: slotMap['homepage.hero'] };
      }
      return s;
    });

    return sendSuccess(res, sections);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateCMSSection(req: Request, res: Response, next: NextFunction) {
  try {
    const sectionKey = req.params.sectionKey as string;
    const { title, subtitle, content, imageUrl, linkUrl, buttonText, isActive, sortOrder } = req.body;

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
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
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
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : 0,
      },
    });

    // Sync to MediaAsset and Banner if hero section is updated
    if (sectionKey === 'hero' && imageUrl) {
      try {
        const existingSlot = await prisma.mediaAsset.findFirst({ where: { slot: 'homepage.hero' } });
        if (existingSlot) {
          await prisma.mediaAsset.update({
            where: { id: existingSlot.id },
            data: { url: imageUrl, title },
          });
        } else {
          await prisma.mediaAsset.create({
            data: {
              slot: 'homepage.hero',
              title: title || 'Homepage Main Hero Banner',
              url: imageUrl,
              section: 'HOMEPAGE',
            },
          });
        }

        await prisma.banner.updateMany({
          where: { position: 'HERO' },
          data: { imageUrl, title: title || undefined },
        });
      } catch (e) {}
    }

    return sendSuccess(res, section, 'Section updated');
  } catch (error) {
    next(error);
  }
}

export async function adminGetBanners(req: Request, res: Response, next: NextFunction) {
  try {
    let banners = await prisma.banner.findMany({
      orderBy: { sortOrder: 'asc' },
    });

    // Fetch active MediaAsset slots
    const mediaSlots = await prisma.mediaAsset.findMany({
      where: {
        slot: {
          in: ['homepage.hero', 'homepage.promo_banner', 'skin_guide.hero'],
        },
      },
    });

    const slotMap: Record<string, string> = {};
    mediaSlots.forEach((m) => {
      if (m.slot && m.url) slotMap[m.slot] = m.url;
    });

    // If no banners exist yet, seed initial banners from MediaAssets or defaults
    if (banners.length === 0) {
      const heroUrl = slotMap['homepage.hero'] || 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1600&auto=format&fit=crop';
      const promoUrl = slotMap['homepage.promo_banner'] || 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop';
      const skinGuideUrl = slotMap['skin_guide.hero'] || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop';

      const initialBanners = [
        {
          title: 'Original Skincare for Real Skin',
          subtitle: 'Trusted brands. 100% authentic dermatological solutions.',
          imageUrl: heroUrl,
          linkUrl: '/shop',
          buttonText: 'Shop Now',
          position: 'HERO',
          isActive: true,
          sortOrder: 1,
        },
        {
          title: 'Authentic Korean Sunscreens & Serums',
          subtitle: 'Broad-spectrum SPF 50+ PA++++ lightweight formulations.',
          imageUrl: promoUrl,
          linkUrl: '/shop',
          buttonText: 'Explore Sun Protection',
          position: 'PROMO',
          isActive: true,
          sortOrder: 2,
        },
        {
          title: 'Skin Diagnostic Routine Finder',
          subtitle: 'Answer 4 simple questions for tailored dermatologist routines.',
          imageUrl: skinGuideUrl,
          linkUrl: '/skin-guide',
          buttonText: 'Start Routine Quiz',
          position: 'SKIN_GUIDE',
          isActive: true,
          sortOrder: 3,
        },
      ];

      for (const b of initialBanners) {
        await prisma.banner.create({ data: b });
      }

      banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    } else {
      // Synchronize banners with latest MediaAsset images
      banners = banners.map((b) => {
        if (b.position === 'HERO' && slotMap['homepage.hero']) {
          return { ...b, imageUrl: slotMap['homepage.hero'] };
        }
        if (b.position === 'PROMO' && slotMap['homepage.promo_banner']) {
          return { ...b, imageUrl: slotMap['homepage.promo_banner'] };
        }
        if (b.position === 'SKIN_GUIDE' && slotMap['skin_guide.hero']) {
          return { ...b, imageUrl: slotMap['skin_guide.hero'] };
        }
        return b;
      });
    }

    return sendSuccess(res, banners);
  } catch (error) {
    next(error);
  }
}

export async function adminCreateBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, subtitle, imageUrl, linkUrl, position, isActive, sortOrder } = req.body;
    const banner = await prisma.banner.create({
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        position: position || 'HERO',
        isActive: isActive !== false,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
      },
    });

    // Synchronize to MediaAsset
    try {
      const slotKey =
        position === 'HERO' ? 'homepage.hero' : position === 'PROMO' ? 'homepage.promo_banner' : position === 'SKIN_GUIDE' ? 'skin_guide.hero' : null;
      if (slotKey && imageUrl) {
        const existing = await prisma.mediaAsset.findFirst({ where: { slot: slotKey } });
        if (existing) {
          await prisma.mediaAsset.update({ where: { id: existing.id }, data: { url: imageUrl, title } });
        } else {
          await prisma.mediaAsset.create({
            data: { slot: slotKey, title: title || slotKey, url: imageUrl, section: 'HOMEPAGE' },
          });
        }
      }
    } catch (e) {}

    return sendSuccess(res, banner, 'Banner created', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { title, subtitle, imageUrl, linkUrl, position, isActive, sortOrder } = req.body;
    const banner = await prisma.banner.update({
      where: { id },
      data: {
        title,
        subtitle,
        imageUrl,
        linkUrl,
        position,
        isActive,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
      },
    });

    // Synchronize to MediaAsset
    try {
      const targetPos = position || banner.position;
      const targetUrl = imageUrl || banner.imageUrl;
      const slotKey =
        targetPos === 'HERO' ? 'homepage.hero' : targetPos === 'PROMO' ? 'homepage.promo_banner' : targetPos === 'SKIN_GUIDE' ? 'skin_guide.hero' : null;
      if (slotKey && targetUrl) {
        const existing = await prisma.mediaAsset.findFirst({ where: { slot: slotKey } });
        if (existing) {
          await prisma.mediaAsset.update({ where: { id: existing.id }, data: { url: targetUrl, title } });
        } else {
          await prisma.mediaAsset.create({
            data: { slot: slotKey, title: title || slotKey, url: targetUrl, section: 'HOMEPAGE' },
          });
        }
      }
    } catch (e) {}

    return sendSuccess(res, banner, 'Banner updated');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteBanner(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.banner.delete({ where: { id } });
    return sendSuccess(res, null, 'Banner deleted');
  } catch (error) {
    next(error);
  }
}

// ----------------- AUTOMATION WORKFLOWS & SCHEDULER -----------------
import { automationService } from '../services/automation.service.js';

export async function adminGetAutomations(req: Request, res: Response, next: NextFunction) {
  try {
    const workflows = await automationService.getWorkflows();
    return sendSuccess(res, workflows);
  } catch (error) {
    next(error);
  }
}

export async function adminToggleAutomation(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;
    const updated = await automationService.toggleWorkflow(id, isActive !== false);
    return sendSuccess(res, updated, 'Workflow status updated');
  } catch (error) {
    next(error);
  }
}

export async function adminRunAutomation(req: Request, res: Response, next: NextFunction) {
  try {
    const triggerType = req.body.triggerType as string;
    if (triggerType) {
      const result = await automationService.runWorkflow(triggerType);
      return sendSuccess(res, result, `Executed automation for ${triggerType}`);
    } else {
      const result = await automationService.runAllAutomations();
      return sendSuccess(res, result, 'Executed all active automation workflows');
    }
  } catch (error) {
    next(error);
  }
}

export async function adminGetAutomationLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '30', 10);
    const triggerType = req.query.triggerType as string;
    const status = req.query.status as string;

    const result = await automationService.getLogs({ page, limit, triggerType, status });
    return sendSuccess(res, result.data, 'Automation logs retrieved', 200, result.meta);
  } catch (error) {
    next(error);
  }
}

// ----------------- NOTIFICATIONS -----------------

export async function adminGetNotifications(req: Request, res: Response, next: NextFunction) {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      include: { user: { select: { name: true, email: true } } },
    });
    return sendSuccess(res, notifications);
  } catch (error) {
    next(error);
  }
}

export async function adminSendBroadcastNotification(req: Request, res: Response, next: NextFunction) {
  try {
    const { title, message, type } = req.body;
    if (!title || !message) return sendError(res, 'Title and message are required', 400);

    const customers = await prisma.user.findMany({
      where: { role: 'CUSTOMER' },
      select: { id: true },
    });

    const createPayload = customers.map((c) => ({
      userId: c.id,
      title,
      message,
      type: type || 'PROMOTION',
    }));

    await prisma.notification.createMany({
      data: createPayload,
    });

    return sendSuccess(res, null, `Broadcasted notification to ${customers.length} customers`, 201);
  } catch (error) {
    next(error);
  }
}

// ----------------- CATEGORIES MANAGEMENT -----------------

export async function adminGetCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        parent: { select: { id: true, name: true, slug: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
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

export async function adminCreateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug, description, imageUrl, parentId, sortOrder, isFeatured } = req.body;
    if (!name || !slug) return sendError(res, 'Category name and slug are required', 400);

    const category = await prisma.category.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        imageUrl: imageUrl || null,
        parentId: parentId || null,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        isFeatured: isFeatured === true,
      },
      include: { parent: true },
    });

    return sendSuccess(res, category, 'Category created', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, slug, description, imageUrl, parentId, sortOrder, isFeatured } = req.body;

    const category = await prisma.category.update({
      where: { id },
      data: {
        name: name?.trim(),
        slug: slug?.trim().toLowerCase(),
        description: description !== undefined ? description?.trim() || null : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl || null : undefined,
        parentId: parentId !== undefined ? parentId || null : undefined,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
      },
      include: { parent: true },
    });

    return sendSuccess(res, category, 'Category updated');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) {
      return sendError(res, `Cannot delete category with ${productCount} active products. Reassign or remove products first.`, 400);
    }

    await prisma.category.delete({ where: { id } });
    return sendSuccess(res, null, 'Category deleted');
  } catch (error) {
    next(error);
  }
}

// ----------------- BRANDS MANAGEMENT -----------------

export async function adminGetBrands(req: Request, res: Response, next: NextFunction) {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
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

export async function adminCreateBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, slug, description, logoUrl, country, website, isFeatured } = req.body;
    if (!name || !slug) return sendError(res, 'Brand name and slug are required', 400);

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        slug: slug.trim().toLowerCase(),
        description: description?.trim() || null,
        logoUrl: logoUrl || null,
        country: country?.trim() || null,
        website: website?.trim() || null,
        isFeatured: isFeatured === true,
      },
    });

    return sendSuccess(res, brand, 'Brand created', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { name, slug, description, logoUrl, country, website, isFeatured } = req.body;

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: name?.trim(),
        slug: slug?.trim().toLowerCase(),
        description: description !== undefined ? description?.trim() || null : undefined,
        logoUrl: logoUrl !== undefined ? logoUrl || null : undefined,
        country: country !== undefined ? country?.trim() || null : undefined,
        website: website !== undefined ? website?.trim() || null : undefined,
        isFeatured: isFeatured !== undefined ? isFeatured : undefined,
      },
    });

    return sendSuccess(res, brand, 'Brand updated');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteBrand(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const productCount = await prisma.product.count({ where: { brandId: id } });
    if (productCount > 0) {
      return sendError(res, `Cannot delete brand with ${productCount} active products. Reassign or remove products first.`, 400);
    }

    await prisma.brand.delete({ where: { id } });
    return sendSuccess(res, null, 'Brand deleted');
  } catch (error) {
    next(error);
  }
}

// ----------------- MARKETING CAMPAIGNS -----------------

export async function adminGetCampaigns(req: Request, res: Response, next: NextFunction) {
  try {
    const campaigns = await prisma.marketingCampaign.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, campaigns);
  } catch (error) {
    next(error);
  }
}

export async function adminCreateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const { name, description, type, status, audience, subject, message, couponCode, imageUrl, startDate, endDate } = req.body;
    if (!name || !message) return sendError(res, 'Campaign name and message are required', 400);

    const campaign = await prisma.marketingCampaign.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type || 'PROMOTION',
        status: status || 'DRAFT',
        audience: audience || 'ALL',
        subject: subject?.trim() || null,
        message: message.trim(),
        couponCode: couponCode?.trim() || null,
        imageUrl: imageUrl || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
      },
    });

    return sendSuccess(res, campaign, 'Campaign created', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const body = req.body;

    const campaign = await prisma.marketingCampaign.update({
      where: { id },
      data: {
        name: body.name?.trim(),
        description: body.description !== undefined ? body.description?.trim() || null : undefined,
        type: body.type,
        status: body.status,
        audience: body.audience,
        subject: body.subject !== undefined ? body.subject?.trim() || null : undefined,
        message: body.message?.trim(),
        couponCode: body.couponCode !== undefined ? body.couponCode?.trim() || null : undefined,
        imageUrl: body.imageUrl !== undefined ? body.imageUrl || null : undefined,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : undefined,
      },
    });

    return sendSuccess(res, campaign, 'Campaign updated');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteCampaign(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.marketingCampaign.delete({ where: { id } });
    return sendSuccess(res, null, 'Campaign deleted');
  } catch (error) {
    next(error);
  }
}

// ----------------- NEWSLETTER SUBSCRIBERS -----------------

export async function adminGetNewsletters(req: Request, res: Response, next: NextFunction) {
  try {
    const page = parseInt(req.query.page as string || '1', 10);
    const limit = parseInt(req.query.limit as string || '50', 10);
    const search = (req.query.search as string)?.trim();

    const where: any = {};
    if (search) {
      where.email = { contains: search };
    }

    const [total, subscribers] = await Promise.all([
      prisma.newsletterSubscriber.count({ where }),
      prisma.newsletterSubscriber.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { subscribedAt: 'desc' },
      }),
    ]);

    return sendSuccess(res, subscribers, 'Subscribers retrieved', 200, {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    next(error);
  }
}

export async function adminExportNewsletters(req: Request, res: Response, next: NextFunction) {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: 'desc' },
    });

    const headers = 'ID,Email,SubscribedAt\n';
    const rows = subscribers
      .map((s) => `"${s.id}","${s.email}","${s.subscribedAt.toISOString()}"`)
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=subscribers_${Date.now()}.csv`);
    return res.status(200).send(headers + rows);
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteNewsletter(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.newsletterSubscriber.delete({ where: { id } });
    return sendSuccess(res, null, 'Subscriber removed');
  } catch (error) {
    next(error);
  }
}

// ----------------- SKIN GUIDE QUIZ MANAGEMENT -----------------

export async function adminGetSkinQuiz(req: Request, res: Response, next: NextFunction) {
  try {
    const questions = await prisma.skinQuizQuestion.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
      },
    });
    return sendSuccess(res, questions);
  } catch (error) {
    next(error);
  }
}

export async function adminCreateSkinQuizQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const { question, subtitle, category, sortOrder, options } = req.body;
    if (!question || !category) return sendError(res, 'Question and category are required', 400);

    const created = await prisma.skinQuizQuestion.create({
      data: {
        question: question.trim(),
        subtitle: subtitle?.trim() || null,
        category,
        sortOrder: sortOrder ? parseInt(sortOrder, 10) : 0,
        options: options?.length
          ? {
              create: options.map((opt: any, idx: number) => ({
                optionText: opt.optionText.trim(),
                valueKey: opt.valueKey.trim().toLowerCase(),
                sortOrder: opt.sortOrder ?? idx,
              })),
            }
          : undefined,
      },
      include: { options: true },
    });

    return sendSuccess(res, created, 'Quiz question created', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateSkinQuizQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { question, subtitle, category, sortOrder } = req.body;

    const updated = await prisma.skinQuizQuestion.update({
      where: { id },
      data: {
        question: question?.trim(),
        subtitle: subtitle !== undefined ? subtitle?.trim() || null : undefined,
        category,
        sortOrder: sortOrder !== undefined ? parseInt(sortOrder, 10) : undefined,
      },
      include: { options: true },
    });

    return sendSuccess(res, updated, 'Quiz question updated');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteSkinQuizQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.skinQuizQuestion.delete({ where: { id } });
    return sendSuccess(res, null, 'Quiz question deleted');
  } catch (error) {
    next(error);
  }
}

// ----------------- ADVANCED ANALYTICS ENGINE -----------------

export async function adminGetAnalyticsOverview(req: Request, res: Response, next: NextFunction) {
  try {
    const days = parseInt(req.query.days as string || '30', 10);
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [orders, productsCount, customersCount, reviews] = await Promise.all([
      prisma.order.findMany({
        where: { createdAt: { gte: startDate } },
        select: {
          id: true,
          totalAmount: true,
          paymentStatus: true,
          paymentMethod: true,
          orderStatus: true,
          createdAt: true,
        },
      }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.review.findMany({
        where: { createdAt: { gte: startDate } },
        select: { rating: true },
      }),
    ]);

    const totalRevenue = orders
      .filter((o) => o.paymentStatus === 'PAID')
      .reduce((sum, o) => sum + o.totalAmount, 0);

    const totalOrders = orders.length;
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 5.0;

    // Payment methods breakdown
    const paymentBreakdown: Record<string, number> = {};
    orders.forEach((o) => {
      paymentBreakdown[o.paymentMethod] = (paymentBreakdown[o.paymentMethod] || 0) + 1;
    });

    // Daily revenue distribution
    const dailyMap: Record<string, { revenue: number; orders: number }> = {};
    orders.forEach((o) => {
      const day = o.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { revenue: 0, orders: 0 };
      if (o.paymentStatus === 'PAID') dailyMap[day].revenue += o.totalAmount;
      dailyMap[day].orders += 1;
    });

    const timeline = Object.entries(dailyMap)
      .map(([date, val]) => ({ date, ...val }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return sendSuccess(res, {
      totalRevenue,
      totalOrders,
      aov,
      productsCount,
      customersCount,
      avgRating,
      paymentBreakdown,
      timeline,
    });
  } catch (error) {
    next(error);
  }
}

// ----------------- OPERATIONS & SETTINGS -----------------

export async function adminGetStoreSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.storeSetting.findMany({
      orderBy: { group: 'asc' },
    });
    return sendSuccess(res, settings);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateStoreSetting(req: Request, res: Response, next: NextFunction) {
  try {
    const { key, value, group } = req.body;
    if (!key || value === undefined) return sendError(res, 'Setting key and value are required', 400);

    const setting = await prisma.storeSetting.upsert({
      where: { key },
      update: { value: String(value), group: group || 'GENERAL' },
      create: { key, value: String(value), group: group || 'GENERAL' },
    });

    return sendSuccess(res, setting, 'Setting updated');
  } catch (error) {
    next(error);
  }
}

export async function adminGetActivityLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return sendSuccess(res, logs);
  } catch (error) {
    next(error);
  }
}

export async function adminGetUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return sendSuccess(res, users);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { role, isActive } = req.body;

    const user = await prisma.user.update({
      where: { id },
      data: {
        role: role || undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    return sendSuccess(res, user, 'User updated');
  } catch (error) {
    next(error);
  }
}

// ----------------- REVIEWS MODERATION & CREATION -----------------

export async function adminCreateManualReview(req: Request, res: Response, next: NextFunction) {
  try {
    const { productId, userName, rating, title, comment, isVerifiedPurchase = true, isFeatured = false, images = [] } = req.body;
    if (!productId || !userName || !rating || !title || !comment) {
      return sendError(res, 'Product ID, customer name, rating, title, and comment are required', 400);
    }

    // Default to first admin user if not attached
    const adminUserId = req.user?.userId || (await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } }))?.id;
    if (!adminUserId) return sendError(res, 'System admin profile required', 400);

    const review = await prisma.review.create({
      data: {
        productId,
        userId: adminUserId,
        userName,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        title,
        comment,
        isVerifiedPurchase: Boolean(isVerifiedPurchase),
        isFeatured: Boolean(isFeatured),
        status: 'APPROVED',
        images: images.length ? { create: images.map((url: string) => ({ url })) } : undefined,
      },
      include: { product: true, images: true },
    });

    // Update Product statistics
    const stats = await prisma.review.aggregate({
      where: { productId, status: 'APPROVED' },
      _avg: { rating: true },
      _count: { rating: true },
    });
    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: Number(((stats._avg && stats._avg.rating) || 5).toFixed(1)),
        reviewCount: (stats._count && typeof stats._count === 'object' && 'rating' in stats._count ? stats._count.rating : 1),
      },
    });

    return sendSuccess(res, review, 'Manual verified review created', 201);
  } catch (error) {
    next(error);
  }
}

// ----------------- COURIER SHIPMENTS (SteadFast & Pathao) -----------------

export async function adminCreateCourierShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id as string;
    const { courierName = 'Steadfast' } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) return sendError(res, 'Order not found', 404);

    const provider = await CourierService.getProvider(courierName);
    const amountToCollect = order.paymentStatus === 'PAID' ? 0 : order.totalAmount;
    const itemDesc = order.items.map((i) => `${i.productName} (x${i.quantity})`).join(', ');

    const result = await provider.createShipment({
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.fullAddress,
      cityDistrict: order.district,
      amountToCollect,
      itemDescription: itemDesc,
      notes: order.notes || '',
    });

    if (!result.success && result.status !== 'UNCONFIGURED') {
      return sendError(res, result.message || 'Courier API shipment creation failed', 400);
    }

    // Save or update Shipment record
    const trackingCode = result.trackingCode || `TRK-${Date.now().toString().slice(-6)}`;
    const shipment = await prisma.shipment.upsert({
      where: { trackingNumber: trackingCode },
      update: {
        courierName: result.courierName || courierName,
        consignmentId: result.consignmentId,
        courierFee: result.courierFee,
        shippingStatus: 'CREATED',
        rawResponse: JSON.stringify(result.rawResponse || {}),
        shippedAt: new Date(),
      },
      create: {
        orderId: order.id,
        courierName: result.courierName || courierName,
        trackingNumber: trackingCode,
        consignmentId: result.consignmentId,
        courierFee: result.courierFee,
        shippingStatus: 'CREATED',
        rawResponse: JSON.stringify(result.rawResponse || {}),
        shippedAt: new Date(),
      },
    });

    // Update order status to SHIPPED and record timeline
    await prisma.$transaction([
      prisma.order.update({
        where: { id: order.id },
        data: {
          orderStatus: 'SHIPPED',
          trackingNumber: trackingCode,
          courierName: result.courierName || courierName,
        },
      }),
      prisma.orderTimeline.create({
        data: {
          orderId: order.id,
          status: 'SHIPPED',
          note: `Handed over to ${result.courierName || courierName}. Tracking Code: ${trackingCode}`,
        },
      }),
    ]);

    // Dispatch SMS notification to customer
    SMSNotificationService.sendOrderShipped({
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      orderNumber: order.orderNumber,
      trackingCode,
      courierName: result.courierName || courierName,
    }).catch(() => {});

    return sendSuccess(res, { shipment, courierResult: result }, `Shipment created with ${result.courierName}`);
  } catch (error) {
    next(error);
  }
}

export async function adminTrackCourierShipment(req: Request, res: Response, next: NextFunction) {
  try {
    const orderId = req.params.id as string;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { shipments: { take: 1, orderBy: { createdAt: 'desc' } } },
    });

    if (!order) return sendError(res, 'Order not found', 404);

    const trackingCode = order.trackingNumber || order.shipments[0]?.trackingNumber;
    if (!trackingCode) {
      return sendError(res, 'No tracking code found for this order', 400);
    }

    const courierName = order.courierName || order.shipments[0]?.courierName || 'Steadfast';
    const provider = await CourierService.getProvider(courierName);
    const tracking = await provider.trackShipment(trackingCode);

    return sendSuccess(res, { tracking, orderNumber: order.orderNumber, trackingCode });
  } catch (error) {
    next(error);
  }
}

// ----------------- IP BLOCKING SYSTEM -----------------
import { refreshBlockedIPCache } from '../middleware/ipBlocker.js';

export async function adminGetBlockedIPs(req: Request, res: Response, next: NextFunction) {
  try {
    const blockedList = await prisma.blockedIP.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return sendSuccess(res, blockedList);
  } catch (error) {
    next(error);
  }
}

export async function adminAddBlockedIP(req: Request, res: Response, next: NextFunction) {
  try {
    const { ipAddress, reason } = req.body;
    if (!ipAddress) return sendError(res, 'IP Address is required', 400);

    const cleanIp = String(ipAddress).trim();
    const blocked = await prisma.blockedIP.upsert({
      where: { ipAddress: cleanIp },
      update: { reason: reason || 'Restricted by admin', isActive: true },
      create: { ipAddress: cleanIp, reason: reason || 'Restricted by admin', isActive: true },
    });

    await refreshBlockedIPCache();
    return sendSuccess(res, blocked, `IP ${cleanIp} added to blocklist`, 201);
  } catch (error) {
    next(error);
  }
}

export async function adminToggleBlockedIP(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    const { isActive } = req.body;

    const blocked = await prisma.blockedIP.update({
      where: { id },
      data: { isActive: Boolean(isActive) },
    });

    await refreshBlockedIPCache();
    return sendSuccess(res, blocked, `IP status updated`);
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteBlockedIP(req: Request, res: Response, next: NextFunction) {
  try {
    const id = req.params.id as string;
    await prisma.blockedIP.delete({ where: { id } });
    await refreshBlockedIPCache();
    return sendSuccess(res, null, 'IP removed from blocklist');
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateStoreSettingsBatch(req: Request, res: Response, next: NextFunction) {
  try {
    const { settings } = req.body; // Array of { key, value, group }
    if (!Array.isArray(settings)) return sendError(res, 'Array of settings required', 400);

    const sanitizedMap = new Map<string, { key: string; value: string; group: string }>();

    for (const item of settings) {
      if (item && typeof item === 'object' && item.key) {
        const cleanKey = String(item.key).trim();
        if (cleanKey.length > 0) {
          sanitizedMap.set(cleanKey, {
            key: cleanKey,
            value: item.value !== undefined && item.value !== null ? String(item.value) : '',
            group: item.group ? String(item.group).trim().toUpperCase() : 'GENERAL',
          });
        }
      }
    }

    const cleanItems = Array.from(sanitizedMap.values());
    if (cleanItems.length === 0) {
      return sendSuccess(res, [], 'No settings to update');
    }

    const results = await prisma.$transaction(
      cleanItems.map((s) =>
        prisma.storeSetting.upsert({
          where: { key: s.key },
          update: { value: s.value, group: s.group },
          create: { key: s.key, value: s.value, group: s.group },
        })
      )
    );

    return sendSuccess(res, results, 'Store settings updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function adminGetIntegrationSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const settings = await prisma.storeSetting.findMany({
      orderBy: { key: 'asc' },
    });

    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return sendSuccess(res, {
      settings: settingsMap,
      raw: settings,
    }, 'Integration settings retrieved');
  } catch (error) {
    next(error);
  }
}

export async function adminTestEmailConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    const toEmail = email || req.user?.email || 'admin@skincare.com.bd';

    const result = await EmailNotificationService.testConnection(toEmail);
    if (!result.success) {
      return sendError(res, result.message, 400);
    }

    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

export async function adminTestSmsConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const { phone, message } = req.body;
    if (!phone) return sendError(res, 'Recipient phone number required', 400);

    const testMsg = message || 'Test SMS notification from Skincare BD Admin Gateway. System credentials operational.';
    const result = await SMSNotificationService.sendSMS(phone, testMsg);

    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
}

export async function adminTestCourierConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const { courierName = 'Steadfast' } = req.body;
    const provider = await CourierService.getProvider(courierName);

    // Ping tracking for a test/dummy code or check credentials
    const testResult = await provider.trackShipment('TEST-PING-001');
    return sendSuccess(res, {
      provider: courierName,
      status: testResult.status || 'READY',
      connected: true,
    }, `${courierName} API credentials verified`);
  } catch (error: any) {
    return sendError(res, error.message || 'Courier API connection test failed', 400);
  }
}


