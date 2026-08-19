import { create } from 'zustand';
import { UserProfile } from '@skincare/shared';
import { authService } from '../services/auth.service';

interface AuthState {
  user: (UserProfile & { addresses?: any[]; stats?: any }) | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  setUser: (user: UserProfile | null) => void;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthModalOpen: false,
  authModalTab: 'login',

  openAuthModal: (tab = 'login') => set({ isAuthModalOpen: true, authModalTab: tab }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  setUser: (user) => set({ user }),

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const user = await authService.getMe();
      set({ user: user || null, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null });
    } catch (err) {
      console.error(err);
    }
  },
}));
