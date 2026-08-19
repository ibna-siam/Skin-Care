import { api } from './api';
import { ApiResponse, Order } from '@skincare/shared';

export const orderService = {
  async createOrder(data: any) {
    const res = await api.post<ApiResponse<{ order: Order; payment: any }>>('/orders', data);
    return res.data;
  },

  async trackOrder(orderNumber: string, phone: string) {
    const res = await api.get<ApiResponse<Order>>('/orders/track', {
      params: { orderNumber, phone },
    });
    return res.data.data;
  },

  async getMyOrders() {
    const res = await api.get<ApiResponse<Order[]>>('/orders/my-orders');
    return res.data.data || [];
  },

  async getOrderDetails(id: string) {
    const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return res.data.data;
  },

  async validateCoupon(code: string, subtotal: number) {
    const res = await api.post<ApiResponse<{
      code: string;
      type: string;
      value: number;
      discountAmount: number;
      isFreeDelivery: boolean;
    }>>('/coupons/validate', { code, subtotal });
    return res.data;
  },

  async verifyPayment(payload: { orderId: string; transactionId: string; gateway: string; status?: string }) {
    const res = await api.post<ApiResponse>('/payments/verify', payload);
    return res.data;
  },

  async submitReview(data: { productId: string; rating: number; title: string; comment: string; images?: string[] }) {
    const res = await api.post<ApiResponse>('/reviews', data);
    return res.data;
  },

  async subscribeNewsletter(email: string) {
    const res = await api.post<ApiResponse>('/newsletter/subscribe', { email });
    return res.data;
  },
};
