import axios from 'axios';
import { PaymentProvider, PaymentInitiationResult, PaymentVerificationResult } from './PaymentProvider.js';
import { config } from '../config/env.js';
import { prisma } from '../config/db.js';

export class BKashProvider implements PaymentProvider {
  method = 'BKASH' as const;

  private async getCredentials() {
    const settings = await prisma.storeSetting.findMany({
      where: { group: 'PAYMENT' },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const appKey = map['BKASH_APP_KEY'] || config.bkash.appKey;
    const appSecret = map['BKASH_APP_SECRET'] || config.bkash.appSecret;
    const username = map['BKASH_USERNAME'] || config.bkash.username;
    const password = map['BKASH_PASSWORD'] || config.bkash.password;
    const baseUrl = map['BKASH_BASE_URL'] || config.bkash.baseUrl || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta';
    const isLive = Boolean(appKey && appKey !== 'sandbox_app_key' && appSecret && username && password);

    return { appKey, appSecret, username, password, baseUrl, isLive };
  }

  private async getBKashGrantToken(creds: { appKey: string; appSecret: string; username: string; password: string; baseUrl: string }): Promise<string | null> {
    try {
      const res = await axios.post(
        `${creds.baseUrl}/tokenized/checkout/token/grant`,
        {
          app_key: creds.appKey,
          app_secret: creds.appSecret,
        },
        {
          headers: {
            username: creds.username,
            password: creds.password,
            'Content-Type': 'application/json',
          },
          timeout: 10000,
        }
      );
      return res.data?.id_token || null;
    } catch {
      return null;
    }
  }

  async initiatePayment(order: {
    id: string;
    orderNumber: string;
    totalAmount: number;
    customerPhone: string;
  }): Promise<PaymentInitiationResult> {
    const transactionId = `BKASH-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const creds = await this.getCredentials();

    if (!creds.isLive) {
      return {
        success: true,
        transactionId,
        gatewayUrl: `${config.clientUrl}/payment/mock-gateway?gateway=bkash&orderId=${order.id}&amount=${order.totalAmount}&trxId=${transactionId}`,
        message: 'Redirecting to bKash Sandbox Payment Gateway',
      };
    }

    try {
      const token = await this.getBKashGrantToken(creds);
      if (!token) {
        return {
          success: false,
          transactionId,
          message: 'bKash merchant token grant failed. Please verify API credentials in Admin Integrations.',
        };
      }

      const res = await axios.post(
        `${creds.baseUrl}/tokenized/checkout/create`,
        {
          mode: '0011',
          payerReference: order.customerPhone || '01700000000',
          callbackURL: `${config.serverUrl}/api/payments/bkash/callback?orderId=${order.id}`,
          amount: String(order.totalAmount),
          currency: 'BDT',
          intent: 'sale',
          merchantInvoiceNumber: order.orderNumber,
        },
        {
          headers: {
            Authorization: token,
            'X-APP-Key': creds.appKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );
      if (res.data?.bkashURL) {
        return {
          success: true,
          transactionId: res.data.paymentID || transactionId,
          gatewayUrl: res.data.bkashURL,
          message: 'bKash payment URL created',
        };
      }

      return {
        success: false,
        transactionId,
        message: res.data?.statusMessage || 'bKash checkout URL creation failed',
      };
    } catch (error: any) {
      return {
        success: false,
        transactionId,
        message: error.message || 'bKash API communication failure',
      };
    }
  }

  async verifyPayment(payload: {
    orderId: string;
    transactionId: string;
    rawBody?: any;
  }): Promise<PaymentVerificationResult> {
    const paymentId = payload.rawBody?.paymentID || payload.transactionId;
    const creds = await this.getCredentials();

    if (!creds.isLive) {
      return {
        success: true,
        status: 'PAID',
        transactionId: payload.transactionId,
        amount: payload.rawBody?.amount || 0,
        message: 'bKash payment successfully verified (Sandbox Mode)',
        rawResponse: payload.rawBody,
      };
    }

    try {
      const token = await this.getBKashGrantToken(creds);
      if (!token) {
        return {
          success: false,
          status: 'FAILED',
          transactionId: payload.transactionId,
          amount: 0,
          message: 'bKash authorization token failed during verification',
        };
      }

      const res = await axios.post(
        `${creds.baseUrl}/tokenized/checkout/execute`,
        { paymentID: paymentId },
        {
          headers: {
            Authorization: token,
            'X-APP-Key': creds.appKey,
            'Content-Type': 'application/json',
          },
          timeout: 15000,
        }
      );

      if (res.data?.statusCode === '0000' && res.data?.transactionStatus === 'Completed') {
        return {
          success: true,
          status: 'PAID',
          transactionId: res.data.trxID || paymentId,
          amount: parseFloat(res.data.amount || '0'),
          message: 'bKash payment verified successfully',
          rawResponse: res.data,
        };
      }

      return {
        success: false,
        status: 'FAILED',
        transactionId: payload.transactionId,
        amount: 0,
        message: res.data?.statusMessage || 'bKash payment execution failed',
        rawResponse: res.data,
      };
    } catch (error: any) {
      return {
        success: false,
        status: 'FAILED',
        transactionId: payload.transactionId,
        amount: 0,
        message: error.message || 'bKash verification error',
      };
    }
  }
}
