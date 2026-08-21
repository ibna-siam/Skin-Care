import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { sendError } from '../utils/response.js';
import { Role } from '@skincare/shared';
import { prisma } from '../config/db.js';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    const payload = verifyToken(token);

    // Real-time DB verification: Ensure account still exists and is not banned/deactivated
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true, isActive: true, email: true },
    });

    if (!user || !user.isActive) {
      return sendError(res, 'Account is deactivated or no longer exists', 401);
    }

    // Attach verified user payload with up-to-date role from database
    req.user = {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
    };

    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const payload = verifyToken(token);
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, role: true, isActive: true, email: true },
      });

      if (user && user.isActive) {
        req.user = {
          userId: user.id,
          email: user.email,
          role: user.role as Role,
        };
      }
    }
  } catch (error) {
    // Ignore invalid token for optional auth
  }
  return next();
}

export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    // SUPER_ADMIN automatically has access to all admin routes
    if (req.user.role === 'SUPER_ADMIN' || allowedRoles.includes(req.user.role)) {
      return next();
    }

    return sendError(res, 'You do not have permission to perform this action', 403);
  };
}
