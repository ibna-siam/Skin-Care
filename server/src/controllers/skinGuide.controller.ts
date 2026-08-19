import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess } from '../utils/response.js';

export async function getQuizQuestions(req: Request, res: Response, next: NextFunction) {
  try {
    const questions = await prisma.skinQuizQuestion.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return sendSuccess(res, questions);
  } catch (error) {
    next(error);
  }
}

export async function submitQuizAndGetRoutine(req: Request, res: Response, next: NextFunction) {
  try {
    const { skinTypeSlug, concernSlug, sensitivity = 'LOW', gender = 'ALL' } = req.body;

    // Rule-based matching for Morning and Night routine steps
    // 1. Cleanser
    const cleanser = await prisma.product.findFirst({
      where: {
        category: { slug: 'cleansers' },
        status: 'ACTIVE',
        skinTypes: { some: { skinType: { slug: skinTypeSlug || 'normal' } } },
      },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    }) || await prisma.product.findFirst({
      where: { category: { slug: 'cleansers' }, status: 'ACTIVE' },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    });

    // 2. Serum / Treatment for concern
    const serum = await prisma.product.findFirst({
      where: {
        category: { slug: 'serums' },
        status: 'ACTIVE',
        skinConcerns: { some: { skinConcern: { slug: concernSlug || 'acne' } } },
      },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    }) || await prisma.product.findFirst({
      where: { category: { slug: 'serums' }, status: 'ACTIVE' },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    });

    // 3. Moisturizer
    const moisturizer = await prisma.product.findFirst({
      where: {
        category: { slug: 'moisturizers' },
        status: 'ACTIVE',
        skinTypes: { some: { skinType: { slug: skinTypeSlug || 'normal' } } },
      },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    }) || await prisma.product.findFirst({
      where: { category: { slug: 'moisturizers' }, status: 'ACTIVE' },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    });

    // 4. Sunscreen
    const sunscreen = await prisma.product.findFirst({
      where: {
        category: { slug: 'sunscreen' },
        status: 'ACTIVE',
      },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    });

    // 5. Toner / Treatment
    const toner = await prisma.product.findFirst({
      where: {
        category: { slug: 'toners' },
        status: 'ACTIVE',
      },
      include: { brand: true, images: { where: { isPrimary: true }, take: 1 } },
    });

    const morningRoutine = [
      cleanser && {
        step: 1,
        category: 'Cleanser',
        product: cleanser,
        howToApply: 'Massage gently onto damp skin for 60 seconds. Rinse with lukewarm water.',
      },
      toner && {
        step: 2,
        category: 'Toner',
        product: toner,
        howToApply: 'Pat lightly across face and neck with fingertips to balance pH.',
      },
      serum && {
        step: 3,
        category: 'Targeted Serum',
        product: serum,
        howToApply: 'Apply 2-3 drops to face, gently pressing in before moisturizing.',
      },
      moisturizer && {
        step: 4,
        category: 'Moisturizer',
        product: moisturizer,
        howToApply: 'Apply evenly to seal in hydration throughout the day.',
      },
      sunscreen && {
        step: 5,
        category: 'Sunscreen (SPF 50+)',
        product: sunscreen,
        howToApply: 'Apply two finger lengths 15 minutes before sun exposure.',
      },
    ].filter(Boolean);

    const nightRoutine = [
      cleanser && {
        step: 1,
        category: 'Cleanser',
        product: cleanser,
        howToApply: 'Double cleanse to remove sunscreen, pollution, and excess sebum.',
      },
      serum && {
        step: 2,
        category: 'Night Repair Serum',
        product: serum,
        howToApply: 'Smooth over skin to let active ingredients work overnight.',
      },
      moisturizer && {
        step: 3,
        category: 'Barrier Cream / Moisturizer',
        product: moisturizer,
        howToApply: 'Generously massage into face and neck for overnight recovery.',
      },
    ].filter(Boolean);

    const tips = [
      'Always patch test new skincare actives behind the ear or on the wrist for 24 hours.',
      'Wear sunscreen daily in Bangladesh even on cloudy or indoor days to prevent hyperpigmentation.',
      'Stay hydrated and avoid washing your face with hot water, which strips natural lipids.',
    ];

    return sendSuccess(res, {
      skinType: skinTypeSlug || 'Normal',
      primaryConcern: concernSlug || 'General Health',
      sensitivityLevel: sensitivity,
      morningRoutine,
      nightRoutine,
      tips,
    });
  } catch (error) {
    next(error);
  }
}
