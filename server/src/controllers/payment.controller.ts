import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { PaymentService } from '../payment/PaymentService.js';
import { PaymentMethod } from '@skincare/shared';

export async function verifyPaymentCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const { orderId, transactionId, status, gateway } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return sendError(res, 'Order not found', 404);
    }

    const provider = PaymentService.getProvider(order.paymentMethod as PaymentMethod);
    const verification = await provider.verifyPayment({
      orderId,
      transactionId,
      rawBody: req.body,
    });

    if (verification.success && verification.status === 'PAID') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: orderId },
          data: {
            paymentStatus: 'PAID',
            orderStatus: 'CONFIRMED',
          },
        }),
        prisma.payment.updateMany({
          where: { orderId },
          data: {
            status: 'PAID',
            transactionId,
          },
        }),
        prisma.orderTimeline.create({
          data: {
            orderId,
            status: 'CONFIRMED',
            note: `Payment of ৳${order.totalAmount} verified via ${order.paymentMethod} (TrxID: ${transactionId})`,
          },
        }),
      ]);

      return sendSuccess(res, { orderId, status: 'PAID' }, 'Payment confirmed');
    } else {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: 'FAILED' },
      });
      return sendError(res, 'Payment verification failed', 400);
    }
  } catch (error) {
    next(error);
  }
}
