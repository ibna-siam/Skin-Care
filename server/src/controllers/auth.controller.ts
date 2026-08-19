import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { registerSchema, loginSchema, updateProfileSchema, changePasswordSchema } from '../validators/auth.validator.js';
import { normalizeBDPhone } from '@skincare/shared';

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const data = registerSchema.parse(req.body);
    const existingEmail = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (existingEmail) {
      return sendError(res, 'Email already registered', 400);
    }

    if (data.phone) {
      const normalizedPhone = normalizeBDPhone(data.phone);
      const existingPhone = await prisma.user.findUnique({
        where: { phone: normalizedPhone },
      });
      if (existingPhone) {
        return sendError(res, 'Phone number already registered', 400);
      }
      data.phone = normalizedPhone;
    }

    const passwordHash = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        passwordHash,
        preferredSkinType: data.preferredSkinType,
        role: 'CUSTOMER',
      },
    });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        preferredSkinType: user.preferredSkinType,
        createdAt: user.createdAt,
      },
      token,
    }, 'Account created successfully', 201);
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const data = loginSchema.parse(req.body);
    const identifier = data.identifier.trim();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier.toLowerCase() },
          { phone: identifier },
          { phone: normalizeBDPhone(identifier) },
        ],
      },
    });

    if (!user) {
      return sendError(res, 'Invalid credentials', 401);
    }

    const isMatch = await comparePassword(data.password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid credentials', 401);
    }

    if (!user.isActive) {
      return sendError(res, 'Your account has been deactivated. Please contact support.', 403);
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role as any,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preferredSkinType: user.preferredSkinType,
        createdAt: user.createdAt,
      },
      token,
    }, 'Logged in successfully');
  } catch (error) {
    next(error);
  }
}

export async function logout(req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  });
  return sendSuccess(res, null, 'Logged out successfully');
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      return sendError(res, 'Unauthorized', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        addresses: {
          orderBy: { isDefault: 'desc' },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return sendError(res, 'User not found', 404);
    }

    const wishlistCount = await prisma.wishlistItem.count({
      where: { wishlist: { userId: user.id } },
    });

    return sendSuccess(res, {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preferredSkinType: user.preferredSkinType,
        addresses: user.addresses,
        stats: {
          ordersCount: user._count.orders,
          reviewsCount: user._count.reviews,
          wishlistCount,
        },
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const data = updateProfileSchema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: {
        name: data.name,
        phone: data.phone ? normalizeBDPhone(data.phone) : undefined,
        preferredSkinType: data.preferredSkinType,
        avatarUrl: data.avatarUrl,
      },
    });

    return sendSuccess(res, {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatarUrl: user.avatarUrl,
      preferredSkinType: user.preferredSkinType,
    }, 'Profile updated');
  } catch (error) {
    next(error);
  }
}

export async function addAddress(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const { recipientName, phone, division, district, area, fullAddress, postalCode, isDefault } = req.body;

    if (isDefault) {
      await prisma.address.updateMany({
        where: { userId: req.user.userId },
        data: { isDefault: false },
      });
    }

    const address = await prisma.address.create({
      data: {
        userId: req.user.userId,
        recipientName,
        phone,
        division,
        district,
        area,
        fullAddress,
        postalCode,
        isDefault: !!isDefault,
      },
    });

    return sendSuccess(res, address, 'Address added', 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteAddress(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const id = req.params.id as string;

    await prisma.address.deleteMany({
      where: { id, userId: req.user.userId },
    });

    return sendSuccess(res, null, 'Address removed');
  } catch (error) {
    next(error);
  }
}
