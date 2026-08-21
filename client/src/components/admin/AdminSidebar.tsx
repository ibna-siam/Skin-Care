import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Boxes,
  ShoppingBag,
  Clock,
  RefreshCw,
  Truck,
  CheckCircle2,
  RotateCcw,
  Users,
  UserCheck,
  Star,
  Tag,
  Megaphone,
  Cpu,
  Bell,
  LayoutTemplate,
  Image as ImageIcon,
  BookOpen,
  Mail,
  BarChart3,
  TrendingUp,
  LineChart,
  PieChart,
  Navigation,
  CreditCard,
  AlertTriangle,
  ShieldAlert,
  Settings,
  History,
  ChevronDown,
  Store,
  PanelLeftClose,
  PanelLeftOpen,
  X,
} from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeColor?: string;
  roles?: string[];
}

interface NavGroup {
  title: string;
  icon: React.ElementType;
  items: NavItem[];
  roles?: string[];
}

interface AdminSidebarProps {
  isMobileOpen: boolean;
  onMobileClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  isMobileOpen,
  onMobileClose,
  isCollapsed,
  onToggleCollapse,
}) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const userRole = user?.role || 'SUPER_ADMIN';

  // Track expanded groups
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Catalog: true,
    Orders: true,
    Customers: false,
    Marketing: false,
    Content: false,
    Analytics: false,
    Operations: false,
    System: false,
  });

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const navGroups: NavGroup[] = [
    {
      title: 'Catalog',
      icon: Package,
      roles: ['SUPER_ADMIN', 'PRODUCT_MANAGER'],
      items: [
        { label: 'Products', path: '/admin/products', icon: Package },
        { label: 'Categories', path: '/admin/categories', icon: Layers },
        { label: 'Brands', path: '/admin/brands', icon: Sparkles },
        { label: 'Inventory', path: '/admin/inventory', icon: Boxes },
      ],
    },
    {
      title: 'Orders',
      icon: ShoppingBag,
      roles: ['SUPER_ADMIN', 'ORDER_MANAGER', 'SUPPORT_STAFF'],
      items: [
        { label: 'All Orders', path: '/admin/orders', icon: ShoppingBag },
        { label: 'Pending', path: '/admin/orders?status=PENDING', icon: Clock },
        { label: 'Processing', path: '/admin/orders?status=PROCESSING', icon: RefreshCw },
        { label: 'Shipped', path: '/admin/orders?status=SHIPPED', icon: Truck },
        { label: 'Delivered', path: '/admin/orders?status=DELIVERED', icon: CheckCircle2 },
        { label: 'Returns', path: '/admin/orders?status=RETURNED', icon: RotateCcw },
      ],
    },
    {
      title: 'Customers',
      icon: Users,
      roles: ['SUPER_ADMIN', 'MARKETING_MANAGER', 'SUPPORT_STAFF', 'ORDER_MANAGER'],
      items: [
        { label: 'All Customers', path: '/admin/customers', icon: Users },
        { label: 'Segments', path: '/admin/customers/segments', icon: UserCheck },
        { label: 'Reviews', path: '/admin/reviews', icon: Star },
      ],
    },
    {
      title: 'Marketing',
      icon: Megaphone,
      roles: ['SUPER_ADMIN', 'MARKETING_MANAGER'],
      items: [
        { label: 'Coupons', path: '/admin/coupons', icon: Tag },
        { label: 'Campaigns', path: '/admin/campaigns', icon: Megaphone },
        { label: 'Automations', path: '/admin/automations', icon: Cpu, badge: 'New', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
        { label: 'Notifications', path: '/admin/notifications', icon: Bell },
      ],
    },
    {
      title: 'Content',
      icon: LayoutTemplate,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER'],
      items: [
        { label: 'Media & Images', path: '/admin/media', icon: ImageIcon, badge: 'Live', badgeColor: 'bg-emerald-500/20 text-emerald-400' },
        { label: 'Homepage CMS', path: '/admin/cms', icon: LayoutTemplate },
        { label: 'Banners', path: '/admin/banners', icon: ImageIcon },
        { label: 'Skin Guide', path: '/admin/skin-guide', icon: BookOpen },
        { label: 'Newsletter', path: '/admin/newsletter', icon: Mail },
      ],
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      roles: ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER', 'PRODUCT_MANAGER'],
      items: [
        { label: 'Sales Overview', path: '/admin/analytics/sales', icon: TrendingUp },
        { label: 'Product Analytics', path: '/admin/analytics/products', icon: LineChart },
        { label: 'Customer Insights', path: '/admin/analytics/customers', icon: PieChart },
        { label: 'Marketing ROI', path: '/admin/analytics/marketing', icon: Megaphone },
      ],
    },
    {
      title: 'Operations',
      icon: Navigation,
      roles: ['SUPER_ADMIN', 'ADMIN', 'ORDER_MANAGER'],
      items: [
        { label: 'Delivery Setup', path: '/admin/operations/delivery', icon: Navigation },
        { label: 'Payments', path: '/admin/operations/payments', icon: CreditCard },
        { label: 'Inventory Alerts', path: '/admin/operations/alerts', icon: AlertTriangle },
      ],
    },
    {
      title: 'System',
      icon: Settings,
      roles: ['SUPER_ADMIN', 'ADMIN'],
      items: [
        { label: 'Users & Roles', path: '/admin/system/users', icon: ShieldAlert },
        { label: 'Settings & Security', path: '/admin/settings', icon: Settings },
        { label: 'Activity Logs', path: '/admin/system/activity-logs', icon: History },
      ],
    },
  ];

  const hasAccess = (roles?: string[]) => {
    if (!roles || roles.length === 0) return true;
    if (userRole === 'SUPER_ADMIN') return true;
    return roles.includes(userRole);
  };

  const isItemActive = (path: string) => {
    if (path.includes('?')) {
      return location.pathname + location.search === path;
    }
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname === path || (location.pathname.startsWith(path) && path !== '/admin');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-950 border-r border-slate-800 text-slate-300 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80 bg-slate-950/50 backdrop-blur shrink-0">
          {!isCollapsed && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md shadow-emerald-900/30">
                <span className="font-serif italic text-lg">S</span>
              </div>
              <div className="flex flex-col">
                <span className="font-serif italic text-lg font-bold text-slate-100 tracking-tight">Skincare BD</span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-semibold">Command Center</span>
              </div>
            </div>
          )}

          {isCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white font-bold shadow-md">
                <span className="font-serif italic text-lg">S</span>
              </div>
            </div>
          )}

          {/* Desktop collapse toggle & Mobile close */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
            <button
              onClick={onMobileClose}
              className="flex lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Navigation Content */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 custom-scrollbar">
          {/* Main Dashboard Link */}
          <div>
            <NavLink
              to="/admin"
              end
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                } ${isCollapsed ? 'justify-center px-2' : ''}`
              }
              title="Overview Dashboard"
            >
              <LayoutDashboard size={18} className="shrink-0" />
              {!isCollapsed && <span>Overview Dashboard</span>}
            </NavLink>
          </div>

          {/* Nav Groups */}
          {navGroups.map((group) => {
            if (!hasAccess(group.roles)) return null;
            const isOpen = openGroups[group.title] ?? true;
            const GroupIcon = group.icon;

            return (
              <div key={group.title} className="space-y-1">
                {!isCollapsed ? (
                  <button
                    onClick={() => toggleGroup(group.title)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 hover:text-slate-200 transition-colors rounded-lg group"
                  >
                    <div className="flex items-center gap-2">
                      <GroupIcon size={14} className="text-slate-400 group-hover:text-emerald-400 transition-colors" />
                      <span>{group.title}</span>
                    </div>
                    <ChevronDown
                      size={14}
                      className={`transform transition-transform duration-200 ${isOpen ? 'rotate-0' : '-rotate-90'}`}
                    />
                  </button>
                ) : (
                  <div className="border-t border-slate-800/60 my-2" />
                )}

                {/* Sub items */}
                {(isOpen || isCollapsed) && (
                  <div className={`space-y-0.5 ${!isCollapsed ? 'pl-2 border-l border-slate-800/60 ml-3' : ''}`}>
                    {group.items.map((item) => {
                      if (!hasAccess(item.roles)) return null;
                      const active = isItemActive(item.path);
                      const ItemIcon = item.icon;

                      return (
                        <NavLink
                          key={item.path}
                          to={item.path}
                          onClick={onMobileClose}
                          className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                            active
                              ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/30 shadow-sm'
                              : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/80'
                          } ${isCollapsed ? 'justify-center px-2' : ''}`}
                          title={item.label}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <ItemIcon size={16} className={`shrink-0 ${active ? 'text-emerald-400' : 'text-slate-400'}`} />
                            {!isCollapsed && <span className="truncate">{item.label}</span>}
                          </div>
                          {!isCollapsed && item.badge && (
                            <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md uppercase tracking-wider ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                              {item.badge}
                            </span>
                          )}
                        </NavLink>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Quick Links */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40 shrink-0">
          <NavLink
            to="/"
            className={`flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-400 hover:text-emerald-400 hover:bg-slate-900 rounded-xl transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            title="View Live Storefront"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Store size={16} className="shrink-0 text-emerald-500" />
            {!isCollapsed && <span>View Storefront</span>}
          </NavLink>
        </div>
      </aside>
    </>
  );
};
