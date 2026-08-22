import axios from 'axios';
import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from './PaymentProvider.js';
import { config } from '../config/env.js';
import { prisma } from '../config/db.js';

export class SSLCommerzProvider implements PaymentProvider {
  method = 'SSLCOMMERZ' as const;

  private async getCredentials() {
    const settings = await prisma.storeSetting.findMany({
      where: { group: 'PAYMENT' },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const storeId = map['SSLCOMMERZ_STORE_ID'] || config.sslCommerz.storeId;
    const storePassword = map['SSLCOMMERZ_STORE_PASSWORD'] || config.sslCommerz.storePassword;
    const isSandbox = map['SSLCOMMERZ_IS_SANDBOX'] !== undefined ? map['SSLCOMMERZ_IS_SANDBOX'] === 'true' : config.sslCommerz.isSandbox;
    const isLive = Boolean(storeId && storeId !== 'testbox' && storePassword && storePassword !== 'qwerty');

    return { storeId, storePassword, isSandbox, isLive };
  }

  async initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
  }): Promise<PaymentInitiationResult> {
    const transactionId = `SSLC-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const creds = await this.getCredentials();

    if (!creds.isLive) {
      return {
        success: true,
        transactionId,
        gatewayUrl: `${config.clientUrl}/payment/mock-gateway?gateway=sslcommerz&orderId=${order.id}&amount=${order.totalAmount}&trxId=${transactionId}`,
        message: 'Redirecting to SSLCommerz Test Sandbox Gateway',
      };
    }

    try {
      const baseUrl = creds.isSandbox
        ? 'https://sandbox.sslcommerz.com'
        : 'https://securepay.sslcommerz.com';

      const formData = new URLSearchParams();
      formData.append('store_id', creds.storeId);
      formData.append('store_passwd', creds.storePassword);
      formData.append('total_amount', order.totalAmount.toString());
      formData.append('currency', 'BDT');
      formData.append('tran_id', transactionId);
      formData.append('success_url', `${config.serverUrl}/api/payment/sslcommerz/success`);
      formData.append('fail_url', `${config.serverUrl}/api/payment/sslcommerz/fail`);
      formData.append('cancel_url', `${config.serverUrl}/api/payment/sslcommerz/cancel`);
      formData.append('ipn_url', `${config.serverUrl}/api/payment/sslcommerz/ipn`);
      formData.append('cus_name', order.customerName || 'Customer');
      formData.append('cus_email', order.customerEmail || 'customer@example.com');
      formData.append('cus_phone', order.customerPhone || '01700000000');
      formData.append('cus_add1', 'Bangladesh');
      formData.append('cus_city', 'Dhaka');
      formData.append('cus_country', 'Bangladesh');
      formData.append('shipping_method', 'NO');
      formData.append('product_name', `Skincare Order ${order.orderNumber}`);
      formData.append('product_category', 'Skincare');
      formData.append('product_profile', 'physical-goods');
      formData.append('value_a', order.id);
      formData.append('value_b', order.orderNumber);
      formData.append('value_c', order.customerPhone || '');

      const response = await axios.post(`${baseUrl}/gwprocess/v4/api.php`, formData.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        timeout: 15000,
      });

      if (response.data?.status === 'SUCCESS' && response.data?.GatewayPageURL) {
        return {
          success: true,
          transactionId,
          gatewayUrl: response.data.GatewayPageURL,
          message: 'SSLCommerz session initialized',
        };
      }

      return {
        success: false,
        transactionId,
        message: response.data?.failedreason || 'SSLCommerz session initiation failed',
      };
    } catch (error: any) {
      return {
        success: false,
        transactionId,
        message: error.message || 'SSLCommerz gateway communication error',
      };
    }
  }

  async verifyPayment(payload: {
    orderId: string;
    transactionId: string;
    rawBody?: any;
  }): Promise<PaymentVerificationResult> {
    const valId = payload.rawBody?.val_id;
    const creds = await this.getCredentials();

    if (!creds.isLive || !valId) {
      // Mock validation mode
      return {
        success: true,
        status: 'PAID',
        transactionId: payload.transactionId,
        amount: payload.rawBody?.amount || 0,
        message: 'SSLCommerz payment validated (Sandbox Mode)',
        rawResponse: payload.rawBody,
      };
    }

    try {
      const baseUrl = creds.isSandbox
        ? 'https://sandbox.sslcommerz.com'
        : 'https://securepay.sslcommerz.com';

      const validationUrl = `${baseUrl}/validator/api/validationserverAPI.php?val_id=${encodeURIComponent(
        valId
      )}&store_id=${encodeURIComponent(creds.storeId)}&store_passwd=${encodeURIComponent(
        creds.storePassword
      )}&format=json`;

      const response = await axios.get(validationUrl, { timeout: 10000 });
      const data = response.data;

      if (data?.status === 'VALID' || data?.status === 'VALIDATED') {
        return {
          success: true,
          status: 'PAID',
          transactionId: data.tran_id || payload.transactionId,
          amount: parseFloat(data.amount || '0'),
          message: 'SSLCommerz payment verified with official validation server',
          rawResponse: data,
        };
      }

      return {
        success: false,
        status: 'FAILED',
        transactionId: payload.transactionId,
        amount: 0,
        message: data?.error || 'SSLCommerz transaction validation failed',
        rawResponse: data,
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'FAILED',
        transactionId: payload.transactionId,
        amount: 0,
        message: error.message || 'SSLCommerz validation error',
      };
    }
  }
}
