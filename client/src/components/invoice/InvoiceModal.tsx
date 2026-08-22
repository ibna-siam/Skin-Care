import React from 'react';
import { X, Printer, CheckCircle2, AlertCircle, Truck, Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useStoreSettingsStore } from '../../stores/storeSettingsStore';

interface InvoiceModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ order, isOpen, onClose }) => {
  const getSetting = useStoreSettingsStore((state) => state.getSetting);

  if (!isOpen || !order) return null;

  const storeName = getSetting('STORE_NAME', 'Skincare Bangladesh');
  const storePhone = getSetting('SUPPORT_PHONE', '+880 1711-223344');
  const storeEmail = getSetting('SUPPORT_EMAIL', 'support@skincare.com.bd');
  const storeAddress = getSetting('STORE_ADDRESS', 'House 42, Road 11, Banani, Dhaka-1213, Bangladesh');

  const handlePrint = () => {
    window.print();
  };

  const isPaid = order.paymentStatus === 'PAID';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none">
        
        {/* Action Header - Hidden during print */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-emerald-400" />
            <h3 className="font-serif text-lg font-bold">Tax & Delivery Invoice</h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Sheet */}
        <div className="p-8 print:p-6 text-slate-800 font-sans" id="printable-invoice">
          
          {/* Top Brand & Invoice Info Bar */}
          <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-6">
            <div>
              <h1 className="text-2xl font-serif font-black tracking-tight text-slate-900 uppercase">
                {storeName}
              </h1>
              <p className="text-xs text-slate-500 font-medium mt-1">100% Authentic Dermatological Care</p>
              
              <div className="mt-3 text-xs text-slate-600 space-y-1">
                <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {storeAddress}</p>
                <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {storePhone}</p>
                <p className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-slate-400" /> {storeEmail}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-800 tracking-wider uppercase mb-2">
                Official Invoice
              </div>
              <p className="text-sm font-bold font-mono text-slate-900">#{order.orderNumber}</p>
              <p className="text-xs text-slate-500 mt-1">
                Date: {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </p>
              
              {/* Payment status badge */}
              <div className="mt-3 flex justify-end">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> PAID
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> CASH ON DELIVERY
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Customer & Shipping Details */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs mb-6">
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-2">Customer & Billing</p>
              <p className="font-bold text-sm text-slate-900">{order.customerName}</p>
              <p className="text-slate-600 mt-0.5">{order.customerPhone}</p>
              <p className="text-slate-600">{order.customerEmail}</p>
            </div>
            <div>
              <p className="font-bold text-slate-500 uppercase tracking-wider mb-2">Shipping Destination</p>
              <p className="text-slate-800 font-medium">{order.fullAddress}</p>
              <p className="text-slate-600">{order.area ? `${order.area}, ` : ''}{order.district}, {order.division}</p>
              {order.trackingNumber && (
                <p className="mt-2 flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-800">
                  <Truck className="w-3.5 h-3.5" /> Tracking: {order.trackingNumber} ({order.courierName || 'Steadfast'})
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full border-collapse text-left mb-6 text-xs">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase tracking-wider">
                <th className="py-2.5 font-bold">Item Description</th>
                <th className="py-2.5 text-center font-bold">SKU</th>
                <th className="py-2.5 text-right font-bold">Unit Price</th>
                <th className="py-2.5 text-center font-bold">Qty</th>
                <th className="py-2.5 text-right font-bold">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(order.items || []).map((item: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 font-semibold text-slate-900">{item.productName}</td>
                  <td className="py-3 text-center font-mono text-slate-500">{item.productSku || 'SKU-GEN'}</td>
                  <td className="py-3 text-right text-slate-700">৳{item.price}</td>
                  <td className="py-3 text-center font-bold text-slate-900">{item.quantity}</td>
                  <td className="py-3 text-right font-bold text-slate-900">৳{item.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pricing Calculation Summary */}
          <div className="flex justify-end pt-2 border-t border-slate-200">
            <div className="w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-900">৳{order.subtotal}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount {order.couponCode ? `(${order.couponCode})` : ''}</span>
                  <span>-৳{order.discount}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Fee ({order.deliveryMethod || 'Standard'})</span>
                <span className="font-semibold text-slate-900">৳{order.shippingFee}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-slate-900 pt-2 border-t border-slate-300">
                <span>Total Payable</span>
                <span className="text-base font-black text-slate-950 font-mono">৳{order.totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-4 border-t border-dashed border-slate-200 text-center text-[11px] text-slate-500">
            <p>Thank you for choosing {storeName}! For inquiries, please email {storeEmail} with your Order Number #{order.orderNumber}.</p>
            <p className="mt-1 font-mono text-[10px]">Computer generated invoice • No physical signature required</p>
          </div>

        </div>

      </div>
    </div>
  );
};
