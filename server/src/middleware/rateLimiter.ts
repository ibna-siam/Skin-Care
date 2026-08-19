import rateLimit from 'express-rate-limit';

export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
    errors: ['Rate limit exceeded'],
  },
});

export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100, // 100 attempts per hour
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again in an hour',
    errors: ['Rate limit exceeded'],
  },
});
