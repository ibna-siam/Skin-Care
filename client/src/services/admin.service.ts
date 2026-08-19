import { api } from './api';
import { ApiResponse, SkinQuizResult } from '@skincare/shared';

export const skinGuideService = {
  async getQuestions() {
    const res = await api.get<ApiResponse<any[]>>('/skin-guide/questions');
    return res.data.data || [];
  },

  async submitQuiz(data: { skinTypeSlug: string; concernSlug: string; sensitivity?: string; gender?: string }) {
    const res = await api.post<ApiResponse<SkinQuizResult>>('/skin-guide/recommendations', data);
    return res.data.data;
  },
};

export const adminService = {
  async getDashboardStats() {
    const res = await api.get<ApiResponse<any>>('/admin/dashboard');
    return res.data.data;
  },

  async getProducts(params: { page?: number; limit?: number; search?: string; status?: string } = {}) {
    const res = await api.get<ApiResponse<any[]>>('/admin/products', { params });
    return res.data;
  },

  async createProduct(data: any) {
    const res = await api.post<ApiResponse>('/admin/products', data);
    return res.data;
  },

  async updateProduct(id: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/products/${id}`, data);
    return res.data;
  },

  async deleteProduct(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/products/${id}`);
    return res.data;
  },

  async getOrders(params: { page?: number; limit?: number; status?: string; search?: string } = {}) {
    const res = await api.get<ApiResponse<any[]>>('/admin/orders', { params });
    return res.data;
  },

  async updateOrderStatus(id: string, data: { status: string; note?: string; trackingNumber?: string; courierName?: string }) {
    const res = await api.put<ApiResponse>(`/admin/orders/${id}/status`, data);
    return res.data;
  },

  async getCustomers() {
    const res = await api.get<ApiResponse<any[]>>('/admin/customers');
    return res.data.data || [];
  },

  async getReviews() {
    const res = await api.get<ApiResponse<any[]>>('/admin/reviews');
    return res.data.data || [];
  },

  async moderateReview(id: string, data: { status?: string; isFeatured?: boolean }) {
    const res = await api.put<ApiResponse>(`/admin/reviews/${id}/moderate`, data);
    return res.data;
  },

  async getCoupons() {
    const res = await api.get<ApiResponse<any[]>>('/admin/coupons');
    return res.data.data || [];
  },

  async createCoupon(data: any) {
    const res = await api.post<ApiResponse>('/admin/coupons', data);
    return res.data;
  },

  async updateCMSSection(sectionKey: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/cms/sections/${sectionKey}`, data);
    return res.data;
  },

  async uploadImage(file: File, folder: string = 'skincare-products') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const res = await api.post<ApiResponse<{ url: string; publicId: string }>>('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },
};
