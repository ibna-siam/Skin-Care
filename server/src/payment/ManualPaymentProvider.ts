import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from './PaymentProvider.js';

export class ManualPaymentProvider implements PaymentProvider {
  method = 'MANUAL' as any;

  async initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
  }): Promise<PaymentInitiationResult> {
    const transactionId = `MANUAL-${Date.now()}`;
    return {
      success: true,
      transactionId,
      isDirectComplete: true,
      message: 'Manual payment initiated. Verification pending by order administrator.',
    };
  }

  async verifyPayment(payload: {
    orderId: string;
    transactionId: string;
    rawBody?: any;
  }): Promise<PaymentVerificationResult> {
    return {
      success: true,
      status: 'PENDING',
      transactionId: payload.transactionId,
      amount: payload.rawBody?.amount || 0,
      message: 'Manual payment submitted for admin review',
      rawResponse: payload.rawBody,
    };
  }
}
