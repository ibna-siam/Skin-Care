import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

let blockedIPCache: Set<string> = new Set();
let lastCacheUpdate = 0;
const CACHE_TTL_MS = 30000; // Refresh cache every 30s

export async function refreshBlockedIPCache() {
  try {
    const blockedList = await (prisma as any).blockedIP.findMany({
      where: { isActive: true },
      select: { ipAddress: true },
    });
    blockedIPCache = new Set((blockedList || []).map((b: { ipAddress: string }) => b.ipAddress.trim()));
    lastCacheUpdate = Date.now();
  } catch (err) {
    console.warn('Blocked IP cache refresh error:', err);
  }
}

export function getClientIp(req: Request): string {
  const cfIp = req.headers['cf-connecting-ip'] as string;
  if (cfIp) return cfIp.trim();

  const forwarded = req.headers['x-forwarded-for'] as string;
  if (forwarded) {
    const first = forwarded.split(',')[0].trim();
    if (first) return first;
  }

  const realIp = req.headers['x-real-ip'] as string;
  if (realIp) return realIp.trim();

  return req.ip || req.socket.remoteAddress || '';
}

export async function ipBlockerMiddleware(req: Request, res: Response, next: NextFunction) {
  // Exclude health check from blocking
  if (req.path === '/api/health') {
    return next();
  }

  // Refresh cache if stale
  if (Date.now() - lastCacheUpdate > CACHE_TTL_MS) {
    await refreshBlockedIPCache();
  }

  const clientIp = getClientIp(req);

  // Normalize IPv6 localhost / loopback
  const isLoopback = clientIp === '127.0.0.1' || clientIp === '::1' || clientIp === '::ffff:127.0.0.1';

  if (!isLoopback && clientIp && blockedIPCache.has(clientIp)) {
    // Increment hit counter asynchronously
    (prisma as any).blockedIP.updateMany({
      where: { ipAddress: clientIp, isActive: true },
      data: { hitCount: { increment: 1 } },
    }).catch(() => {});

    return res.status(403).json({
      success: false,
      message: 'Access Denied: Your IP address has been restricted by server security policy.',
      clientIp,
    });
  }

  return next();
}
