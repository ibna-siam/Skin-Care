import axios from 'axios';
import { ICourierProvider, ShipmentOrderDetails, CreateShipmentResult, TrackingResult } from './ICourierProvider.js';

export class PathaoCourierProvider implements ICourierProvider {
  name = 'Pathao';

  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private storeId: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config?: {
    clientId?: string;
    clientSecret?: string;
    username?: string;
    password?: string;
    storeId?: string;
    baseUrl?: string;
  }) {
    this.clientId = config?.clientId || process.env.PATHAO_CLIENT_ID || '';
    this.clientSecret = config?.clientSecret || process.env.PATHAO_CLIENT_SECRET || '';
    this.username = config?.username || process.env.PATHAO_USERNAME || '';
    this.password = config?.password || process.env.PATHAO_PASSWORD || '';
    this.storeId = config?.storeId || process.env.PATHAO_STORE_ID || '';
    this.baseUrl = (config?.baseUrl || process.env.PATHAO_BASE_URL || 'https://api-hermes.pathao.com').replace(/\/$/, '');
  }

  private isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret && this.username && this.password);
  }

  private async getValidToken(): Promise<string | null> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt - 60000) {
      return this.accessToken;
    }

    try {
      const response = await axios.post(`${this.baseUrl}/aladdin/api/v1/issue-token`, {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username: this.username,
        password: this.password,
        grant_type: 'password',
      }, { timeout: 10000 });

      if (response.data?.access_token) {
        this.accessToken = response.data.access_token;
        this.tokenExpiresAt = Date.now() + ((response.data.expires_in || 3600) * 1000);
        return this.accessToken;
      }
      return null;
    } catch (error) {
      console.warn('Pathao token issue error:', error);
      return null;
    }
  }

  async createShipment(details: ShipmentOrderDetails): Promise<CreateShipmentResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        courierName: this.name,
        trackingCode: '',
        status: 'UNCONFIGURED',
        message: 'Pathao API credentials (Client ID/Secret, Username/Password) are not configured.',
      };
    }

    const token = await this.getValidToken();
    if (!token) {
      return {
        success: false,
        courierName: this.name,
        trackingCode: '',
        status: 'AUTH_FAILED',
        message: 'Failed to authenticate with Pathao API. Please check credentials.',
      };
    }

    try {
      const payload = {
        store_id: this.storeId ? Number(this.storeId) : undefined,
        merchant_order_id: details.orderNumber,
        recipient_name: details.customerName,
        recipient_phone: details.customerPhone,
        recipient_address: details.customerAddress,
        delivery_type: 48, // Standard delivery
        item_type: 2, // Parcel
        item_quantity: 1,
        item_weight: details.weightInKg || 0.5,
        amount_to_collect: details.amountToCollect,
        item_description: details.itemDescription || 'Skincare Products',
        special_instruction: details.notes || '',
      };

      const response = await axios.post(`${this.baseUrl}/aladdin/api/v1/orders`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        timeout: 15000,
      });

      const data = response.data;
      if (data?.data?.consignment_id) {
        const consignmentId = String(data.data.consignment_id);
        const trackingCode = data.data.tracking_code || consignmentId;
        return {
          success: true,
          courierName: this.name,
          trackingCode,
          consignmentId,
          courierFee: data.data.delivery_fee ? Number(data.data.delivery_fee) : undefined,
          status: 'CREATED',
          message: 'Shipment created successfully on Pathao',
          rawResponse: data,
        };
      }

      return {
        success: false,
        courierName: this.name,
        trackingCode: '',
        status: 'FAILED',
        message: data?.message || 'Pathao order creation failed',
        rawResponse: data,
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Pathao API connection error';
      return {
        success: false,
        courierName: this.name,
        trackingCode: '',
        status: 'ERROR',
        message: errMsg,
        rawResponse: error.response?.data,
      };
    }
  }

  async trackShipment(trackingCode: string): Promise<TrackingResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        courierName: this.name,
        trackingCode,
        status: 'PENDING',
        currentLocation: 'Pathao credentials not configured',
      };
    }

    const token = await this.getValidToken();
    if (!token) {
      return {
        success: false,
        courierName: this.name,
        trackingCode,
        status: 'PENDING',
        currentLocation: 'Unable to authenticate with Pathao API',
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/aladdin/api/v1/orders/${encodeURIComponent(trackingCode)}/info`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        timeout: 10000,
      });

      const data = response.data?.data;
      if (data) {
        let normalizedStatus: TrackingResult['status'] = 'IN_TRANSIT';
        const st = String(data.order_status || '').toLowerCase();

        if (st.includes('delivered')) normalizedStatus = 'DELIVERED';
        else if (st.includes('cancel')) normalizedStatus = 'CANCELLED';
        else if (st.includes('return')) normalizedStatus = 'RETURNED';
        else if (st.includes('pending')) normalizedStatus = 'PENDING';
        else if (st.includes('transit') || st.includes('pickup') || st.includes('assigned')) normalizedStatus = 'IN_TRANSIT';

        return {
          success: true,
          courierName: this.name,
          trackingCode,
          consignmentId: String(data.consignment_id || trackingCode),
          status: normalizedStatus,
          currentLocation: data.order_status_slug || data.order_status || 'In Transit',
          rawResponse: response.data,
        };
      }

      return {
        success: false,
        courierName: this.name,
        trackingCode,
        status: 'PENDING',
        currentLocation: 'Shipment info not found',
      };
    } catch (error: any) {
      return {
        success: false,
        courierName: this.name,
        trackingCode,
        status: 'PENDING',
        currentLocation: error.message || 'Error querying Pathao tracking API',
      };
    }
  }
}
