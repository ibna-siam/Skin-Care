import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Predefined official website image slots with friendly titles and default fallbacks
export const DEFAULT_WEBSITE_SLOTS: Record<string, { title: string; section: string; defaultUrl: string; defaultAlt: string; dimensions: string }> = {
  'homepage.hero': {
    title: 'Homepage Main Hero Banner',
    section: 'HOMEPAGE',
    defaultUrl: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1600&auto=format&fit=crop',
    defaultAlt: 'Original Dermatological Skincare Solutions',
    dimensions: '1600x600',
  },
  'homepage.men_skincare': {
    title: 'Homepage Men Skincare Discovery Card',
    section: 'HOMEPAGE',
    defaultUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop',
    defaultAlt: 'Men Dermatological Skincare',
    dimensions: '600x450',
  },
  'homepage.women_skincare': {
    title: 'Homepage Women Skincare Discovery Card',
    section: 'HOMEPAGE',
    defaultUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop',
    defaultAlt: 'Women Gentle Barrier Care',
    dimensions: '600x450',
  },
  'homepage.skin_guide_card': {
    title: 'Homepage Skin Type Guide Card',
    section: 'HOMEPAGE',
    defaultUrl: 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=600&auto=format&fit=crop',
    defaultAlt: 'Personalized Skin Routine Guide',
    dimensions: '600x450',
  },
  'homepage.promo_banner': {
    title: 'Homepage Promotional Strip Banner',
    section: 'HOMEPAGE',
    defaultUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop',
    defaultAlt: 'Summer Sun Protection SPF 50+',
    dimensions: '1600x400',
  },
  'skin_guide.hero': {
    title: 'Skin Guide Page Hero Image',
    section: 'SKIN_GUIDE',
    defaultUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1200&auto=format&fit=crop',
    defaultAlt: 'Find your perfect dermatologist-approved routine',
    dimensions: '1200x500',
  },
};

// Safe file validation
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', 'image/gif'];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

export async function adminGetMediaAssets(req: Request, res: Response, next: NextFunction) {
  try {
    const { section, slot, search, page = '1', limit = '24' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (section && section !== 'ALL') {
      where.section = String(section);
    }
    if (slot) {
      where.slot = String(slot);
    }
    if (search) {
      const q = String(search).toLowerCase();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { slot: { contains: q, mode: 'insensitive' } },
        { altText: { contains: q, mode: 'insensitive' } },
        { section: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [total, assets] = await Promise.all([
      prisma.mediaAsset.count({ where }),
      prisma.mediaAsset.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    return sendSuccess(res, {
      assets,
      slots: DEFAULT_WEBSITE_SLOTS,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function adminUploadMediaAsset(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      return sendError(res, 'No image file uploaded', 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return sendError(res, 'Invalid image format. Allowed formats: JPG, PNG, WebP, SVG, GIF', 400);
    }

    if (req.file.size > MAX_FILE_SIZE) {
      return sendError(res, 'File size exceeds maximum limit of 8MB', 400);
    }

    const title = req.body.title ? String(req.body.title) : undefined;
    const section = req.body.section ? String(req.body.section) : 'GENERAL';
    const slot = req.body.slot ? String(req.body.slot) : undefined;
    const altText = req.body.altText ? String(req.body.altText) : undefined;
    const isSystem = req.body.isSystem;

    const folder = `skincare-media/${section.toLowerCase()}`;
    const uploadResult = await uploadToCloudinary(req.file.buffer, folder);

    if (slot) {
      await prisma.mediaAsset.updateMany({
        where: { slot },
        data: { slot: null },
      });
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        title: title || req.file.originalname,
        url: uploadResult.url,
        storageKey: uploadResult.publicId,
        section,
        slot: slot || null,
        altText: altText || title || req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        isSystem: isSystem === 'true' || isSystem === true,
      },
    });

    try {
      await prisma.activityLog.create({
        data: {
          adminId: req.user?.userId,
          action: 'CREATE',
          entity: 'MEDIA_ASSET',
          entityId: asset.id,
          details: `Uploaded media asset: ${asset.title} (Slot: ${slot || 'None'})`,
          ipAddress: req.ip,
        },
      });
    } catch (e) {}

    return sendSuccess(res, asset, 'Media uploaded successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function adminReplaceSlotImage(req: Request, res: Response, next: NextFunction) {
  try {
    const slot = String(req.params.slot);
    const { url, title, altText, section } = req.body;

    let finalUrl = url ? String(url) : '';
    let finalStorageKey: string | null = null;
    let fileType: string | null = null;
    let fileSize: number | null = null;

    if (req.file) {
      if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
        return sendError(res, 'Invalid image format. Allowed: JPG, PNG, WebP, SVG', 400);
      }
      const uploadResult = await uploadToCloudinary(req.file.buffer, `skincare-media/slots`);
      finalUrl = uploadResult.url;
      finalStorageKey = uploadResult.publicId;
      fileType = req.file.mimetype;
      fileSize = req.file.size;
    }

    if (!finalUrl) {
      return sendError(res, 'An image URL or file upload is required', 400);
    }

    const slotConfig = DEFAULT_WEBSITE_SLOTS[slot] || {
      title: title || slot,
      section: section || 'GENERAL',
      defaultAlt: altText || slot,
    };

    const existing = await prisma.mediaAsset.findFirst({
      where: { slot },
    });

    let asset;
    if (existing) {
      asset = await prisma.mediaAsset.update({
        where: { id: existing.id },
        data: {
          url: finalUrl,
          storageKey: finalStorageKey || existing.storageKey,
          title: title ? String(title) : existing.title,
          altText: altText ? String(altText) : existing.altText,
          fileType: fileType || existing.fileType,
          fileSize: fileSize || existing.fileSize,
        },
      });
    } else {
      asset = await prisma.mediaAsset.create({
        data: {
          title: title ? String(title) : slotConfig.title,
          url: finalUrl,
          storageKey: finalStorageKey,
          section: section ? String(section) : slotConfig.section,
          slot,
          altText: altText ? String(altText) : slotConfig.defaultAlt,
          fileType: fileType || 'image/jpeg',
          fileSize: fileSize || 0,
        },
      });
    }

    // Automatic two-way synchronization across Banner and HomepageSection tables
    try {
      if (slot === 'homepage.hero') {
        // Sync Homepage CMS Section
        await prisma.homepageSection.upsert({
          where: { sectionKey: 'hero' },
          update: { imageUrl: finalUrl },
          create: {
            sectionKey: 'hero',
            title: slotConfig.title,
            imageUrl: finalUrl,
            isActive: true,
          },
        });

        // Sync Hero Banners
        const heroBanner = await prisma.banner.findFirst({
          where: { position: 'HERO' },
        });
        if (heroBanner) {
          await prisma.banner.update({
            where: { id: heroBanner.id },
            data: { imageUrl: finalUrl },
          });
        } else {
          await prisma.banner.create({
            data: {
              title: slotConfig.title,
              imageUrl: finalUrl,
              position: 'HERO',
              isActive: true,
              linkUrl: '/shop',
            },
          });
        }
      } else if (slot === 'homepage.promo_banner') {
        // Sync Promotional Banner
        const promoBanner = await prisma.banner.findFirst({
          where: { position: 'PROMO' },
        });
        if (promoBanner) {
          await prisma.banner.update({
            where: { id: promoBanner.id },
            data: { imageUrl: finalUrl },
          });
        } else {
          await prisma.banner.create({
            data: {
              title: slotConfig.title,
              imageUrl: finalUrl,
              position: 'PROMO',
              isActive: true,
              linkUrl: '/shop',
            },
          });
        }
      } else if (slot === 'skin_guide.hero') {
        // Sync Skin Guide Banner
        const guideBanner = await prisma.banner.findFirst({
          where: { position: 'SKIN_GUIDE' },
        });
        if (guideBanner) {
          await prisma.banner.update({
            where: { id: guideBanner.id },
            data: { imageUrl: finalUrl },
          });
        } else {
          await prisma.banner.create({
            data: {
              title: slotConfig.title,
              imageUrl: finalUrl,
              position: 'SKIN_GUIDE',
              isActive: true,
              linkUrl: '/skin-guide',
            },
          });
        }
      }
    } catch (e) {
      console.warn('Cross-section banner synchronization notice:', e);
    }

    try {
      await prisma.activityLog.create({
        data: {
          adminId: req.user?.userId,
          action: 'UPDATE',
          entity: 'WEBSITE_IMAGE_SLOT',
          entityId: asset.id,
          details: `Replaced website slot image for [${slot}] -> ${finalUrl}`,
          ipAddress: req.ip,
        },
      });
    } catch (e) {}

    return sendSuccess(res, asset, `Slot ${slot} image replaced and synced across all sections successfully`);
  } catch (error) {
    next(error);
  }
}

export async function adminUpdateMediaAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const { title, altText, section, slot, url } = req.body;

    const existing = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!existing) {
      return sendError(res, 'Media asset not found', 404);
    }

    if (slot && slot !== existing.slot) {
      await prisma.mediaAsset.updateMany({
        where: { slot: String(slot), id: { not: id } },
        data: { slot: null },
      });
    }

    const updated = await prisma.mediaAsset.update({
      where: { id },
      data: {
        title: title !== undefined ? String(title) : existing.title,
        altText: altText !== undefined ? String(altText) : existing.altText,
        section: section !== undefined ? String(section) : existing.section,
        slot: slot !== undefined ? (slot ? String(slot) : null) : existing.slot,
        url: url ? String(url) : existing.url,
      },
    });

    return sendSuccess(res, updated, 'Media asset updated successfully');
  } catch (error) {
    next(error);
  }
}

export async function adminDeleteMediaAsset(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);
    const { force } = req.query;

    const asset = await prisma.mediaAsset.findUnique({
      where: { id },
    });

    if (!asset) {
      return sendError(res, 'Media asset not found', 404);
    }

    if (asset.slot && force !== 'true') {
      return sendError(
        res,
        `Cannot delete this asset directly because it is actively used by slot: "${asset.slot}". Replace the slot image first or pass force=true to confirm deletion.`,
        400
      );
    }

    await prisma.mediaAsset.delete({
      where: { id },
    });

    try {
      await prisma.activityLog.create({
        data: {
          adminId: req.user?.userId,
          action: 'DELETE',
          entity: 'MEDIA_ASSET',
          entityId: id,
          details: `Deleted media asset: ${asset.title} (${asset.url})`,
          ipAddress: req.ip,
        },
      });
    } catch (e) {}

    return sendSuccess(res, null, 'Media asset deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function getPublicMediaSlots(req: Request, res: Response, next: NextFunction) {
  try {
    const assets = await prisma.mediaAsset.findMany({
      where: {
        slot: { not: null },
      },
    });

    const slotMap: Record<string, { url: string; altText: string; title: string }> = {};

    Object.entries(DEFAULT_WEBSITE_SLOTS).forEach(([key, val]) => {
      slotMap[key] = {
        url: val.defaultUrl,
        altText: val.defaultAlt,
        title: val.title,
      };
    });

    assets.forEach((a) => {
      if (a.slot && a.url) {
        slotMap[a.slot] = {
          url: a.url,
          altText: a.altText || slotMap[a.slot]?.altText || a.title || '',
          title: a.title || slotMap[a.slot]?.title || a.slot,
        };
      }
    });

    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

    return sendSuccess(res, slotMap);
  } catch (error) {
    next(error);
  }
}
