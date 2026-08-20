import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useAdminThemeStore, AdminTheme } from '../../stores/adminThemeStore';
import {
  Menu,
  Search,
  Bell,
  Plus,
  Moon,
  Sun,
  Laptop,
  ChevronRight,
  LogOut,
  User,
  Shield,
  ExternalLink,
  Package,
  Tag,
  Sliders,
  AlertTriangle,
  Cpu,
} from 'lucide-react';

interface AdminTopbarProps {
  onOpenMobileSidebar: () => void;
  onOpenCommandPalette: () => void;
  onOpenQuickAction: (action: string) => void;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({
  onOpenMobileSidebar,
  onOpenCommandPalette,
  onOpenQuickAction,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useAdminThemeStore();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const quickActionsRef = useRef<HTMLDivElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(e.target as Node)) {
        setIsQuickActionsOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Format breadcrumbs from pathname
  const pathSegments = location.pathname
    .replace(/^\/admin/, '')
    .split('/')
    .filter(Boolean);

  const formatBreadcrumb = (segment: string) => {
    return segment
      .replace(/-/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const getPageTitle = () => {
    if (pathSegments.length === 0) return 'Overview Dashboard';
    return formatBreadcrumb(pathSegments[pathSegments.length - 1]);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <header className="h-16 sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 flex items-center justify-between transition-colors">
      {/* Left side: Hamburger + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
          aria-label="Open Navigation"
        >
          <Menu size={20} />
        </button>

        <div className="flex flex-col">
          {/* Breadcrumb row */}
          <nav className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            <Link to="/admin" className="hover:text-emerald-400 transition-colors">
              Admin
            </Link>
            {pathSegments.map((segment, idx) => {
              const routeTo = `/admin/${pathSegments.slice(0, idx + 1).join('/')}`;
              const isLast = idx === pathSegments.length - 1;
              return (
                <React.Fragment key={routeTo}>
                  <ChevronRight size={12} className="text-slate-400" />
                  {isLast ? (
                    <span className="text-slate-200 font-semibold">{formatBreadcrumb(segment)}</span>
                  ) : (
                    <Link to={routeTo} className="hover:text-emerald-400 transition-colors">
                      {formatBreadcrumb(segment)}
                    </Link>
                  )}
                </React.Fragment>
              );
            })}
          </nav>

          {/* Current Page Title */}
          <h1 className="text-sm font-bold text-slate-100 hidden sm:block">
            {getPageTitle()}
          </h1>
        </div>
      </div>

      {/* Right side: Search, Quick Actions, Theme, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Command / Search Trigger */}
        <button
          onClick={onOpenCommandPalette}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs transition-all group"
          title="Search commands and resources (Ctrl+K)"
        >
          <Search size={14} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
          <span className="hidden md:inline">Search anything...</span>
          <kbd className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-300 rounded border border-slate-700">
            ⌘K
          </kbd>
        </button>

        {/* Quick Actions Dropdown */}
        <div className="relative" ref={quickActionsRef}>
          <button
            onClick={() => setIsQuickActionsOpen(!isQuickActionsOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
            title="Create new record"
          >
            <Plus size={14} />
            <span className="hidden sm:inline">New</span>
          </button>

          {isQuickActionsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickAction('create_product');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl text-left transition-colors"
              >
                <Package size={15} className="text-emerald-400" />
                <span>+ Add Product</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickAction('create_coupon');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl text-left transition-colors"
              >
                <Tag size={15} className="text-amber-400" />
                <span>+ Create Coupon</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  onOpenQuickAction('create_automation');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl text-left transition-colors"
              >
                <Cpu size={15} className="text-teal-400" />
                <span>+ Create Automation</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  navigate('/admin/cms');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl text-left transition-colors"
              >
                <Sliders size={15} className="text-blue-400" />
                <span>Update Homepage CMS</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickActionsOpen(false);
                  navigate('/admin/inventory');
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl text-left transition-colors"
              >
                <AlertTriangle size={15} className="text-rose-400" />
                <span>View Low Stock</span>
              </button>
            </div>
          )}
        </div>

        {/* Theme Selector */}
        <div className="relative" ref={themeRef}>
          <button
            onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-colors"
            title="Switch Theme"
          >
            {theme === 'dark' ? <Moon size={16} /> : theme === 'light' ? <Sun size={16} /> : <Laptop size={16} />}
          </button>

          {isThemeMenuOpen && (
            <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 text-xs space-y-0.5 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setTheme('light');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                  theme === 'light' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Sun size={14} /> Light
              </button>
              <button
                onClick={() => {
                  setTheme('dark');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                  theme === 'dark' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Moon size={14} /> Dark
              </button>
              <button
                onClick={() => {
                  setTheme('system');
                  setIsThemeMenuOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-colors ${
                  theme === 'system' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Laptop size={14} /> System
              </button>
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
        <Link
          to="/admin/notifications"
          className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl border border-transparent hover:border-slate-800 transition-colors"
          title="Notification Center"
        >
          <Bell size={16} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-950 animate-pulse" />
        </Link>

        {/* User Profile Pill & Dropdown */}
        <div className="relative pl-1 sm:pl-2 border-l border-slate-800/80" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-900 border border-transparent hover:border-slate-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden xl:flex flex-col">
              <span className="text-xs font-semibold text-slate-200 leading-tight truncate max-w-[110px]">
                {user?.name || 'Administrator'}
              </span>
              <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                {user?.role || 'SUPER_ADMIN'}
              </span>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-xs space-y-1 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2.5 border-b border-slate-800 bg-slate-950/40 rounded-xl">
                <p className="font-semibold text-slate-100">{user?.name || 'Administrator'}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email || 'admin@skincare.com.bd'}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-950/70 border border-emerald-800/60 rounded-md text-[10px] font-mono font-bold text-emerald-400 uppercase">
                  <Shield size={10} />
                  {user?.role || 'SUPER_ADMIN'}
                </div>
              </div>

              <div className="py-1">
                <Link
                  to="/admin/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <User size={14} className="text-slate-400" />
                  <span>Admin Settings</span>
                </Link>
                <Link
                  to="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-800/80 rounded-xl transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <ExternalLink size={14} className="text-slate-400" />
                    <span>View Storefront</span>
                  </span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors font-medium"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
