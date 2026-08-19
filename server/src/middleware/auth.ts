import { Request, Response, NextFunction } from 'express';
import { verifyToken, TokenPayload } from '../utils/auth.js';
import { sendError } from '../utils/response.js';
import { Role } from '@skincare/shared';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return sendError(res, 'Authentication required', 401);
    }

    const payload = verifyToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return sendError(res, 'Invalid or expired token', 401);
  }
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.token;
    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const payload = verifyToken(token);
      req.user = payload;
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

    if (!allowedRoles.includes(req.user.role)) {
      return sendError(res, 'You do not have permission to perform this action', 403);
    }

    return next();
  };
}
