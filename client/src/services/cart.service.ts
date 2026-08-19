import { api } from './api';
import { ApiResponse } from '@skincare/shared';

export const cartService = {
  async getCart() {
    const res = await api.get<ApiResponse<{ id: string; items: any[]; subtotal: number; count: number }>>('/cart');
    return res.data.data;
  },

  async addToCart(productId: string, quantity: number = 1) {
    const res = await api.post<ApiResponse>('/cart', { productId, quantity });
    return res.data;
  },

  async updateCartItem(id: string, quantity: number) {
    const res = await api.put<ApiResponse>(`/cart/items/${id}`, { quantity });
    return res.data;
  },

  async removeCartItem(id: string) {
    const res = await api.delete<ApiResponse>(`/cart/items/${id}`);
    return res.data;
  },
};

export const wishlistService = {
  async getWishlist() {
    const res = await api.get<ApiResponse<any[]>>('/wishlist');
    return res.data.data || [];
  },

  async toggleWishlist(productId: string) {
    const res = await api.post<ApiResponse<{ inWishlist: boolean }>>('/wishlist/toggle', { productId });
    return res.data.data;
  },
};
