import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Search, Eye, Edit3, X, CheckCircle2, Truck, Clock } from 'lucide-react';
import { formatBDT, OrderStatus } from '@skincare/shared';

export const AdminOrders: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('CONFIRMED');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('Steadfast Courier');
  const [statusNote, setStatusNote] = useState('');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['admin-orders', selectedStatus, searchTerm],
    queryFn: () => adminService.getOrders({ status: selectedStatus !== 'ALL' ? selectedStatus : undefined, search: searchTerm || undefined }),
  });

  const orders = ordersData?.data || [];

  const handleOpenStatusModal = (ord: any) => {
    setSelectedOrder(ord);
    setNewStatus(ord.orderStatus);
    setTrackingNumber(ord.trackingNumber || '');
    setCourierName(ord.courierName || 'Steadfast Courier');
    setStatusNote('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      await adminService.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        note: statusNote || undefined,
        trackingNumber: trackingNumber || undefined,
        courierName: courierName || undefined,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      setSelectedOrder(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update order status');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-100">Order Management</h1>
        <p className="text-xs text-slate-400 mt-1">Review orders, transition fulfillment statuses, and assign courier tracking.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <Search size={18} className="text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Order ID, Phone, Customer Name..."
            className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl px-3 py-1.5 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Delivery Location</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Order Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading orders...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No orders found.</td>
                </tr>
              ) : (
                orders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-slate-100">#{ord.orderNumber}</td>
                    <td className="p-4">
                      <p className="font-semibold text-slate-200">{ord.customerName}</p>
                      <p className="text-[11px] text-slate-500">{ord.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <p className="text-slate-300">{ord.area}, {ord.division}</p>
                    </td>
                    <td className="p-4">{ord.items?.length || 1} item(s)</td>
                    <td className="p-4 font-bold text-slate-100">{formatBDT(ord.totalAmount)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                        ord.paymentStatus === 'PAID' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                      }`}>
                        {ord.paymentMethod} • {ord.paymentStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-slate-200 border border-slate-700">
                        {ord.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenStatusModal(ord)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 rounded-lg text-xs font-semibold"
                      >
                        Update Status
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setSelectedOrder(null)} />
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-100">Update Order Status</h3>
                <p className="text-[11px] text-slate-400">Order #{selectedOrder.orderNumber}</p>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                >
                  <option value="PENDING">PENDING</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="PROCESSING">PROCESSING</option>
                  <option value="PACKED">PACKED</option>
                  <option value="SHIPPED">SHIPPED</option>
                  <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                  <option value="DELIVERED">DELIVERED</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Courier Partner</label>
                <input
                  type="text"
                  value={courierName}
                  onChange={(e) => setCourierName(e.target.value)}
                  placeholder="e.g. Steadfast Courier"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Courier Tracking Code</label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="e.g. STDF-849204"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Timeline Audit Note</label>
                <textarea
                  rows={2}
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="e.g. Parcel handed over to courier hub in Tejgaon"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                >
                  Save Status
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
