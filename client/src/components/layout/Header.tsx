import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, User, Heart, ShoppingBag, Menu, X, ShieldCheck, LogOut, ChevronDown } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

export const Header: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  const cartCount = useCartStore((state) => state.count);
  const openCart = useCartStore((state) => state.openCart);
  const wishlistItems = useWishlistStore((state) => state.items);
  const { user, openAuthModal, logout } = useAuthStore();
  const { openSearch, toggleMobileNav } = useUIStore();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop' },
    { name: 'Men', path: '/shop?gender=MEN' },
    { name: 'Women', path: '/shop?gender=WOMEN' },
    { name: 'Skin Guide', path: '/skin-guide' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    if (path.includes('?')) return location.pathname + location.search === path;
    return location.pathname.startsWith(path);
  };

  const handleAccountClick = () => {
    if (!user) {
      openAuthModal('login');
    } else {
      setIsAccountMenuOpen(!isAccountMenuOpen);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-300 ${
        isScrolled
          ? 'bg-cream-200/95 backdrop-blur-md shadow-sm border-b border-cream-300/80 py-2.5'
          : 'bg-cream-200 border-b border-cream-300/40 py-3.5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Mobile menu trigger */}
          <button
            onClick={toggleMobileNav}
            className="md:hidden p-2 text-charcoal-800 hover:text-brand-800 focus:outline-none"
            aria-label="Open menu"
          >
            <Menu size={24} />
          </button>

          {/* Logo matching the reference design */}
          <Link to="/" className="flex flex-col items-center group">
            <div className="flex items-center gap-1">
              <span className="font-serif italic text-2xl md:text-3xl font-bold tracking-tight text-brand-800 hover:text-brand-900 transition-colors">
                Skincare
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-brand-700/80 font-medium -mt-1">
              Real Authentic Skin
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative py-1 text-sm font-medium transition-colors ${
                    active
                      ? 'text-brand-800 font-semibold'
                      : 'text-charcoal-800/80 hover:text-brand-800'
                  }`}
                >
                  {link.name}
                  {active && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-800 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons (Contact, Search, Account, Wishlist, Cart) */}
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Contact text link matching design */}
            <Link
              to="/contact"
              className="hidden lg:inline-block text-xs font-medium text-charcoal-800/70 hover:text-brand-800 transition-colors"
            >
              Contact
            </Link>

            {/* Search Icon */}
            <button
              onClick={openSearch}
              className="p-1.5 text-charcoal-800 hover:text-brand-800 transition-colors rounded-full hover:bg-cream-300/60"
              aria-label="Search"
            >
              <Search size={20} />
            </button>

            {/* User Account Icon & Dropdown */}
            <div className="relative">
              <button
                onClick={handleAccountClick}
                className="p-1.5 text-charcoal-800 hover:text-brand-800 transition-colors rounded-full hover:bg-cream-300/60 flex items-center gap-1"
                aria-label="Account"
              >
                <User size={20} />
                {user && (
                  <span className="hidden xl:inline-block text-xs font-medium max-w-[80px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                )}
              </button>

              {/* Account Dropdown */}
              {isAccountMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-card border border-cream-300 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-xs text-gray-500">Signed in as</p>
                    <p className="text-sm font-semibold text-charcoal-800 truncate">{user.name}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] uppercase font-semibold bg-brand-50 text-brand-800 rounded">
                      {user.role}
                    </span>
                  </div>

                  {user.role !== 'CUSTOMER' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsAccountMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-brand-800 font-medium hover:bg-brand-50 transition-colors"
                    >
                      <ShieldCheck size={16} /> Admin Portal
                    </Link>
                  )}

                  <Link
                    to="/account"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    My Account & Orders
                  </Link>
                  <Link
                    to="/account/addresses"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    Delivery Addresses
                  </Link>
                  <Link
                    to="/track-order"
                    onClick={() => setIsAccountMenuOpen(false)}
                    className="block px-4 py-2 text-sm text-charcoal-800 hover:bg-cream-100 transition-colors"
                  >
                    Track Order
                  </Link>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        logout();
                        setIsAccountMenuOpen(false);
                      }}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist Icon with count badge */}
            <Link
              to="/wishlist"
              className="relative p-1.5 text-charcoal-800 hover:text-brand-800 transition-colors rounded-full hover:bg-cream-300/60"
              aria-label="Wishlist"
            >
              <Heart size={20} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Icon with count badge (matching the green pill count in the design) */}
            <button
              onClick={openCart}
              className="relative p-1.5 text-charcoal-800 hover:text-brand-800 transition-colors rounded-full hover:bg-cream-300/60"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={20} />
              <span className="absolute -top-1 -right-1.5 bg-brand-800 text-white text-[10px] font-bold min-w-[17px] h-[17px] px-1 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
