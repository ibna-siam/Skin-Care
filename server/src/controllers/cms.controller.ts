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
