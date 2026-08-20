import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Bell,
  Send,
  Plus,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  Users,
  Search,
} from 'lucide-react';

const NOTIFICATION_ICONS: Record<string, any> = {
  ORDER: ShoppingBag,
  PROMOTION: Sparkles,
  SYSTEM: Info,
  INVENTORY: AlertTriangle,
};

export const AdminNotifications: React.FC = () => {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('PROMOTION');
  const [broadcastSuccess, setBroadcastSuccess] = useState(false);

  // Fetch Notifications
  const { data: notifications = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => adminService.getNotifications(),
  });

  // Broadcast Mutation
  const broadcastMutation = useMutation({
    mutationFn: (payload: any) => adminService.sendBroadcastNotification(payload),
    onSuccess: () => {
      setBroadcastSuccess(true);
      setTimeout(() => {
        setBroadcastSuccess(false);
        setIsModalOpen(false);
        setTitle('');
        setMessage('');
      }, 2000);
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
    },
  });

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;
    broadcastMutation.mutate({ title, message, type });
  };

  const filtered = notifications.filter((n: any) => {
    const matchesType = typeFilter === 'ALL' || n.type === typeFilter;
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (n.user?.name && n.user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (n.user?.email && n.user.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesType && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Bell size={24} className="text-emerald-400" />
            Notification Center & Broadcaster
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dispatch promotional announcements, delivery status updates, and system broadcasts to customer accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Send size={14} />
            <span>Send Broadcast Message</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh notifications"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notifications..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Type: All</option>
            <option value="ORDER">Order Notifications</option>
            <option value="PROMOTION">Promotions</option>
            <option value="SYSTEM">System Alerts</option>
          </select>
        </div>
      </div>

      {/* Notifications Feed */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-3">Title & Message</th>
                <th className="py-3.5 px-3">Recipient Customer</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Sent Time</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading notifications...</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-400 space-y-2">
                    <Bell size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No notifications found</p>
                    <p className="text-xs text-slate-400">Click &quot;Send Broadcast Message&quot; to push an announcement.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((n: any) => {
                  const Icon = NOTIFICATION_ICONS[n.type] || Info;

                  return (
                    <tr key={n.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                              n.type === 'ORDER'
                                ? 'bg-blue-500/15 text-blue-400'
                                : n.type === 'PROMOTION'
                                ? 'bg-purple-500/15 text-purple-400'
                                : 'bg-emerald-500/15 text-emerald-400'
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <span className="font-mono text-[10px] font-bold text-slate-300">{n.type}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[320px]">
                        <p className="font-semibold text-slate-200">{n.title}</p>
                        <p className="text-slate-400 text-[11px] line-clamp-2 mt-0.5 leading-relaxed">
                          {n.message}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-slate-300">
                        <p className="font-medium text-slate-200">{n.user?.name || 'Customer'}</p>
                        <span className="text-[10px] text-slate-400 font-mono">{n.user?.email || '—'}</span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            n.isRead
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          }`}
                        >
                          {n.isRead ? 'Read' : 'Delivered'}
                        </span>
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right text-slate-400 text-[11px] whitespace-nowrap">
                        <p className="text-slate-300">{new Date(n.createdAt).toLocaleDateString()}</p>
                        <span className="text-[10px] font-mono">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Send className="text-emerald-400" size={18} />
                <h3 className="text-base font-bold text-slate-100">Send Broadcast Notification</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {broadcastSuccess ? (
              <div className="py-8 text-center text-emerald-400 space-y-2">
                <CheckCircle2 size={36} className="mx-auto" />
                <p className="text-sm font-bold">Broadcast sent to all customer accounts successfully!</p>
              </div>
            ) : (
              <form onSubmit={handleBroadcast} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Notification Category
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="PROMOTION">Promotional Offer / Discount Alert</option>
                    <option value="ORDER">Order & Fulfillment Update</option>
                    <option value="SYSTEM">System Announcement / Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Notification Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Flash 24-Hour Weekend Sale!"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Notification Message *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="e.g. Enjoy 20% off all Korean sunscreens and cleansers with coupon SUMMER20. Valid until Sunday midnight."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={broadcastMutation.isPending}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send size={13} />
                    <span>{broadcastMutation.isPending ? 'Broadcasting...' : 'Broadcast to All Customers'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
