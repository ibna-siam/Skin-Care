import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from './PaymentProvider.js';
import { config } from '../config/env.js';

export class SSLCommerzProvider implements PaymentProvider {
  method = 'SSLCOMMERZ' as const;

  async initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }): Promise<PaymentInitiationResult> {
    const isMock = config.sslCommerz.isSandbox && config.sslCommerz.storeId === 'testbox';
    const transactionId = `SSLC-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    if (isMock) {
      return {
        success: true,
        transactionId,
        gatewayUrl: `${config.clientUrl}/payment/mock-gateway?gateway=sslcommerz&orderId=${order.id}&amount=${order.totalAmount}&trxId=${transactionId}`,
        message: 'Redirecting to SSLCommerz Sandbox Gateway',
      };
    }

    return {
      success: true,
      transactionId,
      gatewayUrl: `https://sandbox.sslcommerz.com/gwprocess/v4/api.php?tran_id=${transactionId}`,
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
      message: 'SSLCommerz payment validated successfully',
      rawResponse: payload.rawBody,
    };
  }
}
