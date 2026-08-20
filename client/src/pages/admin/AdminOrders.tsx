import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { AdminOrderDetailDrawer } from '../../components/admin/AdminOrderDetailDrawer';
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Check,
  RotateCcw,
  SlidersHorizontal,
  Package,
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Orders' },
  { key: 'PENDING', label: 'Pending' },
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'DELIVERED', label: 'Delivered' },
  { key: 'CANCELLED', label: 'Cancelled' },
];

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state from search params or defaults
  const activeStatus = searchParams.get('status') || 'ALL';
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('ALL');
  const [paymentMethod, setPaymentMethod] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected orders for bulk actions
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [activeOrderDetailId, setActiveOrderDetailId] = useState<string | null>(null);

  // Fetch orders
  const { data: ordersData, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'admin-orders',
      activeStatus,
      searchTerm,
      paymentStatus,
      paymentMethod,
      page,
      limit,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      adminService.getOrders({
        page,
        limit,
        status: activeStatus === 'ALL' ? undefined : activeStatus,
        paymentStatus: paymentStatus === 'ALL' ? undefined : paymentStatus,
        paymentMethod: paymentMethod === 'ALL' ? undefined : paymentMethod,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
      }),
  });

  // Bulk status mutation
  const bulkMutation = useMutation({
    mutationFn: (newStatus: string) =>
      adminService.bulkUpdateOrderStatus(selectedOrderIds, newStatus),
    onSuccess: () => {
      setSelectedOrderIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
  });

  const orders = ordersData?.data || [];
  const pagination = ordersData?.meta || (ordersData as any)?.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 };
  const countsByStatus = pagination?.countsByStatus || {};

  const handleStatusTabChange = (status: string) => {
    if (status === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', status);
    }
    setSearchParams(searchParams);
    setPage(1);
    setSelectedOrderIds([]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedOrderIds(orders.map((o: any) => o.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const handleSelectRow = (orderId: string) => {
    setSelectedOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const handleExportCsv = () => {
    adminService.exportOrdersCsv(activeStatus === 'ALL' ? undefined : activeStatus);
  };

  const toggleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Orders Command Center</h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage customer checkouts, fulfillment statuses, couriers, and payments across Bangladesh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh orders"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800/80 custom-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          const count = tab.key === 'ALL' ? pagination.total : countsByStatus[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => handleStatusTabChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
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
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search by Order #, phone, customer..."
              className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Payment Status Filter */}
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Payment: All</option>
            <option value="PAID">Payment: Paid</option>
            <option value="PENDING">Payment: Pending</option>
            <option value="FAILED">Payment: Failed</option>
            <option value="REFUNDED">Payment: Refunded</option>
          </select>

          {/* Payment Method Filter */}
          <select
            value={paymentMethod}
            onChange={(e) => {
              setPaymentMethod(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Method: All</option>
            <option value="COD">Cash on Delivery (COD)</option>
            <option value="BKASH">bKash</option>
            <option value="NAGAD">Nagad</option>
            <option value="SSLCOMMERZ">SSLCommerz</option>
            <option value="CARD">Debit / Credit Card</option>
          </select>

          {/* Page Size Selector */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-slate-400">Show:</span>
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

        {/* Bulk Action Bar (when rows are selected) */}
        {selectedOrderIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                {selectedOrderIds.length} orders selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkMutation.mutate('PROCESSING')}
                disabled={bulkMutation.isPending}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Mark Processing
              </button>
              <button
                onClick={() => bulkMutation.mutate('SHIPPED')}
                disabled={bulkMutation.isPending}
                className="px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Mark Shipped
              </button>
              <button
                onClick={() => bulkMutation.mutate('DELIVERED')}
                disabled={bulkMutation.isPending}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Mark Delivered
              </button>
              <button
                onClick={() => setSelectedOrderIds([])}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={orders.length > 0 && selectedOrderIds.length === orders.length}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                </th>
                <th
                  onClick={() => toggleSort('orderNumber')}
                  className="py-3.5 px-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Order</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('createdAt')}
                  className="py-3.5 px-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Date</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3.5 px-3">Customer</th>
                <th className="py-3.5 px-3">Items</th>
                <th
                  onClick={() => toggleSort('totalAmount')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Total</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">Payment</th>
                <th
                  onClick={() => toggleSort('orderStatus')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Status</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3.5 pr-4 pl-2 text-right">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading orders...</p>
                    </div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-16 text-center text-slate-400 space-y-2">
                    <ShoppingBag size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No orders found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query or status filter.</p>
                  </td>
                </tr>
              ) : (
                orders.map((ord: any) => {
                  const isSelected = selectedOrderIds.includes(ord.id);
                  const firstItem = ord.items?.[0];

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-800/40 transition-colors group cursor-pointer ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                      onClick={(e) => {
                        // Prevent opening drawer when clicking checkbox
                        if ((e.target as HTMLElement).tagName !== 'INPUT') {
                          setActiveOrderDetailId(ord.id);
                        }
                      }}
                    >
                      <td className="py-3 pl-4 pr-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(ord.id)}
                          className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                        />
                      </td>

                      <td className="py-3 px-3 font-mono font-bold text-slate-200">
                        <span className="group-hover:text-emerald-400 transition-colors">#{ord.orderNumber}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">
                        <div>
                          <p className="text-slate-300 text-xs">
                            {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <p className="font-semibold text-slate-200 truncate max-w-[150px]">{ord.customerName}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">{ord.customerPhone}</p>
                        <span className="text-[10px] text-slate-400">{ord.division}</span>
                      </td>

                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          {firstItem?.productImage ? (
                            <img
                              src={firstItem.productImage}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover bg-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <Package size={12} />
                            </div>
                          )}
                          <span className="text-xs text-slate-300 font-medium">
                            {ord.items?.length || 1} {ord.items?.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-slate-100">{formatBDT(ord.totalAmount)}</span>
                        {ord.discount > 0 && (
                          <span className="block text-[10px] text-emerald-400 font-mono">
                            -{formatBDT(ord.discount)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              ord.paymentStatus === 'PAID'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : ord.paymentStatus === 'FAILED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {ord.paymentStatus}
                          </span>
                          <span className="block text-[10px] text-slate-400 font-mono mt-0.5">
                            {ord.paymentMethod}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider font-mono ${
                            ord.orderStatus === 'DELIVERED'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : ord.orderStatus === 'PENDING'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : ord.orderStatus === 'CANCELLED'
                              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                              : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {ord.orderStatus}
                        </span>
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => setActiveOrderDetailId(ord.id)}
                          className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                          title="View Order Details"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(page * limit, pagination.total)}</span> of{' '}
            <span className="font-semibold text-slate-200">{pagination.total}</span> orders
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
              Page {page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(pagination.totalPages || 1, prev + 1))}
              disabled={page >= pagination.totalPages}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Order Detail Drawer */}
      <AdminOrderDetailDrawer
        orderId={activeOrderDetailId}
        onClose={() => setActiveOrderDetailId(null)}
      />
    </div>
  );
};
