import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Search,
  RefreshCw,
  Sparkles,
  Percent,
  DollarSign,
  Truck,
  Calendar,
  Layers,
  AlertCircle,
  Copy,
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

export const AdminCoupons: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCouponId, setEditingCouponId] = useState<string | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('1000');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [expiryDate, setExpiryDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [usageLimit, setUsageLimit] = useState('100');
  const [isActive, setIsActive] = useState(true);

  // Fetch Coupons
  const { data: coupons = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminService.getCoupons(),
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingCouponId) {
        return adminService.updateCoupon(editingCouponId, payload);
      }
      return adminService.createCoupon(payload);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  // Toggle Active Mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService.updateCoupon(id, { isActive: active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingCouponId(null);
    setCode(`GLOW${Math.floor(10 + Math.random() * 90)}`);
    setType('PERCENTAGE');
    setValue('15');
    setMinOrderAmount('1200');
    setMaxDiscountAmount('500');
    setStartDate(new Date().toISOString().slice(0, 10));
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10));
    setUsageLimit('200');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: any) => {
    setEditingCouponId(c.id);
    setCode(c.code);
    setType(c.type);
    setValue(c.value.toString());
    setMinOrderAmount(c.minOrderAmount?.toString() || '0');
    setMaxDiscountAmount(c.maxDiscountAmount ? c.maxDiscountAmount.toString() : '');
    setStartDate(new Date(c.startDate).toISOString().slice(0, 10));
    setExpiryDate(new Date(c.expiryDate).toISOString().slice(0, 10));
    setUsageLimit(c.usageLimit ? c.usageLimit.toString() : '');
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleAutoGenerateCode = () => {
    const prefixes = ['GLOW', 'BEAUTY', 'SUMMER', 'SKIN', 'RADIANCE', 'FLASH'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setCode(`${prefix}${num}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !value) return;

    const payload: any = {
      code,
      type,
      value: parseFloat(value),
      minOrderAmount: parseFloat(minOrderAmount || '0'),
      maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
      startDate: new Date(startDate).toISOString(),
      expiryDate: new Date(expiryDate).toISOString(),
      usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
      isActive,
    };

    saveMutation.mutate(payload);
  };

  const filteredCoupons = coupons.filter((c: any) => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'ACTIVE' && c.computedStatus === 'ACTIVE') ||
      (statusFilter === 'EXPIRED' && c.computedStatus === 'EXPIRED') ||
      (statusFilter === 'DISABLED' && c.computedStatus === 'DISABLED');
    return matchesSearch && matchesStatus;
  });

  const activeCount = coupons.filter((c: any) => c.computedStatus === 'ACTIVE').length;
  const expiredCount = coupons.filter((c: any) => c.computedStatus === 'EXPIRED').length;
  const totalUses = coupons.reduce((sum: number, c: any) => sum + (c.usedCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Tag size={24} className="text-emerald-400" />
            Promotions & Coupon Engine
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create discount vouchers, percentage savings, and free delivery codes for targeted marketing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Create Coupon</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh coupons"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Active Campaigns</span>
            <Sparkles size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-slate-100 mt-2">{activeCount}</p>
          <span className="text-[11px] text-emerald-400">Live redeemable codes</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Redemptions</span>
            <Tag size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-bold text-blue-400 mt-2">{totalUses}</p>
          <span className="text-[11px] text-slate-400">Checkout coupon applications</span>
        </div>

        <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Expired Campaigns</span>
            <Calendar size={16} className="text-rose-400" />
          </div>
          <p className="text-2xl font-bold text-rose-400 mt-2">{expiredCount}</p>
          <span className="text-[11px] text-slate-400">Archived promotion history</span>
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
            placeholder="Search coupon code..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono uppercase"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Status: Active</option>
            <option value="DISABLED">Status: Disabled</option>
            <option value="EXPIRED">Status: Expired</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Coupon Code</th>
                <th className="py-3.5 px-3">Discount Type</th>
                <th className="py-3.5 px-3 text-right">Value</th>
                <th className="py-3.5 px-3 text-right">Min Spend</th>
                <th className="py-3.5 px-3 text-center">Usage Progress</th>
                <th className="py-3.5 px-3">Valid Dates</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading promotion coupons...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <Tag size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No coupons found</p>
                    <p className="text-xs text-slate-400">Click &quot;Create Coupon&quot; to launch a new promotion.</p>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c: any) => {
                  const usagePercent = c.usageLimit
                    ? Math.min(100, Math.round(((c.usedCount || 0) / c.usageLimit) * 100))
                    : 0;

                  return (
                    <tr key={c.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4 font-mono font-bold text-sm text-emerald-400">
                        <span className="bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                          {c.code}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-medium">
                        {c.type === 'PERCENTAGE'
                          ? 'Percentage Discount'
                          : c.type === 'FIXED'
                          ? 'Fixed Amount Off'
                          : 'Free Delivery'}
                      </td>

                      <td className="py-3 px-3 text-right font-bold text-slate-100">
                        {c.type === 'PERCENTAGE'
                          ? `${c.value}%`
                          : c.type === 'FIXED'
                          ? formatBDT(c.value)
                          : 'Free Shipping'}
                        {c.maxDiscountAmount && (
                          <span className="block text-[10px] text-slate-400 font-mono">
                            Max {formatBDT(c.maxDiscountAmount)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-right text-slate-300 font-mono">
                        {formatBDT(c.minOrderAmount || 0)}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="w-28 mx-auto space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>{c.usedCount || 0} used</span>
                            <span>{c.usageLimit || '∞'}</span>
                          </div>
                          {c.usageLimit && (
                            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-emerald-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400 text-[11px] whitespace-nowrap">
                        <p className="text-slate-300">
                          {new Date(c.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} –{' '}
                          {new Date(c.expiryDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() =>
                            toggleMutation.mutate({ id: c.id, active: !c.isActive })
                          }
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors ${
                            c.computedStatus === 'ACTIVE'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
                              : c.computedStatus === 'DISABLED'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30 hover:bg-amber-500/25'
                              : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                          }`}
                          title="Click to toggle status"
                        >
                          {c.computedStatus}
                        </button>
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                            title="Edit Coupon"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete coupon "${c.code}"?`)) {
                                deleteMutation.mutate(c.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-400 text-slate-300 rounded-lg transition-colors"
                            title="Delete Coupon"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Tag className="text-emerald-400" size={18} />
                <h3 className="text-base font-bold text-slate-100">
                  {editingCouponId ? 'Edit Promotional Coupon' : 'Create New Coupon Voucher'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">Coupon Code *</label>
                  <button
                    type="button"
                    onClick={handleAutoGenerateCode}
                    className="text-[10px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1"
                  >
                    <Sparkles size={11} /> Auto Generate
                  </button>
                </div>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="e.g. GLOW20"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono uppercase font-bold text-sm tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Discount Type *</label>
                  <select
                    value={type}
                    onChange={(e: any) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PERCENTAGE">Percentage (%) Off</option>
                    <option value="FIXED">Fixed Amount (৳) Off</option>
                    <option value="FREE_DELIVERY">Free Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    {type === 'PERCENTAGE' ? 'Discount Percentage (%) *' : 'Discount Value (৳) *'}
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="15"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Minimum Order Amount (৳)
                  </label>
                  <input
                    type="number"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Max Discount Cap (৳)
                  </label>
                  <input
                    type="number"
                    value={maxDiscountAmount}
                    onChange={(e) => setMaxDiscountAmount(e.target.value)}
                    placeholder="Optional max cap"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                    Total Usage Limit
                  </label>
                  <input
                    type="number"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value)}
                    placeholder="e.g. 500"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-300 font-medium">Active & Redeemable</span>
                  </label>
                </div>
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
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : editingCouponId ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
