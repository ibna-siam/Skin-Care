import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Tag,
  Star,
  Sliders,
  Cpu,
  Boxes,
  Bell,
  Settings,
  History,
  TrendingUp,
  CreditCard,
  Plus,
  ArrowRight,
  X,
  Store,
} from 'lucide-react';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Analytics' | 'System';
  icon: React.ElementType;
  shortcut?: string;
  keywords: string[];
  action: () => void;
}

interface AdminCommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenQuickAction: (action: string) => void;
}

export const AdminCommandPalette: React.FC<AdminCommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenQuickAction,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commandItems: CommandItem[] = [
    // Navigation
    {
      id: 'nav-dashboard',
      title: 'Overview Dashboard',
      category: 'Navigation',
      icon: LayoutDashboard,
      keywords: ['home', 'overview', 'kpi', 'sales', 'metrics'],
      action: () => navigate('/admin'),
    },
    {
      id: 'nav-products',
      title: 'Products Catalog',
      category: 'Navigation',
      icon: Package,
      keywords: ['products', 'catalog', 'skincare', 'items', 'variants'],
      action: () => navigate('/admin/products'),
    },
    {
      id: 'nav-inventory',
      title: 'Inventory & Stock Management',
      category: 'Navigation',
      icon: Boxes,
      keywords: ['inventory', 'stock', 'low stock', 'warehouse'],
      action: () => navigate('/admin/inventory'),
    },
    {
      id: 'nav-orders',
      title: 'Customer Orders',
      category: 'Navigation',
      icon: ShoppingBag,
      keywords: ['orders', 'fulfillment', 'shipment', 'tracking', 'pending'],
      action: () => navigate('/admin/orders'),
    },
    {
      id: 'nav-customers',
      title: 'Customers CRM',
      category: 'Navigation',
      icon: Users,
      keywords: ['customers', 'crm', 'users', 'profiles', 'segments'],
      action: () => navigate('/admin/customers'),
    },
    {
      id: 'nav-coupons',
      title: 'Coupons & Discounts',
      category: 'Navigation',
      icon: Tag,
      keywords: ['coupons', 'discounts', 'promo', 'vouchers', 'marketing'],
      action: () => navigate('/admin/coupons'),
    },
    {
      id: 'nav-automations',
      title: 'Automations & Background Workflows',
      category: 'Navigation',
      icon: Cpu,
      keywords: ['automations', 'workflows', 'triggers', 'abandoned cart', 'cron'],
      action: () => navigate('/admin/automations'),
    },
    {
      id: 'nav-reviews',
      title: 'Reviews Moderation',
      category: 'Navigation',
      icon: Star,
      keywords: ['reviews', 'ratings', 'feedback', 'moderation'],
      action: () => navigate('/admin/reviews'),
    },
    {
      id: 'nav-cms',
      title: 'Homepage CMS & Banners',
      category: 'Navigation',
      icon: Sliders,
      keywords: ['cms', 'homepage', 'content', 'banners', 'hero'],
      action: () => navigate('/admin/cms'),
    },
    {
      id: 'nav-notifications',
      title: 'Admin Notification Center',
      category: 'Navigation',
      icon: Bell,
      keywords: ['notifications', 'alerts', 'messages'],
      action: () => navigate('/admin/notifications'),
    },

    // Actions
    {
      id: 'act-new-product',
      title: 'Add New Product',
      category: 'Actions',
      icon: Plus,
      shortcut: 'P',
      keywords: ['new product', 'create product', 'add item'],
      action: () => onOpenQuickAction('create_product'),
    },
    {
      id: 'act-new-coupon',
      title: 'Create Coupon Code',
      category: 'Actions',
      icon: Plus,
      shortcut: 'C',
      keywords: ['new coupon', 'create discount', 'promo code'],
      action: () => onOpenQuickAction('create_coupon'),
    },
    {
      id: 'act-new-automation',
      title: 'Create New Automation Rule',
      category: 'Actions',
      icon: Plus,
      shortcut: 'A',
      keywords: ['new automation', 'rule', 'trigger'],
      action: () => onOpenQuickAction('create_automation'),
    },
    {
      id: 'act-storefront',
      title: 'Open Live Storefront in New Tab',
      category: 'Actions',
      icon: Store,
      keywords: ['storefront', 'public', 'website', 'shop'],
      action: () => window.open('/', '_blank'),
    },

    // Analytics
    {
      id: 'ana-sales',
      title: 'Sales & Revenue Analytics',
      category: 'Analytics',
      icon: TrendingUp,
      keywords: ['sales', 'revenue', 'analytics', 'reports', 'finance'],
      action: () => navigate('/admin/analytics/sales'),
    },
    {
      id: 'ana-payments',
      title: 'Payments & Gateway Operations',
      category: 'Analytics',
      icon: CreditCard,
      keywords: ['payments', 'bkash', 'nagad', 'sslcommerz', 'cod'],
      action: () => navigate('/admin/operations/payments'),
    },

    // System
    {
      id: 'sys-settings',
      title: 'Admin Settings & Store Config',
      category: 'System',
      icon: Settings,
      keywords: ['settings', 'config', 'delivery fee', 'system'],
      action: () => navigate('/admin/settings'),
    },
    {
      id: 'sys-logs',
      title: 'Activity & Audit Logs',
      category: 'System',
      icon: History,
      keywords: ['activity logs', 'audit', 'security', 'history'],
      action: () => navigate('/admin/system/activity-logs'),
    },
  ];

  // Filter commands
  const filteredItems = commandItems.filter((item) => {
    if (!query.trim()) return true;
    const cleanQuery = query.toLowerCase().trim();
    return (
      item.title.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery) ||
      item.keywords.some((k) => k.toLowerCase().includes(cleanQuery))
    );
  });

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation within palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] animate-in zoom-in-95 duration-150"
        onKeyDown={handleKeyDown}
      >
        {/* Search Header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/50">
          <Search size={18} className="text-emerald-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Type a command or search (e.g. Products, Orders, Automations)..."
            className="w-full bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200 rounded"
            >
              <X size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 px-1.5 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No matching commands or pages found for &quot;{query}&quot;
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={16} className={isSelected ? 'text-white' : 'text-slate-400'} />
                    <div>
                      <span className="font-medium">{item.title}</span>
                      <span
                        className={`ml-2 text-[10px] uppercase font-mono tracking-wider ${
                          isSelected ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.shortcut && (
                      <span
                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                          isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {item.shortcut}
                      </span>
                    )}
                    {isSelected && <ArrowRight size={14} className="text-white" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">↑</kbd>{' '}
              <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">↓</kbd> Navigate
            </span>
            <span>
              <kbd className="px-1 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px]">↵</kbd> Select
            </span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400">Skincare Command Palette</span>
        </div>
      </div>
    </div>
  );
};
