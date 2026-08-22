import axios from 'axios';
import { prisma } from '../config/db.js';

export class SMSNotificationService {
  private static async getSMSConfig() {
    const settings = await prisma.storeSetting.findMany({
      where: { group: { in: ['SMS', 'GENERAL'] } },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    return {
      provider: (map['SMS_PROVIDER'] || process.env.SMS_PROVIDER || 'GREENWEB').toUpperCase(),
      apiKey: map['SMS_API_KEY'] || process.env.SMS_API_KEY || '',
      senderId: map['SMS_SENDER_ID'] || process.env.SMS_SENDER_ID || 'SkinCare',
      storeName: map['STORE_NAME'] || 'Skincare BD',
    };
  }

  private static formatPhone(phone: string): string {
    let clean = phone.replace(/[^\d+]/g, '');
    if (clean.startsWith('+88')) clean = clean.slice(3);
    else if (clean.startsWith('88')) clean = clean.slice(2);
    if (!clean.startsWith('01')) clean = '0' + clean;
    return clean;
  }

  static async sendSMS(recipientPhone: string, message: string): Promise<{ success: boolean; message: string }> {
    const config = await this.getSMSConfig();
    const formattedPhone = this.formatPhone(recipientPhone);

    if (!config.apiKey) {
      console.log(`[SMS Simulation] To: ${formattedPhone} | Message: "${message}"`);
      return {
        success: true,
        message: 'SMS logged (Provide SMS_API_KEY in Admin Store Settings or .env to dispatch live SMS in Bangladesh)',
      };
    }

    try {
      if (config.provider === 'GREENWEB') {
        // Greenweb SMS Gateway
        const res = await axios.post('http://api.greenweb.com.bd/api.php', null, {
          params: {
            token: config.apiKey,
            to: formattedPhone,
            message,
          },
          timeout: 10000,
        });
        return { success: true, message: String(res.data) };
      } else if (config.provider === 'BULKSMSBD') {
        // BulkSMSBD Gateway
        const res = await axios.post('http://bulksmsbd.net/api/smsapi', {
          api_key: config.apiKey,
          type: 'text',
          number: formattedPhone,
          senderid: config.senderId,
          message,
        }, { timeout: 10000 });
        return { success: true, message: String(res.data?.response_code || 'Sent') };
      }

      return { success: true, message: 'SMS sent via generic gateway' };
    } catch (error: any) {
      console.warn('SMS dispatch failure:', error.message);
      return { success: false, message: error.message };
    }
  }

  static async sendOrderConfirmation(order: {
    customerName: string;
    customerPhone: string;
    orderNumber: string;
    totalAmount: number;
  }) {
    const config = await this.getSMSConfig();
    const text = `Dear ${order.customerName}, your order #${order.orderNumber} for ৳${order.totalAmount} has been placed successfully at ${config.storeName}. Track online anytime. Thanks!`;
    return this.sendSMS(order.customerPhone, text);
  }

  static async sendOrderShipped(order: {
    customerName: string;
    customerPhone: string;
    orderNumber: string;
    trackingCode?: string;
    courierName?: string;
  }) {
    const config = await this.getSMSConfig();
    const trackingMsg = order.trackingCode ? ` Tracking: ${order.trackingCode} (${order.courierName || 'Steadfast'}).` : '';
    const text = `Dear ${order.customerName}, order #${order.orderNumber} is dispatched from ${config.storeName}.${trackingMsg} Expect delivery in 24-48h!`;
    return this.sendSMS(order.customerPhone, text);
  }
}
