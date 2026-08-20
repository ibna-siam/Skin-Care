import { create } from 'zustand';

export type AdminTheme = 'dark' | 'light' | 'system';

interface AdminThemeState {
  theme: AdminTheme;
  setTheme: (theme: AdminTheme) => void;
  resolvedTheme: 'dark' | 'light';
}

const getInitialTheme = (): AdminTheme => {
  if (typeof window === 'undefined') return 'dark';
  const saved = localStorage.getItem('skincare_admin_theme') as AdminTheme;
  if (saved && ['dark', 'light', 'system'].includes(saved)) {
    return saved;
  }
  return 'dark';
};

const resolveTheme = (theme: AdminTheme): 'dark' | 'light' => {
  if (theme === 'system') {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  return theme;
};

export const useAdminThemeStore = create<AdminThemeState>((set, get) => ({
  theme: getInitialTheme(),
  resolvedTheme: resolveTheme(getInitialTheme()),
  setTheme: (theme: AdminTheme) => {
    localStorage.setItem('skincare_admin_theme', theme);
    const resolved = resolveTheme(theme);
    set({ theme, resolvedTheme: resolved });
  },
}));
