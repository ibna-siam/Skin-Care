import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { Tag, Plus, X, Check, Calendar } from 'lucide-react';
import { formatBDT } from '@skincare/shared';

export const AdminCoupons: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED' | 'FREE_DELIVERY'>('PERCENTAGE');
  const [value, setValue] = useState('10');
  const [minOrderAmount, setMinOrderAmount] = useState('1000');
  const [maxDiscountAmount, setMaxDiscountAmount] = useState('300');
  const [expiryDays, setExpiryDays] = useState('30');

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: () => adminService.getCoupons(),
  });

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const expiryDate = new Date(Date.now() + parseInt(expiryDays, 10) * 24 * 60 * 60 * 1000).toISOString();
      await adminService.createCoupon({
        code: code.toUpperCase().trim(),
        type,
        value: parseFloat(value) || 0,
        minOrderAmount: minOrderAmount ? parseFloat(minOrderAmount) : null,
        maxDiscountAmount: maxDiscountAmount ? parseFloat(maxDiscountAmount) : null,
        startDate: new Date().toISOString(),
        expiryDate,
        isActive: true,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setIsModalOpen(false);
      setCode('');
    } catch (err: any) {
      alert(err.message || 'Failed to create coupon');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Coupon & Promo Engine</h1>
          <p className="text-xs text-slate-400 mt-1">Configure percentage, fixed, and free delivery vouchers for Bangladesh campaigns.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Create Promo Code
        </button>
      </div>

      {/* Coupons List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          <p className="text-xs text-slate-500">Loading vouchers...</p>
        ) : (
          coupons.map((coupon: any) => (
            <div key={coupon.id} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-base font-bold text-emerald-400 bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-800/80">
                  {coupon.code}
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  {coupon.type}
                </span>
              </div>

              <div className="text-xs text-slate-300 space-y-1">
                <p className="font-bold text-sm text-slate-100">
                  {coupon.type === 'PERCENTAGE'
                    ? `${coupon.value}% OFF (Max ৳${coupon.maxDiscountAmount || 'No cap'})`
                    : coupon.type === 'FIXED'
                    ? `৳${coupon.value} Flat OFF`
                    : 'Free Delivery'}
                </p>
                <p className="text-slate-400 text-[11px]">
                  Min spend: ৳{coupon.minOrderAmount || 0}
                </p>
                <p className="text-slate-500 text-[10px]">
                  Expires: {new Date(coupon.expiryDate).toLocaleDateString()} • Used: {coupon.usedCount} times
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-md bg-slate-950 border border-slate-800 rounded-3xl p-6 z-10 space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-slate-100">Create New Coupon</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. SUMMER15"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Discount Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                >
                  <option value="PERCENTAGE">Percentage (%) Discount</option>
                  <option value="FIXED">Fixed Amount (৳) Discount</option>
                  <option value="FREE_DELIVERY">Free Delivery</option>
                </select>
              </div>

              {type !== 'FREE_DELIVERY' && (
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={type === 'PERCENTAGE' ? '10 (for 10%)' : '300 (for ৳300)'}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Min Order Amount (BDT ৳)</label>
                <input
                  type="number"
                  value={minOrderAmount}
                  onChange={(e) => setMinOrderAmount(e.target.value)}
                  placeholder="1000"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Validity (Days)</label>
                <input
                  type="number"
                  value={expiryDays}
                  onChange={(e) => setExpiryDays(e.target.value)}
                  placeholder="30"
                  className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
