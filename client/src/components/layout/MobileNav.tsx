import React from 'react';
import { Link } from 'react-router-dom';
import { X, User, Heart, ShoppingBag, Search, Sparkles, MapPin, Phone } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { useCartStore } from '../../stores/cartStore';

export const MobileNav: React.FC = () => {
  const { isMobileNavOpen, closeMobileNav, openSearch } = useUIStore();
  const { user, openAuthModal, logout } = useAuthStore();
  const cartCount = useCartStore((state) => state.count);

  if (!isMobileNavOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={closeMobileNav}
      />

      {/* Drawer */}
      <div className="relative w-4/5 max-w-sm bg-cream-100 h-full shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-300">
        <div className="p-5 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-cream-300">
            <Link to="/" onClick={closeMobileNav} className="font-serif italic text-2xl font-bold text-brand-800">
              Skincare
            </Link>
            <button
              onClick={closeMobileNav}
              className="p-1 rounded-full text-charcoal-800 hover:bg-cream-200"
            >
              <X size={20} />
            </button>
          </div>

          {/* Quick Search Button */}
          <div className="mt-4">
            <button
              onClick={() => {
                closeMobileNav();
                openSearch();
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 bg-white border border-cream-300 rounded-xl text-sm text-gray-500 text-left shadow-sm"
            >
              <Search size={16} />
              <span>Search products, brands...</span>
            </button>
          </div>

          {/* Nav links */}
          <div className="mt-6 flex flex-col space-y-3">
            <Link
              to="/"
              onClick={closeMobileNav}
              className="text-base font-semibold text-charcoal-800 hover:text-brand-800 py-1"
            >
              Home
            </Link>
            <Link
              to="/shop"
              onClick={closeMobileNav}
              className="text-base font-semibold text-charcoal-800 hover:text-brand-800 py-1"
            >
              Shop All Products
            </Link>
            <Link
              to="/shop?gender=MEN"
              onClick={closeMobileNav}
              className="text-base font-semibold text-charcoal-800 hover:text-brand-800 py-1"
            >
              Men Skincare
            </Link>
            <Link
              to="/shop?gender=WOMEN"
              onClick={closeMobileNav}
              className="text-base font-semibold text-charcoal-800 hover:text-brand-800 py-1"
            >
              Women Skincare
            </Link>
            <Link
              to="/skin-guide"
              onClick={closeMobileNav}
              className="flex items-center justify-between text-base font-semibold text-brand-800 py-1"
            >
              <span>Skin Type Guide</span>
              <Sparkles size={16} className="text-amber-500" />
            </Link>
            <Link
              to="/track-order"
              onClick={closeMobileNav}
              className="text-base font-semibold text-charcoal-800 hover:text-brand-800 py-1"
            >
              Track Order
            </Link>
            <Link
              to="/contact"
              onClick={closeMobileNav}
              className="text-base font-medium text-gray-600 hover:text-brand-800 py-1"
            >
              Contact & Support
            </Link>
          </div>
        </div>

        {/* Footer info in mobile drawer */}
        <div className="p-5 border-t border-cream-300 bg-white/50">
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-800 text-white flex items-center justify-center font-bold text-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-semibold text-charcoal-800 truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to="/account"
                  onClick={closeMobileNav}
                  className="flex-1 text-center py-2 bg-brand-800 text-white rounded-lg text-xs font-semibold"
                >
                  My Account
                </Link>
                <button
                  onClick={() => {
                    logout();
                    closeMobileNav();
                  }}
                  className="px-3 py-2 border border-gray-300 text-charcoal-800 rounded-lg text-xs font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                closeMobileNav();
                openAuthModal('login');
              }}
              className="w-full py-2.5 bg-brand-800 text-white rounded-xl font-semibold text-sm hover:bg-brand-900 transition-colors shadow-sm"
            >
              Sign In / Register
            </button>
          )}

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="flex items-center gap-1"><Phone size={12} /> +880 123 456 7890</span>
            <span className="flex items-center gap-1"><MapPin size={12} /> Dhaka, BD</span>
          </div>
        </div>
      </div>
    </div>
  );
};
