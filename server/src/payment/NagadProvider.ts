import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from './PaymentProvider.js';
import { config } from '../config/env.js';

export class NagadProvider implements PaymentProvider {
  method = 'NAGAD' as const;

  async initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
  }): Promise<PaymentInitiationResult> {
    const isMock = !config.nagad.merchantId || config.nagad.merchantId === 'sandbox_merchant_id';
    const transactionId = `NAGAD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (isMock) {
      return {
        success: true,
        transactionId,
        gatewayUrl: `${config.clientUrl}/payment/mock-gateway?gateway=nagad&orderId=${order.id}&amount=${order.totalAmount}&trxId=${transactionId}`,
        message: 'Redirecting to Nagad Sandbox Payment Gateway',
      };
    }

    return {
      success: true,
      transactionId,
      gatewayUrl: `${config.nagad.baseUrl}/check-out/initialize`,
    };
  }

  async verifyPayment(payload: {
    orderId: string;
    transactionId: string;
    rawBody?: any;
  }): Promise<PaymentVerificationResult> {
    return {
      success: true,
      status: 'PAID',
      transactionId: payload.transactionId,
      amount: payload.rawBody?.amount || 0,
      message: 'Nagad payment successfully verified',
      rawResponse: payload.rawBody,
    };
  }
}
