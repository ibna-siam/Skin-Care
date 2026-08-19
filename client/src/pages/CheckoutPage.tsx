import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/order.service';
import {
  BANGLADESH_DIVISIONS,
  calculateShippingFee,
  formatBDT,
  isValidBDPhone,
  normalizeBDPhone
} from '@skincare/shared';
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, subtotal, appliedCoupon, fetchCart } = useCartStore();
  const { user } = useAuthStore();

  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [selectedDivision, setSelectedDivision] = useState('dhaka');
  const [selectedDistrict, setSelectedDistrict] = useState('dhaka-city');
  const [area, setArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'BKASH' | 'NAGAD' | 'SSLCOMMERZ'>('COD');
  const [notes, setNotes] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  // Sync user profile data if logged in
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);

      const defaultAddr = user.addresses?.find((a: any) => a.isDefault) || user.addresses?.[0];
      if (defaultAddr) {
        setCustomerName(defaultAddr.recipientName);
        setCustomerPhone(defaultAddr.phone);
        setSelectedDivision(defaultAddr.division.toLowerCase());
        setSelectedDistrict(defaultAddr.district);
        setArea(defaultAddr.area);
        setFullAddress(defaultAddr.fullAddress);
        if (defaultAddr.postalCode) setPostalCode(defaultAddr.postalCode);
      }
    }
  }, [user]);

  // Current districts for selected division
  const currentDivisionObj = BANGLADESH_DIVISIONS.find((d) => d.id === selectedDivision) || BANGLADESH_DIVISIONS[0];

  // Calculate dynamic shipping fee
  const isFreeShipCoupon = appliedCoupon?.isFreeDelivery;
  let shippingFee = calculateShippingFee(selectedDistrict, subtotal, deliveryMethod === 'EXPRESS');
  if (isFreeShipCoupon) shippingFee = 0;

  const discountAmount = appliedCoupon?.discountAmount || 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isValidBDPhone(customerPhone)) {
      setError('Please enter a valid Bangladeshi phone number (e.g. 01712345678 or +8801712345678)');
      return;
    }

    if (items.length === 0) {
      setError('Your shopping cart is empty.');
      return;
    }

    setIsLoading(true);

    try {
      const orderPayload = {
        customerName,
        customerEmail,
        customerPhone: normalizeBDPhone(customerPhone),
        division: currentDivisionObj.name,
        district: selectedDistrict,
        area,
        fullAddress,
        postalCode: postalCode || null,
        deliveryMethod,
        paymentMethod,
        couponCode: appliedCoupon?.code || null,
        notes: notes || null,
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
      };

      const response = await orderService.createOrder(orderPayload);

      if (response.success && response.data) {
        const { order, payment } = response.data;
        await fetchCart(); // Clear cart state

        if (payment?.isDirectComplete || paymentMethod === 'COD') {
          setPlacedOrder(order);
        } else if (payment?.gatewayUrl) {
          window.location.href = payment.gatewayUrl;
        } else {
          setPlacedOrder(order);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Order Confirmation View
  if (placedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 size={44} />
        </div>
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
            Order Confirmed!
          </span>
          <h2 className="font-serif text-3xl font-bold text-charcoal-900">
            Thank you, {customerName}!
          </h2>
          <p className="text-sm text-gray-600">
            Your order <span className="font-bold font-mono text-brand-800">#{placedOrder.orderNumber}</span> has been received and is being prepared in our Dhaka warehouse.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-white rounded-3xl border border-cream-300 p-6 text-left shadow-sm space-y-4">
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-xs text-gray-500">Order ID:</span>
            <span className="font-bold font-mono text-sm">{placedOrder.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-xs text-gray-500">Payment Method:</span>
            <span className="font-semibold text-xs uppercase bg-cream-200 px-2 py-0.5 rounded text-charcoal-800">
              {placedOrder.paymentMethod}
            </span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-gray-100">
            <span className="text-xs text-gray-500">Total Amount:</span>
            <span className="font-bold text-lg text-brand-800">{formatBDT(placedOrder.totalAmount)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-500">Delivery Address:</span>
            <span className="text-xs font-medium text-right max-w-xs text-charcoal-800">
              {fullAddress}, {area}, {currentDivisionObj.name}
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to={`/track-order?orderNumber=${placedOrder.orderNumber}&phone=${encodeURIComponent(customerPhone)}`}
            className="px-6 py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow"
          >
            <Truck size={16} /> Track My Order
          </Link>
          <Link
            to="/"
            className="px-6 py-3 bg-white border border-gray-300 hover:bg-cream-100 text-charcoal-800 rounded-xl text-xs font-semibold"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-cream-300">
        <div>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900">Checkout</h1>
          <p className="text-xs text-gray-500 mt-1">Complete your delivery address and payment method</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-brand-800 font-semibold bg-brand-50 px-3 py-1.5 rounded-full">
          <Lock size={14} /> 256-Bit SSL Encrypted
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Customer & Delivery Details */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Contact Info */}
          <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs flex items-center justify-center">1</span>
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ayesha Rahman"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="customer@example.com"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">
                  Bangladeshi Mobile Phone (for Delivery SMS & Courier) *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="01712345678"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 2: Delivery Address */}
          <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs flex items-center justify-center">2</span>
              Delivery Address (Bangladesh)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">Division *</label>
                <select
                  value={selectedDivision}
                  onChange={(e) => {
                    setSelectedDivision(e.target.value);
                    const div = BANGLADESH_DIVISIONS.find((d) => d.id === e.target.value);
                    if (div && div.districts.length > 0) {
                      setSelectedDistrict(div.districts[0].id);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none"
                >
                  {BANGLADESH_DIVISIONS.map((div) => (
                    <option key={div.id} value={div.id}>
                      {div.name} ({div.bnName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">District / City *</label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none"
                >
                  {currentDivisionObj.districts.map((dist) => (
                    <option key={dist.id} value={dist.id}>
                      {dist.name} ({dist.bnName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">Thana / Area *</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  placeholder="e.g. Gulshan-2, Dhanmondi, Agrabad"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">Postal Code</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="e.g. 1212"
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-charcoal-800 mb-1">Full Street Address *</label>
                <textarea
                  required
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="House number, Road number, Flat / Floor details..."
                  className="w-full px-3.5 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Step 3: Delivery Method */}
          <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs flex items-center justify-center">3</span>
              Delivery Speed
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  deliveryMethod === 'STANDARD'
                    ? 'border-brand-800 bg-brand-50/40'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'STANDARD'}
                      onChange={() => setDeliveryMethod('STANDARD')}
                      className="text-brand-800 focus:ring-brand-800"
                    />
                    <span className="font-bold text-sm text-charcoal-900">Standard Delivery</span>
                  </div>
                  <span className="text-xs font-bold text-brand-800">
                    {selectedDistrict === 'dhaka-city' ? '৳60' : '৳120'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Inside Dhaka (24-48 hrs), Outside Dhaka (3-5 days)</p>
              </label>

              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  deliveryMethod === 'EXPRESS'
                    ? 'border-brand-800 bg-brand-50/40'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      checked={deliveryMethod === 'EXPRESS'}
                      onChange={() => setDeliveryMethod('EXPRESS')}
                      className="text-brand-800 focus:ring-brand-800"
                    />
                    <span className="font-bold text-sm text-charcoal-900">Express Priority</span>
                  </div>
                  <span className="text-xs font-bold text-brand-800">
                    {selectedDistrict === 'dhaka-city' ? '৳140' : '৳200'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">Same-day inside Dhaka (if ordered before 12 PM)</p>
              </label>
            </div>
          </div>

          {/* Step 4: Payment Method */}
          <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="font-bold text-sm text-charcoal-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-800 text-white text-xs flex items-center justify-center">4</span>
              Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* COD */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'COD'
                    ? 'border-brand-800 bg-brand-50/40'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="text-brand-800"
                    />
                    <span className="font-bold text-sm text-charcoal-900">Cash on Delivery (COD)</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Pay with cash when courier delivers the package to your door.</p>
              </label>

              {/* bKash */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'BKASH'
                    ? 'border-brand-800 bg-brand-50/40'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'BKASH'}
                      onChange={() => setPaymentMethod('BKASH')}
                      className="text-brand-800"
                    />
                    <span className="font-bold text-sm text-pink-700">bKash Online Payment</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Instant digital payment via official bKash gateway.</p>
              </label>

              {/* Nagad */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'NAGAD'
                    ? 'border-brand-800 bg-brand-50/40'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'NAGAD'}
                      onChange={() => setPaymentMethod('NAGAD')}
                      className="text-brand-800"
                    />
                    <span className="font-bold text-sm text-orange-600">Nagad Payment</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Pay directly with your Nagad wallet account.</p>
              </label>

              {/* SSLCommerz / Cards */}
              <label
                className={`p-4 rounded-2xl border-2 cursor-pointer flex flex-col justify-between transition-all ${
                  paymentMethod === 'SSLCOMMERZ'
                    ? 'border-brand-800 bg-brand-50/40'
                    : 'border-cream-300 bg-white hover:bg-cream-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === 'SSLCOMMERZ'}
                      onChange={() => setPaymentMethod('SSLCOMMERZ')}
                      className="text-brand-800"
                    />
                    <span className="font-bold text-sm text-blue-700">Cards & NetBanking</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500">Visa, Mastercard, DBBL Nexus, City Bank, Brac Bank.</p>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-sm sticky top-24 space-y-5">
            <h4 className="font-bold text-sm text-charcoal-900 pb-3 border-b border-gray-100">
              Order Review ({items.length} items)
            </h4>

            {/* Items summary */}
            <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1 space-y-2">
              {items.map((item) => (
                <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 max-w-[70%]">
                    <span className="font-bold text-brand-800">{item.quantity}x</span>
                    <span className="font-medium text-charcoal-800 truncate">{item.product?.name}</span>
                  </div>
                  <span className="font-bold text-charcoal-900">{formatBDT(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Calculations */}
            <div className="pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-charcoal-900">{formatBDT(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Coupon ({appliedCoupon?.code})</span>
                  <span>-{formatBDT(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Shipping ({selectedDistrict === 'dhaka-city' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                <span className="font-semibold text-charcoal-900">
                  {shippingFee === 0 ? 'FREE' : formatBDT(shippingFee)}
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
              <span className="text-sm font-bold text-charcoal-900">Total Payable</span>
              <span className="text-2xl font-bold text-brand-900">{formatBDT(grandTotal)}</span>
            </div>

            <button
              type="submit"
              disabled={isLoading || items.length === 0}
              className="w-full py-4 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? 'Processing Order...' : 'Confirm & Place Order'}
              <ArrowRight size={16} />
            </button>

            <div className="p-3 bg-cream-100 rounded-xl text-[11px] text-gray-500 space-y-1">
              <p className="flex items-center gap-1"><ShieldCheck size={14} className="text-brand-800" /> 100% Genuine Skincare Guarantee</p>
              <p className="flex items-center gap-1"><Clock size={14} className="text-brand-800" /> 7-Day Hassle Free Return Policy</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
