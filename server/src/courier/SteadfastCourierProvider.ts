import axios from 'axios';
import { ICourierProvider, ShipmentOrderDetails, CreateShipmentResult, TrackingResult } from './ICourierProvider.js';

export class SteadfastCourierProvider implements ICourierProvider {
  name = 'Steadfast';

  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;

  constructor(apiKey?: string, secretKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.STEADFAST_API_KEY || '';
    this.secretKey = secretKey || process.env.STEADFAST_SECRET_KEY || '';
    this.baseUrl = (baseUrl || process.env.STEADFAST_BASE_URL || 'https://portal.steadfast.com.bd/api/v1').replace(/\/$/, '');
  }

  private isConfigured(): boolean {
    return Boolean(this.apiKey && this.secretKey);
  }

  async createShipment(details: ShipmentOrderDetails): Promise<CreateShipmentResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        courierName: this.name,
        trackingCode: '',
        status: 'UNCONFIGURED',
        message: 'Steadfast API credentials (API Key / Secret Key) are not configured. Please set them in Admin Operations or server .env.',
      };
    }

    try {
      const payload = {
        invoice: details.orderNumber,
        recipient_name: details.customerName,
        recipient_phone: details.customerPhone,
        recipient_address: `${details.customerAddress}, ${details.cityDistrict}`,
        cod_amount: details.amountToCollect,
        note: details.notes || details.itemDescription || 'Skincare Cosmetic Order',
      };

      const response = await axios.post(`${this.baseUrl}/create_order`, payload, {
        headers: {
          'Api-Key': this.apiKey,
          'Secret-Key': this.secretKey,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      });

      const data = response.data;
      if (data.status === 200 && data.consignment) {
        return {
          success: true,
          courierName: this.name,
          trackingCode: data.consignment.tracking_code || String(data.consignment.consignment_id),
          consignmentId: String(data.consignment.consignment_id),
          courierFee: data.consignment.delivery_fee ? Number(data.consignment.delivery_fee) : undefined,
          status: 'CREATED',
          message: 'Shipment created successfully on Steadfast',
          rawResponse: data,
        };
      }

      return {
        success: false,
        courierName: this.name,
        trackingCode: '',
        status: 'FAILED',
        message: data.message || 'Steadfast order creation failed',
        rawResponse: data,
      };
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Steadfast API connection error';
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
        currentLocation: 'Steadfast API Key not configured',
      };
    }

    try {
      const response = await axios.get(`${this.baseUrl}/status_by_trackingcode/${encodeURIComponent(trackingCode)}`, {
        headers: {
          'Api-Key': this.apiKey,
          'Secret-Key': this.secretKey,
        },
        timeout: 10000,
      });

      const data = response.data;
      if (data.status === 200 && data.delivery_status) {
        let normalizedStatus: TrackingResult['status'] = 'IN_TRANSIT';
        const st = String(data.delivery_status).toLowerCase();

        if (st.includes('delivered')) normalizedStatus = 'DELIVERED';
        else if (st.includes('cancel')) normalizedStatus = 'CANCELLED';
        else if (st.includes('return')) normalizedStatus = 'RETURNED';
        else if (st.includes('pending') || st.includes('review')) normalizedStatus = 'PENDING';
        else if (st.includes('transit') || st.includes('dispatched') || st.includes('pickup')) normalizedStatus = 'IN_TRANSIT';

        return {
          success: true,
          courierName: this.name,
          trackingCode,
          status: normalizedStatus,
          currentLocation: data.delivery_status,
          rawResponse: data,
        };
      }

      return {
        success: false,
        courierName: this.name,
        trackingCode,
        status: 'PENDING',
        currentLocation: data.message || 'Tracking info not found',
        rawResponse: data,
      };
    } catch (error: any) {
      return {
        success: false,
        courierName: this.name,
        trackingCode,
        status: 'PENDING',
        currentLocation: error.message || 'Error querying Steadfast tracking API',
      };
    }
  }
}
