import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  AlertTriangle,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { formatBDT } from '@skincare/shared';

export const AdminDashboard: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: () => adminService.getDashboardStats(),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockCount: 0,
    averageOrderValue: 0,
  };

  const salesTrends = data?.salesTrends || [];
  const categoryDistribution = data?.categoryDistribution || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const recentOrders = data?.recentOrders || [];

  const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Overview Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Live metrics across sales, inventory, and order fulfillment in Bangladesh.</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Live Store Operations</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Revenue</span>
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100">{formatBDT(kpis.totalSales)}</p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-400">
            <TrendingUp size={12} />
            <span>Avg Order: {formatBDT(kpis.averageOrderValue)}</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Orders</span>
            <div className="p-2 bg-blue-950 text-blue-400 rounded-xl">
              <ShoppingBag size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100">{kpis.totalOrders}</p>
          <span className="text-[11px] text-amber-400">{kpis.pendingOrders} pending fulfillment</span>
        </div>

        {/* Total Customers */}
        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Registered Customers</span>
            <div className="p-2 bg-purple-950 text-purple-400 rounded-xl">
              <Users size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100">{kpis.totalCustomers}</p>
          <span className="text-[11px] text-slate-400">100% Bangladesh verified</span>
        </div>

        {/* Active Products & Low Stock Alert */}
        <div className="bg-slate-950/70 border border-slate-800 p-5 rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Active Catalog</span>
            <div className="p-2 bg-amber-950 text-amber-400 rounded-xl">
              <Package size={16} />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-100">{kpis.totalProducts}</p>
          {kpis.lowStockCount > 0 ? (
            <span className="text-[11px] text-rose-400 flex items-center gap-1 font-semibold">
              <AlertTriangle size={12} /> {kpis.lowStockCount} items low in stock
            </span>
          ) : (
            <span className="text-[11px] text-emerald-400">Stock levels healthy</span>
          )}
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sales Trend Chart */}
        <div className="lg:col-span-8 bg-slate-950/70 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Revenue Performance</h3>
            <span className="text-xs text-slate-400">Monthly breakdown</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', borderRadius: '8px' }}
                  formatter={(value: any) => [formatBDT(Number(value)), 'Revenue']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie */}
        <div className="lg:col-span-4 bg-slate-950/70 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200">Catalog by Category</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                  {categoryDistribution.map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px] text-slate-400">
            {categoryDistribution.map((cat: any, i: number) => (
              <span key={cat.name} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                {cat.name} ({cat.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-7 bg-slate-950/70 border border-slate-800 p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200">Recent Customer Orders</h3>
            <a href="/admin/orders" className="text-xs font-semibold text-emerald-400 hover:underline">
              View All Orders →
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="pb-2">Order ID</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-mono font-semibold text-slate-100">#{ord.orderNumber}</td>
                    <td className="py-2.5">{ord.customerName}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-emerald-400">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-bold">{formatBDT(ord.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="lg:col-span-5 bg-slate-950/70 border border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 text-amber-400">
            <AlertTriangle size={16} /> Low Stock Watchlist
          </h3>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
            {lowStockProducts.length === 0 ? (
              <p className="text-slate-500 py-4">No low stock warnings.</p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">{p.sku}</span>
                    <p className="font-semibold text-slate-200 line-clamp-1">{p.name}</p>
                  </div>
                  <span className="px-2 py-1 bg-rose-950 text-rose-400 border border-rose-800 font-bold rounded-lg text-[10px]">
                    {p.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
