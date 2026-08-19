import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { validateCouponSchema } from '../validators/coupon.validator.js';

export async function validateCoupon(req: Request, res: Response, next: NextFunction) {
  try {
    const { code, subtotal } = validateCouponSchema.parse(req.body);
    const upperCode = code.toUpperCase().trim();

    const coupon = await prisma.coupon.findUnique({
      where: { code: upperCode },
    });

    if (!coupon || !coupon.isActive) {
      return sendError(res, 'Invalid or expired coupon code', 400);
    }

    const now = new Date();
    if (new Date(coupon.startDate) > now || new Date(coupon.expiryDate) < now) {
      return sendError(res, 'This coupon has expired', 400);
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return sendError(res, 'Coupon usage limit has been reached', 400);
    }

    if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
      return sendError(res, `Minimum order amount of ৳${coupon.minOrderAmount} required for this coupon`, 400);
    }

    let discountAmount = 0;
    if (coupon.type === 'PERCENTAGE') {
      discountAmount = (subtotal * coupon.value) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else if (coupon.type === 'FIXED') {
      discountAmount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === 'FREE_DELIVERY') {
      discountAmount = 0; // Handled in shipping fee
    }

    return sendSuccess(res, {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount: Math.round(discountAmount),
      isFreeDelivery: coupon.type === 'FREE_DELIVERY',
    }, 'Coupon applied successfully');
  } catch (error) {
    next(error);
  }
}
