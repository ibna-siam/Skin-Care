import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from './PaymentProvider.js';

export class CODProvider implements PaymentProvider {
  method = 'COD' as const;

  async initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
  }): Promise<PaymentInitiationResult> {
    return {
      success: true,
      transactionId: `COD-${order.orderNumber}`,
      isDirectComplete: true,
      message: 'Cash on Delivery order placed successfully. Payment will be collected upon delivery.',
    };
  }

  async verifyPayment(payload: {
    orderId: string;
    transactionId: string;
  }): Promise<PaymentVerificationResult> {
    return {
      success: true,
      status: 'PENDING',
      transactionId: payload.transactionId,
      amount: 0,
      message: 'Cash on Delivery payment pending delivery confirmation',
    };
  }
}
