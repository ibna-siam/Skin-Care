import { api } from './api';
import { ApiResponse, UserProfile } from '@skincare/shared';

export const authService = {
  async register(data: { name: string; email: string; phone?: string; password: string; preferredSkinType?: string }) {
    const res = await api.post<ApiResponse<{ user: UserProfile; token: string }>>('/auth/register', data);
    return res.data;
  },

  async login(data: { identifier: string; password: string }) {
    const res = await api.post<ApiResponse<{ user: UserProfile; token: string }>>('/auth/login', data);
    return res.data;
  },

  async logout() {
    const res = await api.post<ApiResponse>('/auth/logout');
    return res.data;
  },

  async getMe() {
    const res = await api.get<ApiResponse<{ user: UserProfile & { addresses: any[]; stats: any } }>>('/auth/me');
    return res.data.data?.user;
  },

  async updateProfile(data: { name?: string; phone?: string; preferredSkinType?: string }) {
    const res = await api.put<ApiResponse<UserProfile>>('/auth/profile', data);
    return res.data;
  },

  async addAddress(data: any) {
    const res = await api.post<ApiResponse>('/auth/addresses', data);
    return res.data;
  },

  async deleteAddress(id: string) {
    const res = await api.delete<ApiResponse>(`/auth/addresses/${id}`);
    return res.data;
  },
};
