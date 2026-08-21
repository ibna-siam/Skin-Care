import { api } from './api';
import { ApiResponse, UserProfile } from '@skincare/shared';

export const authService = {
  async register(data: { name: string; email: string; phone?: string; password: string; preferredSkinType?: string }) {
    const res = await api.post<ApiResponse<{ user: UserProfile; token: string }>>('/auth/register', data);
    if (res.data.data?.token) {
      localStorage.setItem('skincare_auth_token', res.data.data.token);
    }
    return res.data;
  },

  async login(data: { identifier: string; password: string }) {
    const res = await api.post<ApiResponse<{ user: UserProfile; token: string }>>('/auth/login', data);
    if (res.data.data?.token) {
      localStorage.setItem('skincare_auth_token', res.data.data.token);
    }
    return res.data;
  },

  async adminLogin(data: { identifier: string; password: string }) {
    const res = await api.post<ApiResponse<{ user: UserProfile; token: string }>>('/auth/admin-login', data);
    if (res.data.data?.token) {
      localStorage.setItem('skincare_auth_token', res.data.data.token);
    }
    return res.data;
  },

  async googleAuth(data: { credential?: string; email?: string; name?: string; googleId?: string; avatarUrl?: string }) {
    const res = await api.post<ApiResponse<{ user: UserProfile; token: string }>>('/auth/google', data);
    if (res.data.data?.token) {
      localStorage.setItem('skincare_auth_token', res.data.data.token);
    }
    return res.data;
  },

  async forgotPassword(email: string) {
    const res = await api.post<ApiResponse>('/auth/forgot-password', { email });
    return res.data;
  },

  async resetPassword(data: { token: string; newPassword: string }) {
    const res = await api.post<ApiResponse>('/auth/reset-password', data);
    return res.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const res = await api.post<ApiResponse>('/auth/change-password', data);
    return res.data;
  },

  async logout() {
    try {
      const res = await api.post<ApiResponse>('/auth/logout');
      return res.data;
    } finally {
      localStorage.removeItem('skincare_auth_token');
    }
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
