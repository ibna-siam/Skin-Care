import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Star,
  Tag,
  Sliders,
  LogOut,
  Store,
  ShieldCheck
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Coupons & Discounts', path: '/admin/coupons', icon: Tag },
    { label: 'Homepage CMS', path: '/admin/cms', icon: Sliders },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Admin Sidebar */}
      <aside className="w-full md:w-64 bg-slate-950 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          {/* Brand Logo & Role */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <Link to="/admin" className="font-serif italic text-2xl font-bold text-emerald-400">
                Skincare
              </Link>
              <div className="flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 mt-0.5">
                <ShieldCheck size={12} className="text-emerald-400" />
                <span>Admin Console</span>
              </div>
            </div>
            <Link
              to="/"
              className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-xs font-semibold text-slate-300 flex items-center gap-1"
              title="View Public Store"
            >
              <Store size={14} />
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User profile & Logout */}
        <div className="pt-6 border-t border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.name || 'Administrator'}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.role || 'SUPER_ADMIN'}</p>
            </div>
          </div>

          <button
            onClick={async () => {
              await logout();
              navigate('/');
            }}
            className="w-full flex items-center justify-center gap-2 py-2 bg-slate-900 hover:bg-red-950/50 hover:text-red-400 text-slate-400 rounded-xl text-xs font-medium transition-colors"
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 bg-slate-900 p-6 md:p-10 overflow-y-auto max-h-screen">
        <Outlet />
      </main>
    </div>
  );
};
