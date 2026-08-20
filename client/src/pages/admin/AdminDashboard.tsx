import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Clock,
  Star,
  CheckCircle2,
  Plus,
  Flame,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatBDT } from '@skincare/shared';

type DateRange = 'today' | 'yesterday' | '7d' | '30d' | '90d' | 'this_year';

interface DashboardKPIs {
  totalSales: number;
  salesChange: number;
  totalOrders: number;
  ordersChange: number;
  totalCustomers: number;
  customersChange: number;
  averageOrderValue: number;
  aovChange: number;
  allTimeSales: number;
  allTimeOrders: number;
  allTimeCustomers: number;
  activeProducts: number;
  pendingOrders: number;
  lowStockCount: number;
}

interface TopProduct {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  averageRating: number;
  unitsSold: number;
  revenue: number;
  ordersCount: number;
  imageUrl: string | null;
  brand: string;
}

interface CategoryDist {
  name: string;
  value: number;
}

interface ActivityItem {
  id: string;
  type: 'order' | 'review' | 'user' | 'inventory';
  title: string;
  description: string;
  timestamp: string | Date;
}

interface LowStockItem {
  id: string;
  name: string;
  sku: string;
  stock: number;
  brand?: { name: string };
}

interface RecentOrderItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  orderStatus: string;
  totalAmount: number;
}

interface SalesTrendItem {
  label: string;
  revenue: number;
  orders: number;
}

export const AdminDashboard: React.FC = () => {
  const [selectedRange, setSelectedRange] = useState<DateRange>('30d');
  const [isAutoRefresh] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date>(new Date());

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['admin-dashboard-stats', selectedRange],
    queryFn: () => adminService.getDashboardStats({ range: selectedRange }),
    refetchInterval: isAutoRefresh ? 30000 : false, // 30s auto polling
  });

  useEffect(() => {
    if (data) {
      setLastRefreshedAt(new Date());
    }
  }, [data]);

  const ranges: { key: DateRange; label: string }[] = [
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7d', label: '7 Days' },
    { key: '30d', label: '30 Days' },
    { key: '90d', label: '90 Days' },
    { key: 'this_year', label: 'This Year' },
  ];

  const getRangeComparisonText = (range: DateRange) => {
    switch (range) {
      case 'today':
        return 'vs yesterday';
      case 'yesterday':
        return 'vs day before';
      case '7d':
        return 'vs previous 7 days';
      case '30d':
        return 'vs previous 30 days';
      case '90d':
        return 'vs previous 90 days';
      case 'this_year':
        return 'vs last year';
      default:
        return 'vs previous period';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="h-8 bg-slate-800 rounded-xl w-64" />
          <div className="h-8 bg-slate-800 rounded-xl w-48" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-32 bg-slate-900 border border-slate-800/80 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-80 bg-slate-900 border border-slate-800/80 rounded-2xl" />
          <div className="lg:col-span-4 h-80 bg-slate-900 border border-slate-800/80 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="bg-slate-900 border border-rose-900/50 rounded-3xl p-10 text-center max-w-lg mx-auto my-12 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/80 text-rose-400 flex items-center justify-center mx-auto">
          <AlertTriangle size={24} />
        </div>
        <h3 className="text-lg font-bold text-slate-100">Unable to load dashboard metrics</h3>
        <p className="text-xs text-slate-400">
          We encountered an issue communicating with the database. Please verify backend service availability.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  const kpis: DashboardKPIs = data.kpis || {
    totalSales: 0,
    salesChange: 0,
    totalOrders: 0,
    ordersChange: 0,
    totalCustomers: 0,
    customersChange: 0,
    averageOrderValue: 0,
    aovChange: 0,
    allTimeSales: 0,
    allTimeOrders: 0,
    allTimeCustomers: 0,
    activeProducts: 0,
    pendingOrders: 0,
    lowStockCount: 0,
  };

  const salesTrends: SalesTrendItem[] = data.salesTrends || [];
  const categoryDistribution: CategoryDist[] = data.categoryDistribution || [];
  const topProducts: TopProduct[] = data.topProducts || [];
  const lowStockProducts: LowStockItem[] = data.lowStockProducts || [];
  const recentOrders: RecentOrderItem[] = data.recentOrders || [];
  const activityFeed: ActivityItem[] = data.activityFeed || [];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4'];

  return (
    <div className="space-y-8">
      {/* Header & Date Range Filter Toolbar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-100">Overview Dashboard</h1>
            <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Operations
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time business performance across revenue, orders, inventory, and customer activity in Bangladesh.
          </p>
        </div>

        {/* Date Filters & Refresh control */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Range pills */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            {ranges.map((r) => (
              <button
                key={r.key}
                onClick={() => setSelectedRange(r.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedRange === r.key
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title={`Last refreshed: ${lastRefreshedAt.toLocaleTimeString()}`}
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Primary KPI Cards (5 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Revenue</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{formatBDT(kpis.totalSales)}</p>
            <div className="flex items-center gap-1.5 text-xs mt-1.5">
              {kpis.salesChange >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                  <TrendingUp size={13} /> +{kpis.salesChange}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                  <TrendingDown size={13} /> {kpis.salesChange}%
                </span>
              )}
              <span className="text-[11px] text-slate-400">{getRangeComparisonText(selectedRange)}</span>
            </div>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Orders</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20">
              <ShoppingBag size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{kpis.totalOrders}</p>
            <div className="flex items-center gap-1.5 text-xs mt-1.5">
              {kpis.ordersChange >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                  <TrendingUp size={13} /> +{kpis.ordersChange}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                  <TrendingDown size={13} /> {kpis.ordersChange}%
                </span>
              )}
              <span className="text-[11px] text-slate-400">{getRangeComparisonText(selectedRange)}</span>
            </div>
          </div>
        </div>

        {/* Average Order Value (AOV) */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Avg. Order Value</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl border border-purple-500/20">
              <TrendingUp size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{formatBDT(kpis.averageOrderValue)}</p>
            <div className="flex items-center gap-1.5 text-xs mt-1.5">
              {kpis.aovChange >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                  <TrendingUp size={13} /> +{kpis.aovChange}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                  <TrendingDown size={13} /> {kpis.aovChange}%
                </span>
              )}
              <span className="text-[11px] text-slate-400">{getRangeComparisonText(selectedRange)}</span>
            </div>
          </div>
        </div>

        {/* Customers */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">New Customers</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-xl border border-amber-500/20">
              <Users size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{kpis.totalCustomers}</p>
            <div className="flex items-center gap-1.5 text-xs mt-1.5">
              {kpis.customersChange >= 0 ? (
                <span className="inline-flex items-center gap-0.5 text-emerald-400 font-semibold">
                  <TrendingUp size={13} /> +{kpis.customersChange}%
                </span>
              ) : (
                <span className="inline-flex items-center gap-0.5 text-rose-400 font-semibold">
                  <TrendingDown size={13} /> {kpis.customersChange}%
                </span>
              )}
              <span className="text-[11px] text-slate-400">{kpis.allTimeCustomers} total</span>
            </div>
          </div>
        </div>

        {/* Pending Fulfillment & Low Stock */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-sm hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Fulfillment & Stock</span>
            <div className="p-2 bg-teal-500/10 text-teal-400 rounded-xl border border-teal-500/20">
              <Package size={16} />
            </div>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{kpis.pendingOrders}</p>
            <div className="flex items-center justify-between text-xs mt-1.5">
              <span className="text-[11px] text-amber-400 font-medium">Pending fulfillment</span>
              {kpis.lowStockCount > 0 ? (
                <span className="text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                  <AlertTriangle size={11} /> {kpis.lowStockCount} low
                </span>
              ) : (
                <span className="text-[11px] text-emerald-400">Stock healthy</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Charts Section (Revenue Performance + Category Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Revenue Performance Area Chart */}
        <div className="lg:col-span-8 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Revenue & Order Volume</h3>
              <p className="text-xs text-slate-400">Time-series breakdown for selected period</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Revenue (BDT)
              </span>
            </div>
          </div>

          <div className="h-68 w-full pt-2">
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
                <XAxis dataKey="label" stroke="#64748B" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#64748B"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => `৳${(val / 1000).toFixed(0)}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'revenue' ? formatBDT(Number(value)) : value,
                    name === 'revenue' ? 'Revenue' : 'Orders',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#revenueGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Share Donut Chart */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Catalog by Category</h3>
            <p className="text-xs text-slate-400">Distribution across skincare product lines</p>
          </div>

          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryDistribution}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                >
                  {categoryDistribution.map((_, index: number) => (
                    <Cell key={`cat-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
            {categoryDistribution.slice(0, 6).map((cat: CategoryDist, i: number) => (
              <div key={cat.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                <span className="truncate">{cat.name}</span>
                <span className="text-slate-400 font-mono">({cat.value})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products & Low Stock Command Center */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Selling Products (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Flame size={16} className="text-amber-400" />
                Top Performing Products
              </h3>
              <p className="text-xs text-slate-400">Highest volume velocity in selected timeframe</p>
            </div>
            <Link to="/admin/products" className="text-xs font-semibold text-emerald-400 hover:underline">
              All Products →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="pb-2.5">Product</th>
                  <th className="pb-2.5 text-center">Sold</th>
                  <th className="pb-2.5 text-right">Revenue</th>
                  <th className="pb-2.5 text-right">Stock</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No order data recorded in this period.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p: TopProduct) => (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 flex items-center gap-3">
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover bg-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                            {p.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center font-bold text-slate-200">{p.unitsSold}</td>
                      <td className="py-3 text-right font-bold text-emerald-400">{formatBDT(p.revenue)}</td>
                      <td className="py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            p.stock <= 5
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {p.stock}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 text-rose-400">
                <AlertTriangle size={16} />
                Low Stock Watchlist
              </h3>
              <p className="text-xs text-slate-400">Products requiring replenishment</p>
            </div>
            <Link to="/admin/inventory" className="text-xs font-semibold text-slate-400 hover:text-white">
              Inventory Hub →
            </Link>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                <CheckCircle2 size={24} className="mx-auto text-emerald-400 mb-2" />
                All product stock levels are healthy!
              </div>
            ) : (
              lowStockProducts.map((p: LowStockItem) => (
                <div
                  key={p.id}
                  className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition-colors"
                >
                  <div className="truncate mr-3">
                    <span className="text-[10px] text-slate-400 uppercase font-mono">{p.sku}</span>
                    <p className="font-semibold text-slate-200 text-xs truncate">{p.name}</p>
                    <p className="text-[10px] text-slate-400 truncate">{p.brand?.name || 'Skincare'}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono font-bold rounded-lg text-xs">
                      {p.stock} left
                    </span>
                    <Link
                      to="/admin/products"
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
                      title="Update Stock"
                    >
                      <Plus size={13} />
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Activity Audit Feed Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders (7 Cols) */}
        <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Recent Customer Orders</h3>
              <p className="text-xs text-slate-400">Incoming checkouts across Bangladesh</p>
            </div>
            <Link to="/admin/orders" className="text-xs font-semibold text-emerald-400 hover:underline">
              View All Orders →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="pb-2.5">Order #</th>
                  <th className="pb-2.5">Customer</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord: RecentOrderItem) => (
                    <tr key={ord.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 font-mono font-semibold text-slate-200">
                        <Link to="/admin/orders" className="hover:text-emerald-400 transition-colors">
                          #{ord.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3">
                        <p className="font-semibold text-slate-200">{ord.customerName}</p>
                        <p className="text-[10px] text-slate-400">{ord.customerPhone}</p>
                      </td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            ord.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : ord.orderStatus === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : ord.orderStatus === 'CANCELLED'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="py-3 text-right font-bold text-slate-100">{formatBDT(ord.totalAmount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Real-time Activity Feed (5 Cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Clock size={16} className="text-emerald-400" />
                Live Store Activity
              </h3>
              <p className="text-xs text-slate-400">Events from orders, reviews, and catalog</p>
            </div>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1 text-xs">
            {activityFeed.length === 0 ? (
              <p className="text-slate-400 py-8 text-center">No recent activity logged.</p>
            ) : (
              activityFeed.map((item: ActivityItem) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-800/40 transition-colors"
                >
                  <div className="mt-0.5">
                    {item.type === 'order' && (
                      <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        <ShoppingBag size={13} />
                      </div>
                    )}
                    {item.type === 'review' && (
                      <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <Star size={13} />
                      </div>
                    )}
                    {item.type === 'user' && (
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                        <Users size={13} />
                      </div>
                    )}
                    {item.type === 'inventory' && (
                      <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <AlertTriangle size={13} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 truncate">
                    <p className="font-semibold text-slate-200 text-xs truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-400 truncate">{item.description}</p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
