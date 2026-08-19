import { PaymentMethod, PaymentStatus } from '@skincare/shared';

export interface PaymentInitiationResult {
  success: boolean;
  gatewayUrl?: string;
  transactionId: string;
  message?: string;
  isDirectComplete?: boolean;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: PaymentStatus;
  transactionId: string;
  amount: number;
  message?: string;
  rawResponse?: any;
}

export interface PaymentProvider {
  method: PaymentMethod;
  initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }): Promise<PaymentInitiationResult>;

  verifyPayment(payload: {
    orderId: string;
    transactionId: string;
    rawBody?: any;
  }): Promise<PaymentVerificationResult>;
}
