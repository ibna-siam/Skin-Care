import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';

export async function getHomepageSections(req: Request, res: Response, next: NextFunction) {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });

    return sendSuccess(res, sections);
  } catch (error) {
    next(error);
  }
}

export async function subscribeNewsletter(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body;
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return sendError(res, 'Please enter a valid email address', 400);
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      update: {},
      create: { email: email.toLowerCase().trim() },
    });

    return sendSuccess(res, null, 'Thank you for subscribing to our skincare newsletter!');
  } catch (error) {
    next(error);
  }
}

export async function getPublicStoreSettings(req: Request, res: Response, next: NextFunction) {
  try {
    // Return safe public groups & payment flags (never return private API secrets)
    const settings = await prisma.storeSetting.findMany({
      where: {
        OR: [
          { group: { in: ['GENERAL', 'ANALYTICS', 'SEO', 'SHIPPING'] } },
          {
            key: {
              in: [
                'ENABLE_COD',
                'ENABLE_BKASH',
                'ENABLE_SSLCOMMERZ',
                'ENABLE_MANUAL_PAYMENT',
                'PAYMENT_MODE',
              ],
            },
          },
        ],
      },
    });

    const settingsMap: Record<string, string> = {
      ENABLE_COD: 'true',
      ENABLE_BKASH: 'true',
      ENABLE_SSLCOMMERZ: 'true',
    };
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    return sendSuccess(res, settingsMap);
  } catch (error) {
    next(error);
  }
}

export async function getPublicBanners(req: Request, res: Response, next: NextFunction) {
  try {
    const position = req.query.position as string;
    const now = new Date();

    const where: any = {
      isActive: true,
      OR: [
        { startDate: null, endDate: null },
        { startDate: { lte: now }, endDate: null },
        { startDate: null, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: { gte: now } },
      ],
    };

    if (position && position !== 'ALL') {
      where.position = position.toUpperCase();
    }

    const banners = await prisma.banner.findMany({
      where,
      orderBy: { sortOrder: 'asc' },
    });

    return sendSuccess(res, banners);
  } catch (error) {
    next(error);
  }
}

