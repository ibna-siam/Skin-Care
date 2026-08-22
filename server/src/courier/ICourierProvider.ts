export interface ShipmentOrderDetails {
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  cityDistrict: string;
  deliveryType?: string;
  amountToCollect: number; // 0 if already paid online
  itemDescription: string;
  weightInKg?: number;
  notes?: string;
}

export interface CreateShipmentResult {
  success: boolean;
  courierName: string;
  trackingCode: string;
  consignmentId?: string;
  courierFee?: number;
  status: string;
  message?: string;
  rawResponse?: any;
}

export interface TrackingResult {
  success: boolean;
  courierName: string;
  trackingCode: string;
  consignmentId?: string;
  status: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | 'FAILED' | 'RETURNED';
  currentLocation?: string;
  events?: Array<{ timestamp: string; status: string; message: string }>;
  rawResponse?: any;
}

export interface ICourierProvider {
  name: string;
  createShipment(details: ShipmentOrderDetails): Promise<CreateShipmentResult>;
  trackShipment(trackingCode: string): Promise<TrackingResult>;
  cancelShipment?(trackingCode: string): Promise<{ success: boolean; message: string }>;
}
