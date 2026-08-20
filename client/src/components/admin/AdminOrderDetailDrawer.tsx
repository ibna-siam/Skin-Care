import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  X,
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Save,
  Package,
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

interface AdminOrderDetailDrawerProps {
  orderId: string | null;
  onClose: () => void;
}

const ORDER_STATUSES = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
];

const COURIER_OPTIONS = ['Steadfast', 'Pathao', 'RedX', 'Paperfly', 'Sundarban'];

export const AdminOrderDetailDrawer: React.FC<AdminOrderDetailDrawerProps> = ({
  orderId,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Status form state
  const [newStatus, setNewStatus] = useState<string>('');
  const [statusNote, setStatusNote] = useState<string>('');
  const [courierName, setCourierName] = useState<string>('');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [estimatedDelivery, setEstimatedDelivery] = useState<string>('');

  const { data: order, isLoading, isError } = useQuery({
    queryKey: ['admin-order-detail', orderId],
    queryFn: () => adminService.getOrderDetail(orderId!),
    enabled: !!orderId,
  });

  // Sync state when order is loaded
  React.useEffect(() => {
    if (order) {
      setNewStatus(order.orderStatus);
      setCourierName(order.courierName || 'Steadfast');
      setTrackingNumber(order.trackingNumber || '');
      setEstimatedDelivery(order.estimatedDelivery || '');
      setStatusNote('');
    }
  }, [order]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => adminService.updateOrderStatus(orderId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-order-detail', orderId] });
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    },
  });

  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    updateMutation.mutate({
      status: newStatus,
      note: statusNote || undefined,
      courierName: courierName || undefined,
      trackingNumber: trackingNumber || undefined,
      estimatedDelivery: estimatedDelivery || undefined,
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!orderId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShoppingBag size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-100">
                    Order #{order?.orderNumber || '...'}
                  </h2>
                  {order && (
                    <button
                      onClick={() => copyToClipboard(order.orderNumber, 'orderNumber')}
                      className="p-1 text-slate-400 hover:text-white rounded"
                      title="Copy Order #"
                    >
                      {copiedField === 'orderNumber' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                    </button>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {order ? new Date(order.createdAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : 'Loading...'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-24 bg-slate-800 rounded-2xl" />
                <div className="h-40 bg-slate-800 rounded-2xl" />
                <div className="h-32 bg-slate-800 rounded-2xl" />
              </div>
            ) : isError || !order ? (
              <div className="text-center py-12 text-rose-400 space-y-2">
                <AlertCircle size={32} className="mx-auto" />
                <p className="text-sm font-semibold">Failed to load order details</p>
              </div>
            ) : (
              <>
                {/* Status Updater Card */}
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                      Fulfillment Status Control
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono uppercase tracking-wider ${
                        order.orderStatus === 'DELIVERED'
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : order.orderStatus === 'PENDING'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : order.orderStatus === 'CANCELLED'
                          ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  <form onSubmit={handleSaveStatus} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">Update Status</label>
                        <select
                          value={newStatus}
                          onChange={(e) => setNewStatus(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">Courier Partner</label>
                        <select
                          value={courierName}
                          onChange={(e) => setCourierName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                        >
                          {COURIER_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">Tracking Number</label>
                        <input
                          type="text"
                          value={trackingNumber}
                          onChange={(e) => setTrackingNumber(e.target.value)}
                          placeholder="e.g. ST-902348"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-medium text-slate-400 block mb-1">Estimated Delivery</label>
                        <input
                          type="text"
                          value={estimatedDelivery}
                          onChange={(e) => setEstimatedDelivery(e.target.value)}
                          placeholder="e.g. 2-3 Business Days"
                          className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-400 block mb-1">Internal Note (Optional)</label>
                      <input
                        type="text"
                        value={statusNote}
                        onChange={(e) => setStatusNote(e.target.value)}
                        placeholder="e.g. Verified customer address over phone"
                        className="w-full bg-slate-900 border border-slate-800 text-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="flex justify-end pt-1">
                      <button
                        type="submit"
                        disabled={updateMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
                      >
                        <Save size={14} />
                        <span>{updateMutation.isPending ? 'Updating...' : 'Save Order Changes'}</span>
                      </button>
                    </div>
                  </form>
                </div>

                {/* Customer & Shipping Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Customer Card */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono uppercase">
                      <User size={14} className="text-emerald-400" />
                      <span>Customer</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{order.customerName}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <Phone size={12} className="text-slate-400 shrink-0" />
                        <span>{order.customerPhone}</span>
                        <button
                          onClick={() => copyToClipboard(order.customerPhone, 'phone')}
                          className="text-slate-400 hover:text-white"
                        >
                          {copiedField === 'phone' ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Mail size={12} className="text-slate-400 shrink-0" />
                        <span className="truncate">{order.customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Address Card */}
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono uppercase">
                      <MapPin size={14} className="text-emerald-400" />
                      <span>Delivery Address</span>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1">
                      <p className="font-semibold text-slate-100">
                        {order.division}, {order.district}
                      </p>
                      <p className="text-slate-400">{order.area}</p>
                      <p className="text-slate-400 leading-relaxed text-[11px]">{order.fullAddress}</p>
                    </div>
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-300 font-mono uppercase">
                    Ordered Products ({order.items.length})
                  </span>

                  <div className="divide-y divide-slate-800/60">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="py-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {item.productImage ? (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                              <Package size={16} />
                            </div>
                          )}
                          <div className="truncate">
                            <p className="text-xs font-semibold text-slate-200 truncate">{item.productName}</p>
                            <span className="text-[10px] font-mono text-slate-400">
                              {item.productSku} • Qty: {item.quantity} × {formatBDT(item.price)}
                            </span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-slate-100 shrink-0">{formatBDT(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-400">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="text-slate-200 font-medium">{formatBDT(order.subtotal)}</span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex justify-between text-emerald-400">
                        <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                        <span>-{formatBDT(order.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Shipping Fee ({order.deliveryMethod})</span>
                      <span className="text-slate-200 font-medium">{formatBDT(order.shippingFee)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-slate-100">
                      <span>Total Amount</span>
                      <span className="text-emerald-400">{formatBDT(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono uppercase">
                      <CreditCard size={14} className="text-emerald-400" />
                      <span>Payment Details</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        order.paymentStatus === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Payment Method</span>
                      <span className="font-semibold text-slate-200">{order.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Fulfillment Method</span>
                      <span className="font-semibold text-slate-200">{order.deliveryMethod}</span>
                    </div>
                  </div>
                </div>

                {/* Order Timeline History */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 font-mono uppercase">
                    <Clock size={14} className="text-emerald-400" />
                    <span>Order Timeline & Audit Trail</span>
                  </div>

                  <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                    {order.timeline.map((entry: any) => (
                      <div key={entry.id} className="relative group">
                        <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-slate-900 border-2 border-emerald-500 group-hover:scale-110 transition-transform" />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                              {entry.status}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {entry.note && <p className="text-xs text-slate-400">{entry.note}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
