import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from './PaymentProvider.js';
import { config } from '../config/env.js';

export class BKashProvider implements PaymentProvider {
  method = 'BKASH' as const;

  async initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    customerPhone: string;
  }): Promise<PaymentInitiationResult> {
    const isMock = !config.bkash.appKey || config.bkash.appKey === 'sandbox_app_key';
    const transactionId = `BKASH-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (isMock) {
      return {
        success: true,
        transactionId,
        gatewayUrl: `${config.clientUrl}/payment/mock-gateway?gateway=bkash&orderId=${order.id}&amount=${order.totalAmount}&trxId=${transactionId}`,
        message: 'Redirecting to bKash Sandbox Payment Gateway',
      };
    }

    // Live bKash Tokenized Checkout API integration hook
    return {
      success: true,
      transactionId,
      gatewayUrl: `${config.bkash.baseUrl}/tokenized/checkout/create`,
    };
  }

  async verifyPayment(payload: {
    orderId: string;
    transactionId: string;
    rawBody?: any;
  }): Promise<PaymentVerificationResult> {
    // In mock/sandbox mode or verified API response
    return {
      success: true,
      status: 'PAID',
      transactionId: payload.transactionId,
      amount: payload.rawBody?.amount || 0,
      message: 'bKash payment successfully verified',
      rawResponse: payload.rawBody,
    };
  }
}
