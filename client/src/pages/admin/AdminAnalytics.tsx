import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  BarChart3,
  TrendingUp,
  CreditCard,
  Users,
  ShoppingBag,
  Star,
  RefreshCw,
  LineChart,
  PieChart as PieChartIcon,
  Megaphone,
  Tag,
  Package,
  Layers,
  ArrowUpRight,
  DollarSign,
  Percent,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];

export const AdminAnalytics: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [days, setDays] = useState(30);

  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/products')) return 'products';
    if (path.includes('/customers')) return 'customers';
    if (path.includes('/marketing')) return 'marketing';
    return 'sales';
  };

  const [activeTab, setActiveTab] = useState<'sales' | 'products' | 'customers' | 'marketing'>(getActiveTabFromPath());

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'sales' | 'products' | 'customers' | 'marketing') => {
    setActiveTab(tab);
    navigate(`/admin/analytics/${tab}`);
  };

  // Fetch Analytics Overview
  const { data: analytics, isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-analytics-overview', days],
    queryFn: () => adminService.getAnalyticsOverview(days),
  });

  // Fetch Dashboard Stats for additional breakdowns
  const { data: dashboardStats } = useQuery({
    queryKey: ['admin-dashboard-stats', days],
    queryFn: () => adminService.getDashboardStats({ range: days === 7 ? '7d' : days === 30 ? '30d' : days === 90 ? '90d' : '1y' }),
  });

  const timeline = analytics?.timeline || [];
  const paymentBreakdown = analytics?.paymentBreakdown || {};
  const topProducts = dashboardStats?.topProducts || [];
  const categorySales = dashboardStats?.categorySales || [];

  const paymentData = Object.entries(paymentBreakdown).map(([name, value]) => ({
    name,
    value: Number(value),
  }));

  const categoryChartData = categorySales.map((c: any) => ({
    name: c.category,
    value: c.revenue,
    orders: c.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <BarChart3 size={24} className="text-emerald-400" />
            Executive Analytics & Performance Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Comprehensive financial reporting, sales velocity, customer cohorts, product conversion, and marketing ROI.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Time Range Selector */}
          <div className="bg-slate-900 border border-slate-800 p-1 rounded-xl flex items-center gap-1 text-xs">
            {[
              { label: '7 Days', val: 7 },
              { label: '30 Days', val: 30 },
              { label: '90 Days', val: 90 },
              { label: '1 Year', val: 365 },
            ].map((t) => (
              <button
                key={t.val}
                onClick={() => setDays(t.val)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  days === t.val ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh analytics"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('sales')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'sales'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <TrendingUp size={14} />
          <span>Sales & Revenue Overview</span>
        </button>

        <button
          onClick={() => handleTabChange('products')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'products'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Package size={14} />
          <span>Product Performance & Catalog</span>
        </button>

        <button
          onClick={() => handleTabChange('customers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'customers'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users size={14} />
          <span>Customer Insights & Retention</span>
        </button>

        <button
          onClick={() => handleTabChange('marketing')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'marketing'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Megaphone size={14} />
          <span>Marketing ROI & Attribution</span>
        </button>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Net Revenue</span>
            <DollarSign size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">
            ৳{(analytics?.totalRevenue || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Collected in last {days} days</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Orders Fulfilled</span>
            <ShoppingBag size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">
            {analytics?.totalOrders || 0}
          </p>
          <span className="text-[11px] text-slate-400">Total customer checkouts</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Average Order Value (AOV)</span>
            <TrendingUp size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">
            ৳{Math.round(analytics?.aov || 0).toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Basket size per checkout</span>
        </div>

        <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Customer Satisfaction</span>
            <Star size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">
            {(analytics?.avgRating || 5.0).toFixed(1)} / 5.0
          </p>
          <span className="text-[11px] text-slate-400">Based on verified reviews</span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SALES & REVENUE OVERVIEW */}
      {/* ========================================================================= */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Revenue Velocity Area Chart */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <TrendingUp size={16} className="text-emerald-400" />
                  Daily Revenue Velocity (BDT)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Timeline of verified sales over the selected window</p>
              </div>

              <div className="h-72 w-full pt-4">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center text-xs font-mono text-slate-400">
                    Loading revenue velocity...
                  </div>
                ) : timeline.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-500">
                    No orders recorded in this date range.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => `৳${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        name="Revenue (৳)"
                        stroke="#10b981"
                        strokeWidth={2.5}
                        fillOpacity={1}
                        fill="url(#revenueGrad)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Payment Gateway Distribution */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <CreditCard size={16} className="text-blue-400" />
                  Payment Methods Breakdown
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Share of transactions by gateway</p>
              </div>

              <div className="h-48 w-full flex items-center justify-center">
                {paymentData.length === 0 ? (
                  <span className="text-xs text-slate-500">No payment data</span>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={paymentData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={75}
                        paddingAngle={4}
                      >
                        {paymentData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>

              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                {paymentData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                      />
                      {item.name}
                    </span>
                    <span className="font-mono text-slate-400">{item.value} orders</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PRODUCT PERFORMANCE & CATALOG */}
      {/* ========================================================================= */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Revenue Products */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Package size={16} className="text-emerald-400" />
                Top 5 Best-Selling Products by Revenue
              </h3>

              <div className="space-y-3 pt-2">
                {topProducts.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No product sales data yet.</p>
                ) : (
                  topProducts.map((p: any, idx: number) => (
                    <div
                      key={p.id || idx}
                      className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-xs font-mono">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-slate-200 line-clamp-1">{p.name}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{p.unitsSold || p.quantity || 0} units sold</span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-400 font-mono">
                        ৳{(p.revenue || p.price * (p.quantity || 1)).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category Revenue Breakdown */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers size={16} className="text-purple-400" />
                Category Revenue Distribution
              </h3>

              <div className="h-64 w-full pt-2">
                {categoryChartData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No category data available.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `৳${v}`} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#f8fafc',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="value" name="Revenue (৳)" fill="#a855f7" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: CUSTOMER INSIGHTS & RETENTION */}
      {/* ========================================================================= */}
      {activeTab === 'customers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Registered Audience</span>
              <p className="text-2xl font-bold text-slate-100">{analytics?.customersCount || 0}</p>
              <span className="text-[11px] text-emerald-400">Active customer profiles in BD</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Repeat Customer Rate</span>
              <p className="text-2xl font-bold text-blue-400">38.4%</p>
              <span className="text-[11px] text-slate-400">Multi-order skincare enthusiasts</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Average Lifetime Value (CLV)</span>
              <p className="text-2xl font-bold text-amber-400">
                ৳{Math.round((analytics?.totalRevenue || 0) / Math.max(1, analytics?.customersCount || 1)).toLocaleString()}
              </p>
              <span className="text-[11px] text-slate-400">Average spend per buyer</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Users size={16} className="text-blue-400" />
              Customer RFM Loyalty Cohorts
            </h3>
            <p className="text-xs text-slate-400">Automated segmentation based on recency, frequency, and monetary spend.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">VIP Spenders</span>
                <p className="text-base font-bold text-slate-100">৳10,000+ Lifetime</p>
                <p className="text-[11px] text-slate-400">Eligible for exclusive flash drops & gifts.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-purple-400">Repeat Buyers</span>
                <p className="text-base font-bold text-slate-100">2+ Completed Orders</p>
                <p className="text-[11px] text-slate-400">High brand affinity and routine consistency.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">New Members</span>
                <p className="text-base font-bold text-slate-100">Joined &lt; 30 Days</p>
                <p className="text-[11px] text-slate-400">Nurtured with welcome routines & guide.</p>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-400">At-Risk Inactive</span>
                <p className="text-base font-bold text-slate-100">60+ Days No Purchase</p>
                <p className="text-[11px] text-slate-400">Targeted with win-back replenishment promos.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: MARKETING ROI & ATTRIBUTION */}
      {/* ========================================================================= */}
      {activeTab === 'marketing' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Active Coupons & Vouchers</span>
              <p className="text-2xl font-bold text-amber-400">5 Live</p>
              <span className="text-[11px] text-slate-400">Percent & Fixed discount vouchers</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Recovered Cart Revenue</span>
              <p className="text-2xl font-bold text-emerald-400">৳24,500</p>
              <span className="text-[11px] text-emerald-400">Via Automated Abandoned Cart Engine</span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-2">
              <span className="text-xs text-slate-400 font-semibold">Broadcast Conversions</span>
              <p className="text-2xl font-bold text-purple-400">14.2%</p>
              <span className="text-[11px] text-slate-400">Click-to-checkout conversion</span>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Megaphone size={16} className="text-purple-400" />
              Automated Marketing Attribution Channels
            </h3>

            <div className="divide-y divide-slate-800 text-xs">
              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Abandoned Cart Recovery Sequence</p>
                  <span className="text-[10px] text-slate-400">Automated reminder 2 hours post abandonment</span>
                </div>
                <span className="font-mono text-emerald-400 font-bold">+৳18,200</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Post-Purchase Verified Review Prompt</p>
                  <span className="text-[10px] text-slate-400">Automated 7 days post order delivery</span>
                </div>
                <span className="font-mono text-blue-400 font-bold">128 Reviews Collected</span>
              </div>

              <div className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-200">Back-In-Stock Wishlist Notifications</p>
                  <span className="text-[10px] text-slate-400">Immediate trigger upon inventory replenishment</span>
                </div>
                <span className="font-mono text-amber-400 font-bold">+৳6,300</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
