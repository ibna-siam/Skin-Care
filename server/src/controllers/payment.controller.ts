import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';
import { sendSuccess, sendError } from '../utils/response.js';
import { PaymentService } from '../payment/PaymentService.js';
import { PaymentMethod } from '@skincare/shared';
import { config } from '../config/env.js';
import { EmailNotificationService } from '../notifications/email.service.js';
import { SMSNotificationService } from '../notifications/sms.service.js';

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
            orderStatus: order.orderStatus === 'PENDING' ? 'CONFIRMED' : order.orderStatus,
          },
        }),
        prisma.payment.upsert({
          where: { transactionId: transactionId || `TRX-${orderId}` },
          update: {
            status: 'PAID',
            amount: order.totalAmount,
            rawResponse: JSON.stringify(req.body),
          },
          create: {
            orderId,
            amount: order.totalAmount,
            paymentMethod: order.paymentMethod,
            paymentGateway: gateway || order.paymentMethod,
            status: 'PAID',
            transactionId: transactionId || `TRX-${orderId}`,
            rawResponse: JSON.stringify(req.body),
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

      EmailNotificationService.sendOrderConfirmation(order).catch(console.error);
      EmailNotificationService.sendAdminAlert(order).catch(console.error);
      SMSNotificationService.sendOrderConfirmation(order).catch(console.error);

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

// ----------------- SSLCOMMERZ WEBHOOK & REDIRECT HANDLERS -----------------

export async function sslCommerzSuccess(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = { ...req.query, ...req.body };
    const orderId = payload.value_a || payload.orderId;
    const transactionId = payload.tran_id || payload.transactionId || `SSLC-${Date.now()}`;
    const valId = payload.val_id;

    console.log(`[SSLCommerz Success] Received callback for Order: ${orderId}, Trx: ${transactionId}, ValId: ${valId}`);

    let order = null;
    if (orderId) {
      order = await prisma.order.findUnique({
        where: { id: String(orderId) },
        include: { items: true },
      });
    }

    if (!order && transactionId) {
      const payment = await prisma.payment.findFirst({
        where: { transactionId: String(transactionId) },
        include: { order: { include: { items: true } } },
      });
      if (payment?.order) {
        order = payment.order;
      }
    }

    if (!order) {
      console.warn('[SSLCommerz Success] Order not found for payload:', payload);
      return res.redirect(`${config.clientUrl}/track-order?error=Order+not+found`);
    }

    const provider = PaymentService.getProvider('SSLCOMMERZ');
    const verification = await provider.verifyPayment({
      orderId: order.id,
      transactionId,
      rawBody: payload,
    });

    if (verification.success && verification.status === 'PAID') {
      await prisma.$transaction([
        prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'PAID',
            orderStatus: order.orderStatus === 'PENDING' ? 'CONFIRMED' : order.orderStatus,
          },
        }),
        prisma.payment.upsert({
          where: { transactionId: transactionId || `SSLC-${order.id}` },
          update: {
            status: 'PAID',
            amount: parseFloat(String(payload.amount || order.totalAmount)),
            rawResponse: JSON.stringify(payload),
          },
          create: {
            orderId: order.id,
            amount: parseFloat(String(payload.amount || order.totalAmount)),
            paymentMethod: 'SSLCOMMERZ',
            paymentGateway: payload.card_type || 'SSLCOMMERZ',
            status: 'PAID',
            transactionId: transactionId || `SSLC-${order.id}`,
            rawResponse: JSON.stringify(payload),
          },
        }),
        prisma.orderTimeline.create({
          data: {
            orderId: order.id,
            status: 'CONFIRMED',
            note: `Payment of ৳${order.totalAmount} successfully verified via SSLCOMMERZ (${payload.card_type || 'Card/MFS'}, TrxID: ${transactionId})`,
          },
        }),
      ]);

      // Trigger asynchronous notifications
      EmailNotificationService.sendOrderConfirmation(order).catch(console.error);
      EmailNotificationService.sendAdminAlert(order).catch(console.error);
      SMSNotificationService.sendOrderConfirmation(order).catch(console.error);

      // Redirect customer to order tracking page with success params
      return res.redirect(
        `${config.clientUrl}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}&payment=success`
      );
    } else {
      await prisma.order.update({
        where: { id: order.id },
        data: { paymentStatus: 'FAILED' },
      });

      return res.redirect(
        `${config.clientUrl}/checkout?orderId=${order.id}&payment=failed&reason=${encodeURIComponent(verification.message || 'Validation failed')}`
      );
    }
  } catch (error) {
    console.error('[SSLCommerz Success Error]:', error);
    return res.redirect(`${config.clientUrl}/checkout?payment=error`);
  }
}

export async function sslCommerzFail(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = { ...req.query, ...req.body };
    const orderId = payload.value_a || payload.orderId;
    const errorMsg = payload.error || payload.failedreason || 'Payment failed';

    if (orderId) {
      await prisma.order.update({
        where: { id: String(orderId) },
        data: { paymentStatus: 'FAILED' },
      }).catch(() => {});
    }

    return res.redirect(`${config.clientUrl}/checkout?payment=failed&reason=${encodeURIComponent(errorMsg)}`);
  } catch (error) {
    return res.redirect(`${config.clientUrl}/checkout?payment=failed`);
  }
}

export async function sslCommerzCancel(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = { ...req.query, ...req.body };
    const orderId = payload.value_a || payload.orderId;

    if (orderId) {
      await prisma.order.update({
        where: { id: String(orderId) },
        data: { paymentStatus: 'CANCELLED' },
      }).catch(() => {});
    }

    return res.redirect(`${config.clientUrl}/checkout?payment=cancelled`);
  } catch (error) {
    return res.redirect(`${config.clientUrl}/checkout?payment=cancelled`);
  }
}

export async function sslCommerzIPN(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const orderId = payload.value_a;
    const status = payload.status;

    if (orderId && (status === 'VALID' || status === 'VALIDATED')) {
      await prisma.order.update({
        where: { id: String(orderId) },
        data: { paymentStatus: 'PAID', orderStatus: 'CONFIRMED' },
      }).catch(() => {});
    }

    return res.status(200).send('IPN_OK');
  } catch (error) {
    return res.status(200).send('IPN_PROCESSED');
  }
}

// ----------------- BKASH TOKENIZED CHECKOUT CALLBACK HANDLER -----------------

export async function bkashCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = { ...req.query, ...req.body };
    const paymentID = payload.paymentID;
    const status = payload.status;
    const orderId = payload.orderId;

    console.log(`[bKash Callback] PaymentID: ${paymentID}, Status: ${status}, OrderId: ${orderId}`);

    if (!orderId) {
      return res.redirect(`${config.clientUrl}/track-order?payment=unknown`);
    }

    const order = await prisma.order.findUnique({
      where: { id: String(orderId) },
      include: { items: true },
    });

    if (!order) {
      return res.redirect(`${config.clientUrl}/track-order?payment=unknown`);
    }

    if (status === 'success' && paymentID) {
      const provider = PaymentService.getProvider('BKASH');
      const verification = await provider.verifyPayment({
        orderId: order.id,
        transactionId: paymentID,
        rawBody: payload,
      });

      if (verification.success && verification.status === 'PAID') {
        await prisma.$transaction([
          prisma.order.update({
            where: { id: order.id },
            data: {
              paymentStatus: 'PAID',
              orderStatus: order.orderStatus === 'PENDING' ? 'CONFIRMED' : order.orderStatus,
            },
          }),
          prisma.payment.upsert({
            where: { transactionId: verification.transactionId || paymentID },
            update: {
              status: 'PAID',
              amount: order.totalAmount,
              rawResponse: JSON.stringify(payload),
            },
            create: {
              orderId: order.id,
              amount: order.totalAmount,
              paymentMethod: 'BKASH',
              paymentGateway: 'BKASH_TOKENIZED',
              status: 'PAID',
              transactionId: verification.transactionId || paymentID,
              rawResponse: JSON.stringify(payload),
            },
          }),
          prisma.orderTimeline.create({
            data: {
              orderId: order.id,
              status: 'CONFIRMED',
              note: `Payment of ৳${order.totalAmount} successfully verified via bKash (TrxID: ${verification.transactionId || paymentID})`,
            },
          }),
        ]);

        EmailNotificationService.sendOrderConfirmation(order).catch(console.error);
        EmailNotificationService.sendAdminAlert(order).catch(console.error);
        SMSNotificationService.sendOrderConfirmation(order).catch(console.error);

        return res.redirect(
          `${config.clientUrl}/track-order?orderNumber=${encodeURIComponent(order.orderNumber)}&phone=${encodeURIComponent(order.customerPhone)}&payment=success`
        );
      }
    }

    await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: status === 'cancel' ? 'CANCELLED' : 'FAILED' },
    }).catch(() => {});

    return res.redirect(`${config.clientUrl}/checkout?orderId=${order.id}&payment=${status || 'failed'}`);
  } catch (error) {
    console.error('[bKash Callback Error]:', error);
    return res.redirect(`${config.clientUrl}/checkout?payment=error`);
  }
}
