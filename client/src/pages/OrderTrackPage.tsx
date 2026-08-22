import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { Order, formatBDT } from '@skincare/shared';
import { InvoiceModal } from '../components/invoice/InvoiceModal';
import {
  Truck,
  Search,
  CheckCircle2,
  Package,
  Clock,
  MapPin,
  Phone,
  AlertCircle,
  FileText,
  Printer
} from 'lucide-react';

export const OrderTrackPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderNumberParam = searchParams.get('orderNumber') || '';
  const phoneParam = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(orderNumberParam);
  const [phone, setPhone] = useState(phoneParam);
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);

  const fetchTracking = async (ordNum: string, ph: string) => {
    if (!ordNum.trim() || !ph.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await orderService.trackOrder(ordNum.trim(), ph.trim());
      if (data) {
        setOrder(data);
      } else {
        setError('No order found matching this Order Number and Phone.');
      }
    } catch (err: any) {
      setError(err.message || 'Unable to find order. Please check credentials.');
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumberParam && phoneParam) {
      fetchTracking(orderNumberParam, phoneParam);
    }
  }, [orderNumberParam, phoneParam]);

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim() || !phone.trim()) {
      setError('Please provide both Order Number and Phone Number.');
      return;
    }
    setSearchParams({ orderNumber: orderNumber.trim(), phone: phone.trim() });
    fetchTracking(orderNumber, phone);
  };

  const steps = [
    { key: 'PENDING', label: 'Order Placed' },
    { key: 'CONFIRMED', label: 'Confirmed' },
    { key: 'PROCESSING', label: 'Processing' },
    { key: 'PACKED', label: 'Packed' },
    { key: 'SHIPPED', label: 'Shipped' },
    { key: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { key: 'DELIVERED', label: 'Delivered' },
  ];

  const getStepIndex = (status: string) => {
    const idx = steps.findIndex((s) => s.key === status);
    return idx >= 0 ? idx : 0;
  };

  const currentStepIdx = order ? getStepIndex(order.orderStatus) : 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-brand-800 bg-brand-50 px-3 py-1 rounded-full">
          Live Tracking
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-charcoal-900">
          Track Your Skincare Order
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto">
          Enter your Order ID (e.g. SKN10245) and the Bangladeshi phone number used during checkout.
        </p>
      </div>

      {searchParams.get('payment') === 'success' && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in">
          <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
          <div>
            <p className="text-sm font-bold">🎉 Payment Successful &amp; Order Confirmed!</p>
            <p className="text-xs text-emerald-700 mt-0.5">
              Thank you! Your payment has been verified. We have sent a confirmation message to your mobile number.
            </p>
          </div>
        </div>
      )}

      {/* Query Form */}
      <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleTrackSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Order ID / Number
            </label>
            <input
              type="text"
              required
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="e.g. SKN10245"
              className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="01712345678"
              className="w-full px-4 py-2.5 bg-cream-50 border border-cream-300 rounded-xl text-sm font-mono focus:bg-white focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm disabled:opacity-50"
            >
              {isLoading ? '...' : 'Track'}
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Order Status Display */}
      {order && (
        <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-10 shadow-sm space-y-8 animate-in fade-in">
          {/* Top Bar info */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-gray-100">
            <div>
              <span className="text-xs text-gray-500">Order Number</span>
              <h3 className="font-serif text-2xl font-bold text-charcoal-900">#{order.orderNumber}</h3>
              <p className="text-xs text-gray-400">Placed on {new Date(order.createdAt).toLocaleDateString('en-BD', { dateStyle: 'long' })}</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-brand-50 text-brand-800 border border-brand-200">
                {order.orderStatus.replace(/_/g, ' ')}
              </span>
            </div>
          </div>

          {/* Visual Milestone Timeline Bar */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Delivery Progress
            </h4>
            <div className="relative flex items-center justify-between max-w-2xl mx-auto py-4">
              <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-cream-300 w-full z-0" />
              <div
                className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-800 transition-all duration-500 z-0"
                style={{ width: `${(currentStepIdx / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, idx) => {
                const isPassed = idx <= currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                return (
                  <div key={step.key} className="relative z-10 flex flex-col items-center">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isPassed
                          ? 'bg-brand-800 text-white shadow-sm'
                          : 'bg-white border-2 border-gray-300 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-brand-100' : ''}`}
                    >
                      {isPassed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <span
                      className={`text-[10px] sm:text-xs font-semibold mt-2 text-center whitespace-nowrap ${
                        isPassed ? 'text-brand-800' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Courier & Shipping info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-cream-50 p-5 rounded-2xl border border-cream-200 text-xs">
            <div>
              <span className="text-gray-500 font-medium">Courier Partner:</span>
              <p className="font-bold text-charcoal-800 mt-0.5">{order.courierName || 'Steadfast Courier Bangladesh'}</p>
              {order.trackingNumber && (
                <p className="text-gray-500 mt-1">
                  Tracking Code: <span className="font-mono font-bold text-brand-800">{order.trackingNumber}</span>
                </p>
              )}
            </div>
            <div>
              <span className="text-gray-500 font-medium">Delivery Address:</span>
              <p className="font-semibold text-charcoal-800 mt-0.5">
                {order.fullAddress}, {order.area}, {order.division}
              </p>
              <p className="text-gray-500 mt-1">Recipient Phone: {order.customerPhone}</p>
            </div>
          </div>

          {/* Order Items List */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Purchased Items
            </h4>
            <div className="divide-y divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
              {order.items.map((item) => (
                <div key={item.id} className="p-4 flex items-center justify-between bg-white text-xs">
                  <div className="flex items-center gap-3">
                    <img
                      src={item.productImage || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=200'}
                      alt={item.productName}
                      className="w-12 h-12 object-contain rounded-lg border border-gray-100 p-1"
                    />
                    <div>
                      <h5 className="font-semibold text-charcoal-900">{item.productName}</h5>
                      <span className="text-gray-400">Qty: {item.quantity} × {formatBDT(item.price)}</span>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal-900">{formatBDT(item.subtotal)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Total & Action Bar */}
          <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-baseline gap-2">
              <span className="text-sm font-bold text-charcoal-900">Total Amount:</span>
              <span className="text-2xl font-bold text-brand-900">{formatBDT(order.totalAmount)}</span>
            </div>
            <button
              onClick={() => setIsInvoiceOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <Printer size={15} /> Download / Print Invoice
            </button>
          </div>

          <InvoiceModal
            order={order}
            isOpen={isInvoiceOpen}
            onClose={() => setIsInvoiceOpen(false)}
          />
        </div>
      )}
    </div>
  );
};
