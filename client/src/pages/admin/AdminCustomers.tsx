import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { AdminCustomerDetailDrawer } from '../../components/admin/AdminCustomerDetailDrawer';
import {
  Users,
  Search,
  Download,
  RefreshCw,
  Crown,
  Repeat,
  Sparkles,
  UserX,
  UserCheck,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Mail,
  Phone,
  DollarSign,
  TrendingUp,
  Heart,
  ShoppingBag,
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

const SEGMENT_TABS = [
  { key: 'ALL', label: 'All Customers', icon: Users },
  { key: 'VIP', label: 'VIP Spenders', icon: Crown },
  { key: 'REPEAT', label: 'Repeat Buyers', icon: Repeat },
  { key: 'NEW', label: 'New Members', icon: Sparkles },
  { key: 'INACTIVE', label: 'Inactive (60d+)', icon: UserX },
  { key: 'PROSPECT', label: 'Prospects', icon: UserCheck },
];

export const AdminCustomers: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSegment = searchParams.get('segment') || 'ALL';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Customer Drawer State
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Fetch Customers Data
  const { data: customersData, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'admin-customers',
      activeSegment,
      searchTerm,
      selectedSkinType,
      page,
      limit,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      adminService.getCustomers({
        page,
        limit,
        segment: activeSegment === 'ALL' ? undefined : activeSegment,
        skinType: selectedSkinType === 'ALL' ? undefined : selectedSkinType,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
      }),
  });

  const customers = customersData?.data || [];
  const meta = customersData?.meta || (customersData as any)?.pagination || {
    total: 0,
    totalPages: 1,
    segmentCounts: {},
    metrics: { totalCustomers: 0, totalLifetimeValue: 0, averageCLV: 0, repeatRate: 0 },
  };

  const segmentCounts = meta.segmentCounts || {};
  const metrics = meta.metrics || { totalCustomers: 0, totalLifetimeValue: 0, averageCLV: 0, repeatRate: 0 };

  const handleSegmentChange = (segKey: string) => {
    if (segKey === 'ALL') {
      searchParams.delete('segment');
    } else {
      searchParams.set('segment', segKey);
    }
    setSearchParams(searchParams);
    setPage(1);
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Users size={24} className="text-emerald-400" />
            Customer CRM & Segmentation
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Analyze customer lifetime value (CLV), purchase velocity, skincare preferences, and RFM loyalty tiers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adminService.exportCustomersCsv()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Export Customers CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh customers"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* CRM KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Audience</span>
            <Users size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{metrics.totalCustomers || 0}</p>
          <span className="text-[11px] text-emerald-400">Registered member profiles</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue (CLV)</span>
            <DollarSign size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">{formatBDT(metrics.totalLifetimeValue || 0)}</p>
          <span className="text-[11px] text-slate-400">
            Avg. {formatBDT(metrics.averageCLV || 0)} per customer
          </span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Repeat Purchase Rate</span>
            <Repeat size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">{metrics.repeatRate || 0}%</p>
          <span className="text-[11px] text-slate-400">Multi-order retention rate</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">VIP High Spenders</span>
            <Crown size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{segmentCounts.VIP || 0}</p>
          <span className="text-[11px] text-amber-400/80">&gt; ৳10,000 lifetime spend</span>
        </div>
      </div>

      {/* RFM Dynamic Segment Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800/80 custom-scrollbar">
        {SEGMENT_TABS.map((tab) => {
          const isActive = activeSegment === tab.key;
          const count = segmentCounts[tab.key] ?? 0;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              onClick={() => handleSegmentChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by customer name, email, phone..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <select
            value={selectedSkinType}
            onChange={(e) => {
              setSelectedSkinType(e.target.value);
              setPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Skin Type: All</option>
            <option value="Normal">Normal Skin</option>
            <option value="Dry">Dry Skin</option>
            <option value="Oily">Oily Skin</option>
            <option value="Combination">Combination Skin</option>
            <option value="Sensitive">Sensitive Skin</option>
          </select>

          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="10">10 / page</option>
            <option value="20">20 / page</option>
            <option value="50">50 / page</option>
            <option value="100">100 / page</option>
          </select>
        </div>
      </div>

      {/* Customer CRM Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3.5 px-4 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Customer Profile</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3.5 px-3">Location</th>
                <th className="py-3.5 px-3 text-center">Skin Preference</th>
                <th className="py-3.5 px-3 text-center">Segment Tier</th>
                <th
                  onClick={() => toggleSort('ordersCount')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Orders</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('totalSpent')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total Spend</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-right">Avg. Order Value</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading customer records...</p>
                    </div>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <Users size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No customers found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                customers.map((c: any) => {
                  return (
                    <tr
                      key={c.id}
                      onClick={() => setSelectedCustomerId(c.id)}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    >
                      <td className="py-3 px-4 flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 text-slate-200 font-bold flex items-center justify-center text-xs shrink-0 group-hover:border-emerald-500/50 transition-colors">
                          {c.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors">
                            {c.name}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                            <span>{c.email}</span>
                            {c.phone && <span>• {c.phone}</span>}
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-medium">{c.city}</td>

                      <td className="py-3 px-3 text-center">
                        {c.preferredSkinType ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
                            {c.preferredSkinType}
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono ${
                            c.segment === 'VIP'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : c.segment === 'REPEAT'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : c.segment === 'NEW'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : c.segment === 'INACTIVE'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {c.segment}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center font-mono font-bold text-slate-200">
                        {c.ordersCount}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-100">
                        {formatBDT(c.totalSpent)}
                      </td>

                      <td className="py-3 px-3 text-right font-mono text-slate-300">
                        {formatBDT(c.averageOrderValue)}
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setSelectedCustomerId(c.id)}
                          className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                          title="View Customer Profile"
                        >
                          <Eye size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(page * limit, meta.total)}</span> of{' '}
            <span className="font-semibold text-slate-200">{meta.total}</span> customers
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono px-2">
              Page {page} of {meta.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(meta.totalPages || 1, prev + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer Detail Drawer */}
      <AdminCustomerDetailDrawer
        customerId={selectedCustomerId}
        onClose={() => setSelectedCustomerId(null)}
      />
    </div>
  );
};
