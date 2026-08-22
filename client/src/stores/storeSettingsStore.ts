import { create } from 'zustand';
import { api } from '../services/api';
import { AnalyticsService } from '../services/analytics.service';

interface StoreSettingsState {
  settings: Record<string, string>;
  isLoading: boolean;
  fetchSettings: () => Promise<void>;
  getSetting: (key: string, defaultValue?: string) => string;
}

export const useStoreSettingsStore = create<StoreSettingsState>((set, get) => ({
  settings: {
    STORE_NAME: 'Skincare Bangladesh',
    SUPPORT_EMAIL: 'support@skincare.com.bd',
    SUPPORT_PHONE: '+880 1711-223344',
    STORE_ADDRESS: 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh',
    STORE_LOGO_URL: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400',
    FACEBOOK_URL: 'https://facebook.com/skincarebd',
    INSTAGRAM_URL: 'https://instagram.com/skincarebd',
    WHATSAPP_NUMBER: '+8801711223344',
    FOOTER_TAGLINE: '100% Authentic Dermatological Skincare Formulated for Tropical Weather.',
  },
  isLoading: false,

  fetchSettings: async () => {
    try {
      set({ isLoading: true });
      const res = await api.get('/settings/public');
      if (res.data?.data) {
        set({ settings: { ...get().settings, ...res.data.data }, isLoading: false });
        // Auto-initialize Analytics with fetched store settings
        AnalyticsService.init(res.data.data);
      }
    } catch {
      set({ isLoading: false });
      AnalyticsService.init();
    }
  },

  getSetting: (key: string, defaultValue: string = '') => {
    return get().settings[key] || defaultValue;
  },
}));
