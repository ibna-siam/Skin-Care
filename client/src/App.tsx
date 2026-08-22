import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import { useWishlistStore } from './stores/wishlistStore';

// Layout & Global Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileNav } from './components/layout/MobileNav';
import { SearchModal } from './components/layout/SearchModal';
import { AuthModal } from './components/auth/AuthModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { QuickViewModal } from './components/product/QuickViewModal';

// Fast Loading Critical Storefront Pages
import { Home } from './pages/Home';
import { Shop } from './pages/Shop';

// Lazy Loaded Non-Critical & Admin Pages
const ProductDetail = lazy(() => import('./pages/ProductDetail').then(m => ({ default: m.ProductDetail })));
const CartPage = lazy(() => import('./pages/CartPage').then(m => ({ default: m.CartPage })));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage').then(m => ({ default: m.CheckoutPage })));
const OrderTrackPage = lazy(() => import('./pages/OrderTrackPage').then(m => ({ default: m.OrderTrackPage })));
const SkinGuidePage = lazy(() => import('./pages/SkinGuidePage').then(m => ({ default: m.SkinGuidePage })));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(m => ({ default: m.WishlistPage })));
const AccountPage = lazy(() => import('./pages/AccountPage').then(m => ({ default: m.AccountPage })));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(m => ({ default: m.ForgotPasswordPage })));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage').then(m => ({ default: m.ResetPasswordPage })));
const PaymentMockGateway = lazy(() => import('./pages/PaymentMockGateway').then(m => ({ default: m.PaymentMockGateway })));
const AboutPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ContactPage })));
const FAQPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.FAQPage })));
const ShippingPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.ShippingPage })));
const TermsPage = lazy(() => import('./pages/StaticPages').then(m => ({ default: m.TermsPage })));

// Admin Lazy Modules (Heavy dependencies like Recharts are split out)
import { AdminRouteGuard } from './components/admin/AdminRouteGuard';
const AdminLoginPage = lazy(() => import('./pages/admin/AdminLoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts').then(m => ({ default: m.AdminProducts })));
const AdminMedia = lazy(() => import('./pages/admin/AdminMedia').then(m => ({ default: m.AdminMedia })));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories').then(m => ({ default: m.AdminCategories })));
const AdminBrands = lazy(() => import('./pages/admin/AdminBrands').then(m => ({ default: m.AdminBrands })));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory').then(m => ({ default: m.AdminInventory })));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders').then(m => ({ default: m.AdminOrders })));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers').then(m => ({ default: m.AdminCustomers })));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews').then(m => ({ default: m.AdminReviews })));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons').then(m => ({ default: m.AdminCoupons })));
const AdminCampaigns = lazy(() => import('./pages/admin/AdminCampaigns').then(m => ({ default: m.AdminCampaigns })));
const AdminCMS = lazy(() => import('./pages/admin/AdminCMS').then(m => ({ default: m.AdminCMS })));
const AdminBanners = lazy(() => import('./pages/admin/AdminBanners').then(m => ({ default: m.AdminBanners })));
const AdminAutomations = lazy(() => import('./pages/admin/AdminAutomations').then(m => ({ default: m.AdminAutomations })));
const AdminNotifications = lazy(() => import('./pages/admin/AdminNotifications').then(m => ({ default: m.AdminNotifications })));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter').then(m => ({ default: m.AdminNewsletter })));
const AdminSkinGuide = lazy(() => import('./pages/admin/AdminSkinGuide').then(m => ({ default: m.AdminSkinGuide })));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics').then(m => ({ default: m.AdminAnalytics })));
const AdminOperations = lazy(() => import('./pages/admin/AdminOperations').then(m => ({ default: m.AdminOperations })));
const AdminSystem = lazy(() => import('./pages/admin/AdminSystem').then(m => ({ default: m.AdminSystem })));
const AdminIntegrations = lazy(() => import('./pages/admin/AdminIntegrations').then(m => ({ default: m.AdminIntegrations })));
const AdminPlaceholderSection = lazy(() => import('./pages/admin/AdminPlaceholderSection').then(m => ({ default: m.AdminPlaceholderSection })));

// QueryClient with 5-minute stale cache for blazing fast navigation
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 15,
    },
  },
});

// Top bar loading spinner fallback
const PageLoader = () => (
  <div className="min-h-[60vh] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-9 h-9 border-3 border-brand-800 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-semibold tracking-wider text-charcoal-400 uppercase">Loading Experience...</p>
    </div>
  </div>
);

// Admin Skeleton Loader
const AdminLoader = () => (
  <div className="min-h-[70vh] flex items-center justify-center bg-slate-950 text-slate-300">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-mono text-slate-400">Loading Admin Portal...</p>
    </div>
  </div>
);

import { useStoreSettingsStore } from './stores/storeSettingsStore';
import { AnalyticsService } from './services/analytics.service';

// Scroll to top and track page view on navigation
function ScrollToTopAndTrack() {
  const { pathname, search } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    const pageTitle = document.title || 'Skincare Bangladesh';
    AnalyticsService.trackPageView(pageTitle, pathname + search);
  }, [pathname, search]);
  return null;
}

// Storefront Shell
function StorefrontLayout() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-cream-200 text-charcoal-800 font-sans selection:bg-brand-800 selection:text-white">
      <Header />
      <MobileNav />
      <SearchModal />
      <AuthModal />
      <CartDrawer />
      <QuickViewModal />

      <main className="flex-1">
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}

export const App: React.FC = () => {
  const fetchUser = useAuthStore((state) => state.fetchUser);
  const fetchCart = useCartStore((state) => state.fetchCart);
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const fetchSettings = useStoreSettingsStore((state) => state.fetchSettings);

  useEffect(() => {
    fetchSettings();
    fetchUser();
    fetchCart();
    fetchWishlist();
  }, [fetchSettings, fetchUser, fetchCart, fetchWishlist]);

  return (
    <QueryClientProvider client={queryClient}>
      <ScrollToTopAndTrack />
      <Routes>
        {/* Storefront Routes */}
        <Route element={<StorefrontLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/shop/men" element={<Shop defaultGender="MEN" />} />
          <Route path="/shop/women" element={<Shop defaultGender="WOMEN" />} />
          <Route path="/category/:slug" element={<Shop />} />
          <Route path="/shop/category/:slug" element={<Shop />} />
          <Route path="/brand/:slug" element={<Shop />} />
          <Route path="/skin-type/:slug" element={<Shop />} />
          <Route path="/concern/:slug" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track-order" element={<OrderTrackPage />} />
          <Route path="/skin-guide" element={<SkinGuidePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/account/addresses" element={<AccountPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/faq" element={<FAQPage />} />
          <Route path="/shipping" element={<ShippingPage />} />
          <Route path="/privacy" element={<TermsPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/payment/mock-gateway" element={<PaymentMockGateway />} />
        </Route>

        {/* Dedicated Admin Login */}
        <Route
          path="/admin/login"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminLoginPage />
            </Suspense>
          }
        />

        {/* Protected Admin Portal */}
        <Route
          path="/admin"
          element={
            <Suspense fallback={<AdminLoader />}>
              <AdminRouteGuard>
                <AdminLayout />
              </AdminRouteGuard>
            </Suspense>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="customers/segments" element={<AdminCustomers />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="campaigns" element={<AdminCampaigns />} />
          <Route path="automations" element={<AdminAutomations />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="cms" element={<AdminCMS />} />
          <Route path="banners" element={<AdminBanners />} />
          <Route path="skin-guide" element={<AdminSkinGuide />} />
          <Route path="newsletter" element={<AdminNewsletter />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="analytics/sales" element={<AdminAnalytics />} />
          <Route path="analytics/products" element={<AdminAnalytics />} />
          <Route path="analytics/customers" element={<AdminAnalytics />} />
          <Route path="analytics/marketing" element={<AdminAnalytics />} />
          <Route path="operations" element={<AdminOperations />} />
          <Route path="operations/delivery" element={<AdminOperations />} />
          <Route path="operations/payments" element={<AdminOperations />} />
          <Route path="operations/alerts" element={<AdminOperations />} />
          <Route path="system" element={<AdminSystem />} />
          <Route path="system/users" element={<AdminSystem />} />
          <Route path="system/settings" element={<AdminSystem />} />
          <Route path="settings" element={<AdminSystem />} />
          <Route path="integrations" element={<AdminIntegrations />} />
          <Route path="system/integrations" element={<AdminIntegrations />} />
          <Route path="system/activity-logs" element={<AdminSystem />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
};
