import { z } from 'zod';

export const validateCouponSchema = z.object({
  code: z.string().min(1, 'Coupon code is required'),
  subtotal: z.number().min(0, 'Subtotal is required'),
});

export const createCouponSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_DELIVERY']),
  value: z.number().min(0),
  minOrderAmount: z.number().min(0).optional().nullable(),
  maxDiscountAmount: z.number().min(0).optional().nullable(),
  startDate: z.string().datetime().or(z.string()),
  expiryDate: z.string().datetime().or(z.string()),
  usageLimit: z.number().int().min(1).optional().nullable(),
  isActive: z.boolean().default(true),
});
