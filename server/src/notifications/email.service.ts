import nodemailer from 'nodemailer';
import { prisma } from '../config/db.js';
import { formatBDT } from '@skincare/shared';

export class EmailNotificationService {
  private static async getTransporter(): Promise<nodemailer.Transporter | null> {
    const settings = await prisma.storeSetting.findMany({
      where: { group: 'SMTP' },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const host = map['SMTP_HOST'] || process.env.SMTP_HOST;
    const port = parseInt(map['SMTP_PORT'] || process.env.SMTP_PORT || '587', 10);
    const user = map['SMTP_USER'] || process.env.SMTP_USER;
    const pass = map['SMTP_PASS'] || process.env.SMTP_PASS;

    if (!host || !user || !pass) {
      return null;
    }

    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false },
    });
  }

  private static async getStoreInfo() {
    const settings = await prisma.storeSetting.findMany({
      where: { group: { in: ['GENERAL', 'SMTP'] } },
    });
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    return {
      storeName: map['STORE_NAME'] || 'Skincare Bangladesh',
      supportEmail: map['SUPPORT_EMAIL'] || map['SMTP_FROM'] || process.env.SMTP_FROM || 'support@skincare.com.bd',
      supportPhone: map['SUPPORT_PHONE'] || '+880 1711-223344',
      storeAddress: map['STORE_ADDRESS'] || 'Dhaka, Bangladesh',
      adminEmail: map['ADMIN_NOTIFICATION_EMAIL'] || process.env.ADMIN_NOTIFICATION_EMAIL || 'admin@skincare.com.bd',
      smtpFrom: map['SMTP_FROM'] || process.env.SMTP_FROM || `${map['STORE_NAME'] || 'Skincare Bangladesh'} <no-reply@skincare.com.bd>`,
    };
  }

  static async testConnection(toEmail: string): Promise<{ success: boolean; message: string }> {
    try {
      const transporter = await this.getTransporter();
      const info = await this.getStoreInfo();

      if (!transporter) {
        return {
          success: false,
          message: 'SMTP credentials missing. Please configure SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in Settings.',
        };
      }

      await transporter.verify();

      const result = await transporter.sendMail({
        from: info.smtpFrom,
        to: toEmail,
        subject: `[Verification Test] SMTP Mailer - ${info.storeName}`,
        html: `
          <div style="font-family: sans-serif; padding: 24px; border: 1px solid #10b981; border-radius: 12px; max-width: 500px;">
            <h2 style="color: #047857; margin-top: 0;">SMTP Test Successful!</h2>
            <p>Your SMTP mail gateway for <strong>${info.storeName}</strong> is properly configured and functioning.</p>
            <p style="font-size: 12px; color: #6b7280;">Timestamp: ${new Date().toLocaleString()}</p>
          </div>
        `,
      });

      return {
        success: true,
        message: `Test email sent successfully! Message ID: ${result.messageId}`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `SMTP Error: ${err.message || String(err)}`,
      };
    }
  }

  static async sendOrderConfirmation(order: any): Promise<boolean> {
    const transporter = await this.getTransporter();
    const info = await this.getStoreInfo();

    const emailHtml = `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden;">
        <div style="background: #14532d; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: bold; letter-spacing: 1px;">${info.storeName}</h1>
          <p style="margin: 6px 0 0; font-size: 13px; opacity: 0.9;">Order Placed Successfully</p>
        </div>
        <div style="padding: 28px;">
          <h2 style="color: #111827; font-size: 18px; margin-top: 0;">Hi ${order.customerName},</h2>
          <p style="color: #4b5563; font-size: 14px; line-height: 1.6;">Thank you for shopping with us! We have received your order <strong>#${order.orderNumber}</strong> and it is now being processed by our fulfillment team.</p>
          
          <div style="background: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; padding: 16px; margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151;">
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Order Number:</td>
                <td style="padding: 6px 0; text-align: right; font-family: monospace; font-weight: bold;">${order.orderNumber}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Payment Method:</td>
                <td style="padding: 6px 0; text-align: right;">${order.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Payment Status:</td>
                <td style="padding: 6px 0; text-align: right;"><span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 6px; font-weight: bold;">${order.paymentStatus}</span></td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: 600;">Delivery Address:</td>
                <td style="padding: 6px 0; text-align: right;">${order.fullAddress}, ${order.district}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #111827; font-size: 15px; border-bottom: 2px solid #f3f4f6; padding-bottom: 8px; margin-top: 24px;">Order Summary</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #374151; margin-bottom: 16px;">
            ${(order.items || [])
              .map(
                (item: any) => `
                <tr style="border-bottom: 1px solid #f3f4f6;">
                  <td style="padding: 10px 0;">${item.productName} × <strong>${item.quantity}</strong></td>
                  <td style="padding: 10px 0; text-align: right; font-weight: bold;">৳${item.subtotal}</td>
                </tr>
              `
              )
              .join('')}
            <tr>
              <td style="padding: 10px 0; color: #6b7280;">Subtotal</td>
              <td style="padding: 10px 0; text-align: right;">৳${order.subtotal}</td>
            </tr>
            ${
              order.discount > 0
                ? `<tr><td style="padding: 6px 0; color: #16a34a;">Discount</td><td style="padding: 6px 0; text-align: right; color: #16a34a;">-৳${order.discount}</td></tr>`
                : ''
            }
            <tr>
              <td style="padding: 6px 0; color: #6b7280;">Delivery Fee</td>
              <td style="padding: 6px 0; text-align: right;">৳${order.shippingFee}</td>
            </tr>
            <tr style="border-top: 2px solid #e5e7eb;">
              <td style="padding: 12px 0; font-size: 15px; font-weight: bold; color: #111827;">Total Amount</td>
              <td style="padding: 12px 0; text-align: right; font-size: 16px; font-weight: bold; color: #14532d;">৳${order.totalAmount}</td>
            </tr>
          </table>

          <p style="color: #6b7280; font-size: 12px; margin-top: 24px; text-align: center;">
            Have questions? Contact us at <a href="mailto:${info.supportEmail}" style="color: #14532d;">${info.supportEmail}</a> or call ${info.supportPhone}.
          </p>
        </div>
      </div>
    `;

    if (!transporter) {
      console.log(`[Email Simulation] Order Confirmation sent to ${order.customerEmail} for #${order.orderNumber}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: `"${info.storeName}" <${info.supportEmail}>`,
        to: order.customerEmail,
        subject: `Order Confirmation #${order.orderNumber} - ${info.storeName}`,
        html: emailHtml,
      });
      return true;
    } catch (err) {
      console.warn('Failed to send order email:', err);
      return false;
    }
  }

  static async sendAdminAlert(order: any): Promise<boolean> {
    const transporter = await this.getTransporter();
    const info = await this.getStoreInfo();

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>🛒 New Customer Order Received: #${order.orderNumber}</h2>
        <p><strong>Customer:</strong> ${order.customerName} (${order.customerPhone})</p>
        <p><strong>Total Amount:</strong> ৳${order.totalAmount} (${order.paymentMethod} - ${order.paymentStatus})</p>
        <p><strong>Destination:</strong> ${order.fullAddress}, ${order.district}</p>
        <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/admin/orders/${order.id}">View Order in Admin Dashboard</a></p>
      </div>
    `;

    if (!transporter) {
      console.log(`[Email Simulation] Admin Alert dispatched for Order #${order.orderNumber} to ${info.adminEmail}`);
      return true;
    }

    try {
      await transporter.sendMail({
        from: `"${info.storeName} Alert" <${info.supportEmail}>`,
        to: info.adminEmail,
        subject: `🔔 [NEW ORDER] #${order.orderNumber} - ৳${order.totalAmount}`,
        html,
      });
      return true;
    } catch (e) {
      return false;
    }
  }
}
