import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { orderService } from '../services/order.service';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, Tag, Sparkles, CheckCircle2 } from 'lucide-react';
import { formatBDT } from '@skincare/shared';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    items,
    subtotal,
    updateQuantity,
    removeItem,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    freeShippingThreshold,
  } = useCartStore();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Approximate default shipping for cart page estimate
  const estimatedShipping = subtotal >= freeShippingThreshold || appliedCoupon?.isFreeDelivery ? 0 : 60;
  const grandTotal = Math.max(0, subtotal - discountAmount + estimatedShipping);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError(null);
    setCouponLoading(true);
    try {
      const res = await orderService.validateCoupon(couponCode.trim(), subtotal);
      if (res.data) {
        applyCoupon(res.data);
        setCouponCode('');
      }
    } catch (err: any) {
      setCouponError(err.message || 'Invalid or expired coupon code');
    } finally {
      setCouponLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-20 h-20 bg-cream-200 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <Tag size={36} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-charcoal-900">Your Cart is Currently Empty</h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          You haven’t added any skincare items yet. Explore our curated catalog of authentic international brands.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
        >
          Explore Best Sellers
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <h1 className="font-serif text-3xl font-bold text-charcoal-900">Shopping Cart</h1>

      {/* Free Delivery Bar */}
      <div className="bg-cream-100 p-5 rounded-2xl border border-cream-300">
        {remainingForFreeShipping > 0 ? (
          <p className="text-xs font-medium text-charcoal-800 mb-2 flex items-center gap-1.5">
            <Sparkles size={16} className="text-amber-500" />
            Add <span className="font-bold text-brand-800">{formatBDT(remainingForFreeShipping)}</span> more to qualify for <span className="font-bold uppercase text-brand-800">Free Delivery across Bangladesh</span>
          </p>
        ) : (
          <p className="text-xs font-bold text-emerald-800 mb-2 flex items-center gap-1.5">
            <CheckCircle2 size={16} className="text-emerald-600" />
            You've unlocked FREE delivery!
          </p>
        )}
        <div className="w-full bg-cream-300 rounded-full h-2.5 overflow-hidden">
          <div className="bg-brand-800 h-full rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-cream-300 p-6 shadow-sm space-y-6">
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product?.image}
                    alt={item.product?.name}
                    className="w-20 h-20 object-contain rounded-2xl border border-gray-100 bg-cream-50 p-2 shrink-0"
                  />
                  <div>
                    {item.product?.brand && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        {item.product.brand}
                      </span>
                    )}
                    <h3 className="text-sm font-semibold text-charcoal-900 hover:text-brand-800">
                      <Link to={`/product/${item.product?.slug}`}>{item.product?.name}</Link>
                    </h3>
                    <p className="text-sm font-bold text-brand-800 mt-1">{formatBDT(item.unitPrice)}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                  {/* Quantity */}
                  <div className="flex items-center border border-gray-200 rounded-xl bg-cream-50 p-1">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="p-1.5 text-gray-500 hover:text-charcoal-800"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-xs font-bold text-charcoal-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="p-1.5 text-gray-500 hover:text-charcoal-800"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <span className="text-sm font-bold text-charcoal-900 w-24 text-right">
                    {formatBDT(item.totalPrice)}
                  </span>

                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <Link to="/shop" className="text-xs font-semibold text-brand-800 hover:underline">
              ← Continue Shopping
            </Link>
          </div>
        </div>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-4 space-y-6">
          {/* Coupon Code Card */}
          <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-sm space-y-3">
            <h4 className="font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <Tag size={16} /> Have a Promo Code?
            </h4>
            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                <div>
                  <span className="font-bold font-mono">{appliedCoupon.code}</span> applied
                  <p className="text-[11px] text-emerald-700">
                    {appliedCoupon.isFreeDelivery ? 'Free Delivery' : `৳${appliedCoupon.discountAmount} discount`}
                  </p>
                </div>
                <button onClick={removeCoupon} className="text-xs text-red-600 font-semibold hover:underline">
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="e.g. WELCOME10"
                  className="flex-1 px-3 py-2 bg-cream-50 border border-cream-300 rounded-xl text-xs uppercase font-mono focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={couponLoading}
                  className="px-4 py-2 bg-charcoal-800 hover:bg-black text-white rounded-xl text-xs font-semibold"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </form>
            )}
            {couponError && <p className="text-xs text-red-600">{couponError}</p>}
          </div>

          {/* Price Breakdown */}
          <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-charcoal-900 pb-3 border-b border-gray-100">
              Order Summary
            </h4>

            <div className="space-y-2.5 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">{formatBDT(subtotal)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon Discount</span>
                  <span>-{formatBDT(discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-charcoal-900">
                  {estimatedShipping === 0 ? 'FREE' : formatBDT(estimatedShipping)}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-charcoal-900">Estimated Total</span>
              <span className="text-2xl font-bold text-brand-900">{formatBDT(grandTotal)}</span>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full py-3.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-400 pt-2">
              <ShieldCheck size={14} className="text-brand-800" />
              <span>Safe & Secure Bangladesh Checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
