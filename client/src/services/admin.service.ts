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
  async getDashboardStats(params: { range?: string; startDate?: string; endDate?: string } = {}) {
    const res = await api.get<ApiResponse<any>>('/admin/dashboard', { params });
    return res.data.data;
  },

  async getProducts(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    categoryId?: string;
    brandId?: string;
    stockLevel?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
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

  async updateProductStock(id: string, data: { stock: number; lowStockThreshold?: number }) {
    const res = await api.patch<ApiResponse>(`/admin/products/${id}/stock`, data);
    return res.data;
  },

  async bulkUpdateProducts(productIds: string[], status: string) {
    const res = await api.post<ApiResponse>('/admin/products/bulk-status', { productIds, status });
    return res.data;
  },

  async deleteProduct(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/products/${id}`);
    return res.data;
  },

  async exportProductsCsv() {
    const res = await api.get('/admin/products/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skincare-products-inventory-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async getOrders(params: {
    page?: number;
    limit?: number;
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    startDate?: string;
    endDate?: string;
  } = {}) {
    const res = await api.get<ApiResponse<any[]>>('/admin/orders', { params });
    return res.data;
  },

  async getOrderDetail(id: string) {
    const res = await api.get<ApiResponse<any>>(`/admin/orders/${id}`);
    return res.data.data;
  },

  async updateOrderStatus(id: string, data: { status: string; note?: string; trackingNumber?: string; courierName?: string; estimatedDelivery?: string }) {
    const res = await api.put<ApiResponse>(`/admin/orders/${id}/status`, data);
    return res.data;
  },

  async bulkUpdateOrderStatus(orderIds: string[], status: string, note?: string) {
    const res = await api.post<ApiResponse>('/admin/orders/bulk-status', { orderIds, status, note });
    return res.data;
  },

  async exportOrdersCsv(status?: string) {
    const res = await api.get('/admin/orders/export/csv', {
      params: { status },
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skincare-orders-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  async getCustomers(params: {
    page?: number;
    limit?: number;
    search?: string;
    segment?: string;
    skinType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const res = await api.get<ApiResponse<any[]>>('/admin/customers', { params });
    return res.data;
  },

  async getCustomerDetail(id: string) {
    const res = await api.get<ApiResponse<any>>(`/admin/customers/${id}`);
    return res.data.data;
  },

  async exportCustomersCsv() {
    const res = await api.get('/admin/customers/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([res.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `skincare-customers-crm-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },


  async getCoupons() {
    const res = await api.get<ApiResponse<any[]>>('/admin/coupons');
    return res.data.data || [];
  },

  async createCoupon(data: any) {
    const res = await api.post<ApiResponse>('/admin/coupons', data);
    return res.data;
  },

  async updateCoupon(id: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/coupons/${id}`, data);
    return res.data;
  },

  async deleteCoupon(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/coupons/${id}`);
    return res.data;
  },

  async getCMSSections() {
    const res = await api.get<ApiResponse<any[]>>('/admin/cms');
    return res.data.data || [];
  },

  async updateCMSSection(sectionKey: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/cms/sections/${sectionKey}`, data);
    return res.data;
  },

  async getBanners() {
    const res = await api.get<ApiResponse<any[]>>('/admin/banners');
    return res.data.data || [];
  },

  async createBanner(data: any) {
    const res = await api.post<ApiResponse>('/admin/banners', data);
    return res.data;
  },

  async updateBanner(id: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/banners/${id}`, data);
    return res.data;
  },

  async deleteBanner(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/banners/${id}`);
    return res.data;
  },

  async getAutomations() {
    const res = await api.get<ApiResponse<any[]>>('/admin/automations');
    return res.data.data || [];
  },

  async toggleAutomation(id: string, isActive: boolean) {
    const res = await api.patch<ApiResponse>(`/admin/automations/${id}/toggle`, { isActive });
    return res.data;
  },

  async runAutomation(triggerType?: string) {
    const res = await api.post<ApiResponse>('/admin/automations/run', { triggerType });
    return res.data;
  },

  async getAutomationLogs(params: { page?: number; limit?: number; triggerType?: string; status?: string } = {}) {
    const res = await api.get<ApiResponse<any[]>>('/admin/automations/logs', { params });
    return res.data;
  },

  async getNotifications() {
    const res = await api.get<ApiResponse<any[]>>('/admin/notifications');
    return res.data.data || [];
  },

  async sendBroadcastNotification(data: { title: string; message: string; type?: string }) {
    const res = await api.post<ApiResponse>('/admin/notifications/broadcast', data);
    return res.data;
  },

  // Categories
  async getCategories() {
    const res = await api.get<ApiResponse<any[]>>('/admin/categories');
    return res.data.data || [];
  },

  async createCategory(data: any) {
    const res = await api.post<ApiResponse>('/admin/categories', data);
    return res.data;
  },

  async updateCategory(id: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/categories/${id}`, data);
    return res.data;
  },

  async deleteCategory(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/categories/${id}`);
    return res.data;
  },

  // Brands
  async getBrands() {
    const res = await api.get<ApiResponse<any[]>>('/admin/brands');
    return res.data.data || [];
  },

  async createBrand(data: any) {
    const res = await api.post<ApiResponse>('/admin/brands', data);
    return res.data;
  },

  async updateBrand(id: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/brands/${id}`, data);
    return res.data;
  },

  async deleteBrand(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/brands/${id}`);
    return res.data;
  },

  // Campaigns
  async getCampaigns() {
    const res = await api.get<ApiResponse<any[]>>('/admin/campaigns');
    return res.data.data || [];
  },

  async createCampaign(data: any) {
    const res = await api.post<ApiResponse>('/admin/campaigns', data);
    return res.data;
  },

  async updateCampaign(id: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/campaigns/${id}`, data);
    return res.data;
  },

  async deleteCampaign(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/campaigns/${id}`);
    return res.data;
  },

  // Newsletters
  async getNewsletters(params: { page?: number; limit?: number; search?: string } = {}) {
    const res = await api.get<ApiResponse<any[]>>('/admin/newsletters', { params });
    return res.data;
  },

  async deleteNewsletter(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/newsletters/${id}`);
    return res.data;
  },

  // Skin Guide Quiz
  async getSkinQuiz() {
    const res = await api.get<ApiResponse<any[]>>('/admin/skin-guide');
    return res.data.data || [];
  },

  async createSkinQuizQuestion(data: any) {
    const res = await api.post<ApiResponse>('/admin/skin-guide/questions', data);
    return res.data;
  },

  async updateSkinQuizQuestion(id: string, data: any) {
    const res = await api.put<ApiResponse>(`/admin/skin-guide/questions/${id}`, data);
    return res.data;
  },

  async deleteSkinQuizQuestion(id: string) {
    const res = await api.delete<ApiResponse>(`/admin/skin-guide/questions/${id}`);
    return res.data;
  },

  // Analytics Engine
  async getAnalyticsOverview(days: number = 30) {
    const res = await api.get<ApiResponse<any>>('/admin/analytics/overview', { params: { days } });
    return res.data.data;
  },

  // Settings & System Users
  async getStoreSettings() {
    const res = await api.get<ApiResponse<any[]>>('/admin/settings');
    return res.data.data || [];
  },

  async updateStoreSetting(data: { key: string; value: string; group?: string }) {
    const res = await api.post<ApiResponse>('/admin/settings', data);
    return res.data;
  },

  async getActivityLogs() {
    const res = await api.get<ApiResponse<any[]>>('/admin/activity-logs');
    return res.data.data || [];
  },

  async getUsers() {
    const res = await api.get<ApiResponse<any[]>>('/admin/users');
    return res.data.data || [];
  },

  async updateUserRole(id: string, data: { role?: string; isActive?: boolean }) {
    const res = await api.patch<ApiResponse>(`/admin/users/${id}/role`, data);
    return res.data;
  },

  async uploadImage(file: File, folder: string = 'skincare-products'): Promise<string> {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('folder', folder);
    const res = await api.post<ApiResponse<{ url: string; publicId: string }>>('/admin/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data?.url || (res.data as any)?.url || '';
  },

  // Reviews Moderation & Manual Creation
  async getReviews(params: { page?: number; limit?: number; status?: string; rating?: string; productId?: string; search?: string } = {}) {
    const res = await api.get<ApiResponse<any>>('/admin/reviews', { params });
    return res.data;
  },

  async createManualReview(data: {
    productId: string;
    userName: string;
    rating: number;
    title: string;
    comment: string;
    isVerifiedPurchase?: boolean;
    isFeatured?: boolean;
    images?: string[];
  }) {
    const res = await api.post<ApiResponse<any>>('/admin/reviews/manual', data);
    return res.data;
  },

  async moderateReview(id: string, data: { status?: string; rating?: number; title?: string; comment?: string; isFeatured?: boolean; isVerifiedPurchase?: boolean }) {
    const res = await api.put<ApiResponse<any>>(`/admin/reviews/${id}/moderate`, data);
    return res.data;
  },

  async deleteReview(id: string) {
    const res = await api.delete<ApiResponse<any>>(`/admin/reviews/${id}`);
    return res.data;
  },

  // Courier Logistics
  async createCourierShipment(orderId: string, courierName: string = 'Steadfast') {
    const res = await api.post<ApiResponse<any>>(`/admin/orders/${orderId}/courier-shipment`, { courierName });
    return res.data;
  },

  async trackCourierShipment(orderId: string) {
    const res = await api.get<ApiResponse<any>>(`/admin/orders/${orderId}/courier-track`);
    return res.data.data;
  },

  // IP Blocker & Security
  async getBlockedIPs() {
    const res = await api.get<ApiResponse<any[]>>('/admin/ip-blocker');
    return res.data.data || [];
  },

  async addBlockedIP(ipAddress: string, reason?: string) {
    const res = await api.post<ApiResponse<any>>('/admin/ip-blocker', { ipAddress, reason });
    return res.data;
  },

  async toggleBlockedIP(id: string, isActive: boolean) {
    const res = await api.patch<ApiResponse<any>>(`/admin/ip-blocker/${id}/toggle`, { isActive });
    return res.data;
  },

  async deleteBlockedIP(id: string) {
    const res = await api.delete<ApiResponse<any>>(`/admin/ip-blocker/${id}`);
    return res.data;
  },

  async updateStoreSettingsBatch(settings: Array<{ key: string; value: string; group?: string }>) {
    const res = await api.put<ApiResponse<any>>('/admin/settings/batch', { settings });
    return res.data;
  },

  // Third-Party API Integrations Hub
  async getIntegrationSettings() {
    const res = await api.get<ApiResponse<{ settings: Record<string, string>; raw: any[] }>>('/admin/integrations/settings');
    return res.data.data?.settings || {};
  },

  async testEmailConnection(email?: string) {
    const res = await api.post<ApiResponse<any>>('/admin/integrations/test-email', { email });
    return res.data;
  },

  async testSmsConnection(phone: string, message?: string) {
    const res = await api.post<ApiResponse<any>>('/admin/integrations/test-sms', { phone, message });
    return res.data;
  },

  async testCourierConnection(courierName: string = 'Steadfast') {
    const res = await api.post<ApiResponse<any>>('/admin/integrations/test-courier', { courierName });
    return res.data;
  },

  // Media & Website Images Management
  async getMediaAssets(params: { section?: string; slot?: string; search?: string; page?: number; limit?: number } = {}) {
    const res = await api.get<ApiResponse<{ assets: any[]; slots: Record<string, any>; meta: any }>>('/media', { params });
    return res.data.data || { assets: [], slots: {}, meta: { total: 0, page: 1, totalPages: 1 } };
  },

  async uploadMediaAsset(file: File, metadata: { title?: string; section?: string; slot?: string; altText?: string }) {
    const formData = new FormData();
    formData.append('image', file);
    if (metadata.title) formData.append('title', metadata.title);
    if (metadata.section) formData.append('section', metadata.section);
    if (metadata.slot) formData.append('slot', metadata.slot);
    if (metadata.altText) formData.append('altText', metadata.altText);

    const res = await api.post<ApiResponse<any>>('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async replaceSlotImage(slot: string, data: { file?: File; url?: string; title?: string; altText?: string; section?: string }) {
    const formData = new FormData();
    if (data.file) {
      formData.append('image', data.file);
    }
    if (data.url) formData.append('url', data.url);
    if (data.title) formData.append('title', data.title);
    if (data.altText) formData.append('altText', data.altText);
    if (data.section) formData.append('section', data.section);

    const res = await api.put<ApiResponse<any>>(`/media/slots/${slot}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  async updateMediaAsset(id: string, data: { title?: string; altText?: string; section?: string; slot?: string | null; url?: string }) {
    const res = await api.put<ApiResponse<any>>(`/media/${id}`, data);
    return res.data;
  },

  async deleteMediaAsset(id: string, force: boolean = false) {
    const res = await api.delete<ApiResponse<any>>(`/media/${id}`, {
      params: force ? { force: 'true' } : undefined,
    });
    return res.data;
  },
};

// Storefront public media slots service with fallback
export const publicMediaService = {
  async getSlots() {
    try {
      const res = await api.get<ApiResponse<Record<string, { url: string; altText: string; title: string }>>>('/media/slots');
      return res.data.data || {};
    } catch {
      return {};
    }
  },
};

