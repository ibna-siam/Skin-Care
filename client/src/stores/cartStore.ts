import { create } from 'zustand';
import { cartService } from '../services/cart.service';
import { SHIPPING_RATES } from '@skincare/shared';

export interface CartProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  brand?: string;
  image: string;
}

export interface CartItemState {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product: CartProduct;
}

interface CartState {
  items: CartItemState[];
  subtotal: number;
  count: number;
  isCartOpen: boolean;
  isLoading: boolean;
  appliedCoupon: {
    code: string;
    type: string;
    value: number;
    discountAmount: number;
    isFreeDelivery: boolean;
  } | null;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (coupon: any) => void;
  removeCoupon: () => void;
  freeShippingThreshold: number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  subtotal: 0,
  count: 0,
  isCartOpen: false,
  isLoading: false,
  appliedCoupon: null,
  freeShippingThreshold: SHIPPING_RATES.FREE_SHIPPING_THRESHOLD,

  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  fetchCart: async () => {
    try {
      set({ isLoading: true });
      const data = await cartService.getCart();
      if (data) {
        set({
          items: data.items || [],
          subtotal: data.subtotal || 0,
          count: data.count || 0,
          isLoading: false,
        });
      } else {
        set({ items: [], subtotal: 0, count: 0, isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId: string, quantity = 1) => {
    try {
      await cartService.addToCart(productId, quantity);
      await get().fetchCart();
      get().openCart();
    } catch (error: any) {
      alert(error.message || 'Failed to add item to cart');
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      await cartService.updateCartItem(itemId, quantity);
      await get().fetchCart();
    } catch (error: any) {
      alert(error.message || 'Failed to update item quantity');
    }
  },

  removeItem: async (itemId: string) => {
    try {
      await cartService.removeCartItem(itemId);
      await get().fetchCart();
    } catch (error: any) {
      console.error(error);
    }
  },

  clearCart: async () => {
    // 1. Immediately reset client state
    set({ items: [], subtotal: 0, count: 0, appliedCoupon: null });
    // 2. Clear backend database cart
    try {
      await cartService.clearCart();
    } catch (err) {
      console.warn('Backend cart clear error:', err);
    }
  },

  applyCoupon: (coupon) => set({ appliedCoupon: coupon }),
  removeCoupon: () => set({ appliedCoupon: null }),
}));
