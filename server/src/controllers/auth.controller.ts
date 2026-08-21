import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { prisma } from '../config/db.js';
import { hashPassword, comparePassword, generateToken } from '../utils/auth.js';
import { sendSuccess, sendError } from '../utils/response.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  googleAuthSchema,
} from '../validators/auth.validator.js';
import { normalizeBDPhone } from '@skincare/shared';

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'MARKETING_MANAGER', 'SUPPORT_STAFF'];

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

    return sendSuccess(
      res,
      {
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
      },
      'Account created successfully',
      201
    );
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

    return sendSuccess(
      res,
      {
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
      },
      'Logged in successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function adminLogin(req: Request, res: Response, next: NextFunction) {
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
      return sendError(res, 'This administrator account has been deactivated.', 403);
    }

    // Enforce strict administrative role check
    if (!ADMIN_ROLES.includes(user.role)) {
      return sendError(res, 'Access denied. You do not have administrative privileges.', 403);
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

    // Record login in activity log
    try {
      await prisma.activityLog.create({
        data: {
          adminId: user.id,
          adminName: user.name,
          action: 'LOGIN',
          entity: 'ADMIN_SESSION',
          entityId: user.id,
          details: `Admin ${user.name} (${user.role}) logged in successfully.`,
          ipAddress: req.ip || req.headers['x-forwarded-for']?.toString() || '127.0.0.1',
        },
      });
    } catch (e) {
      // Non-blocking log
    }

    return sendSuccess(
      res,
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatarUrl,
          createdAt: user.createdAt,
        },
        token,
      },
      'Admin authentication successful'
    );
  } catch (error) {
    next(error);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const email = data.email.toLowerCase().trim();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      // Generate secure 32-byte hex token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires,
        },
      });

      // Log generated reset link for development/production environment
      console.log(`🔑 [PASSWORD_RESET] Email: ${email} | Token: ${resetToken}`);
    }

    // Enumeration-safe response (always returns 200)
    return sendSuccess(
      res,
      null,
      'If an account with that email exists, password reset instructions have been generated.'
    );
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const { token, newPassword } = data;

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return sendError(res, 'Invalid or expired password reset link. Please request a new one.', 400);
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    });

    return sendSuccess(res, null, 'Password has been reset successfully. You may now log in.');
  } catch (error) {
    next(error);
  }
}

export async function googleAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const data = googleAuthSchema.parse(req.body);
    let { email, name, googleId, avatarUrl, credential } = data;

    // Decode Google JWT if credential string is provided
    if (credential && !email) {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf-8'));
          email = payload.email;
          name = payload.name || payload.given_name || 'Google User';
          googleId = payload.sub;
          avatarUrl = payload.picture;
        }
      } catch (e) {
        return sendError(res, 'Invalid Google credential token', 400);
      }
    }

    if (!email) {
      return sendError(res, 'Google email is required for authentication', 400);
    }

    email = email.toLowerCase().trim();

    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(googleId ? [{ googleId }] : []),
        ],
      },
    });

    if (user) {
      // Existing user: update provider/googleId if needed
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleId || user.googleId,
          authProvider: 'GOOGLE',
          avatarUrl: avatarUrl || user.avatarUrl,
        },
      });
    } else {
      // New user registration via Google
      const randomPassword = crypto.randomBytes(24).toString('hex');
      const passwordHash = await hashPassword(randomPassword);

      user = await prisma.user.create({
        data: {
          name: name || 'Google Customer',
          email,
          passwordHash,
          googleId,
          authProvider: 'GOOGLE',
          avatarUrl,
          role: 'CUSTOMER',
        },
      });
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

    return sendSuccess(
      res,
      {
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
      },
      'Logged in with Google successfully'
    );
  } catch (error) {
    next(error);
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) return sendError(res, 'Unauthorized', 401);
    const data = changePasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) return sendError(res, 'User not found', 404);

    const isMatch = await comparePassword(data.currentPassword, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Current password is incorrect', 400);
    }

    const passwordHash = await hashPassword(data.newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Record activity
    try {
      await prisma.activityLog.create({
        data: {
          adminId: user.id,
          adminName: user.name,
          action: 'UPDATE',
          entity: 'SECURITY_CREDENTIALS',
          entityId: user.id,
          details: `Password changed for user ${user.email}`,
          ipAddress: req.ip || '127.0.0.1',
        },
      });
    } catch (e) {}

    return sendSuccess(res, null, 'Password changed successfully');
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

    return sendSuccess(
      res,
      {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        preferredSkinType: user.preferredSkinType,
      },
      'Profile updated'
    );
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

