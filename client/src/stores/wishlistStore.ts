import { create } from 'zustand';
import { wishlistService } from '../services/cart.service';
import { useAuthStore } from './authStore';

interface WishlistState {
  items: any[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ items: [] });
      return;
    }
    try {
      set({ isLoading: true });
      const items = await wishlistService.getWishlist();
      set({ items, isLoading: false });
    } catch {
      set({ items: [], isLoading: false });
    }
  },

  toggleWishlist: async (productId: string) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      useAuthStore.getState().openAuthModal('login');
      return;
    }
    try {
      const res = await wishlistService.toggleWishlist(productId);
      if (res) {
        await get().fetchWishlist();
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update wishlist');
    }
  },

  isInWishlist: (productId: string) => {
    return get().items.some((item) => item.productId === productId || item.product?.id === productId);
  },
}));
