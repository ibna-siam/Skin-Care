import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  X,
  User,
  ShoppingBag,
  Heart,
  Star,
  MapPin,
  Mail,
  Phone,
  Clock,
  Sparkles,
  DollarSign,
  TrendingUp,
  Package,
  Calendar,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

interface AdminCustomerDetailDrawerProps {
  customerId: string | null;
  onClose: () => void;
}

export const AdminCustomerDetailDrawer: React.FC<AdminCustomerDetailDrawerProps> = ({
  customerId,
  onClose,
}) => {
  const { data: customer, isLoading, isError } = useQuery({
    queryKey: ['admin-customer-detail', customerId],
    queryFn: () => adminService.getCustomerDetail(customerId!),
    enabled: !!customerId,
  });

  if (!customerId) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-slate-900 border-l border-slate-800 text-slate-100 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
          {/* Header */}
          <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white font-bold flex items-center justify-center text-sm shadow-md">
                {customer?.name?.charAt(0) || 'C'}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">{customer?.name || 'Customer Profile'}</h2>
                <p className="text-[11px] text-slate-400 font-mono">{customer?.email || 'Loading...'}</p>
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
                <div className="h-28 bg-slate-800 rounded-2xl" />
                <div className="h-44 bg-slate-800 rounded-2xl" />
                <div className="h-36 bg-slate-800 rounded-2xl" />
              </div>
            ) : isError || !customer ? (
              <div className="text-center py-12 text-rose-400 space-y-2">
                <AlertCircle size={32} className="mx-auto" />
                <p className="text-sm font-semibold">Failed to load customer profile</p>
              </div>
            ) : (
              <>
                {/* Lifetime Metrics Summary */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Spent</span>
                    <p className="text-lg font-bold text-emerald-400">{formatBDT(customer.totalSpent)}</p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Total Orders</span>
                    <p className="text-lg font-bold text-blue-400">{customer.ordersCount}</p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400">Avg. Order Value</span>
                    <p className="text-lg font-bold text-purple-400">{formatBDT(customer.averageOrderValue)}</p>
                  </div>
                </div>

                {/* Profile Overview Card */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                    Account & Skin Attributes
                  </span>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Phone Number</span>
                      <p className="font-semibold text-slate-200">{customer.phone || 'Not provided'}</p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Preferred Skin Type</span>
                      <p className="font-semibold text-emerald-400">
                        {customer.preferredSkinType ? `${customer.preferredSkinType} Skin` : 'Not answered yet'}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Registered On</span>
                      <p className="font-semibold text-slate-200">
                        {new Date(customer.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Customer Role</span>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                        {customer.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Saved Delivery Addresses */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <MapPin size={14} className="text-emerald-400" />
                    Saved Delivery Addresses ({customer.addresses?.length || 0})
                  </span>

                  {customer.addresses?.length === 0 ? (
                    <p className="text-xs text-slate-400">No addresses saved yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {customer.addresses.map((addr: any) => (
                        <div
                          key={addr.id}
                          className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">
                              {addr.recipientName} ({addr.phone})
                            </span>
                            {addr.isDefault && (
                              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                                Default
                              </span>
                            )}
                          </div>
                          <p className="text-slate-400">
                            {addr.fullAddress}, {addr.area}, {addr.district}, {addr.division}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Order History */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    <ShoppingBag size={14} className="text-blue-400" />
                    Order History ({customer.orders?.length || 0})
                  </span>

                  {customer.orders?.length === 0 ? (
                    <p className="text-xs text-slate-400">No orders placed yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {customer.orders.map((ord: any) => (
                        <div
                          key={ord.id}
                          className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                        >
                          <div>
                            <span className="font-mono font-bold text-slate-200">#{ord.orderNumber}</span>
                            <span className="text-[10px] text-slate-400 ml-2">
                              {new Date(ord.createdAt).toLocaleDateString()}
                            </span>
                            <p className="text-[11px] text-slate-400">{ord.items?.length || 1} items</p>
                          </div>

                          <div className="text-right">
                            <span className="font-bold text-slate-100 block">{formatBDT(ord.totalAmount)}</span>
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                                ord.orderStatus === 'DELIVERED'
                                  ? 'bg-emerald-500/15 text-emerald-400'
                                  : ord.orderStatus === 'CANCELLED'
                                  ? 'bg-rose-500/15 text-rose-400'
                                  : 'bg-amber-500/15 text-amber-400'
                              }`}
                            >
                              {ord.orderStatus}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Wishlist Items Preview */}
                {customer.wishlist?.items?.length > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Heart size={14} className="text-rose-400" />
                      Active Wishlist ({customer.wishlist.items.length})
                    </span>

                    <div className="space-y-2">
                      {customer.wishlist.items.map((item: any) => (
                        <div
                          key={item.id}
                          className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            {item.product?.images?.[0]?.url && (
                              <img
                                src={item.product.images[0].url}
                                alt=""
                                className="w-8 h-8 rounded-lg object-cover bg-slate-800 shrink-0"
                              />
                            )}
                            <span className="font-medium text-slate-200 truncate">{item.product?.name}</span>
                          </div>
                          <span className="font-bold text-emerald-400 shrink-0">
                            {formatBDT(item.product?.price || 0)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviews Submitted */}
                {customer.reviews?.length > 0 && (
                  <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <Star size={14} className="text-amber-400" />
                      Product Reviews ({customer.reviews.length})
                    </span>

                    <div className="space-y-2">
                      {customer.reviews.map((rev: any) => (
                        <div
                          key={rev.id}
                          className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-slate-200">{rev.product?.name}</span>
                            <span className="text-amber-400 font-bold">{rev.rating} ★</span>
                          </div>
                          <p className="font-medium text-slate-300">{rev.title}</p>
                          <p className="text-slate-400 text-[11px] leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
