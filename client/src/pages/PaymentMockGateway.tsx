import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { orderService } from '../services/order.service';
import { ShieldCheck, CheckCircle2, XCircle, ArrowRight, Lock } from 'lucide-react';
import { formatBDT } from '@skincare/shared';

export const PaymentMockGateway: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const gateway = searchParams.get('gateway') || 'bkash';
  const orderId = searchParams.get('orderId') || '';
  const amount = parseFloat(searchParams.get('amount') || '0');
  const trxId = searchParams.get('trxId') || `TRX-${Date.now()}`;

  const [pin, setPin] = useState('12345');
  const [otp, setOtp] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');

  const isBkash = gateway === 'bkash';
  const isNagad = gateway === 'nagad';
  const isSSL = gateway === 'sslcommerz';

  const brandColor = isBkash
    ? 'bg-[#e2136e]'
    : isNagad
    ? 'bg-[#f7941d]'
    : 'bg-[#0052cc]';

  const handlePaySuccess = async () => {
    setIsLoading(true);
    try {
      await orderService.verifyPayment({
        orderId,
        transactionId: trxId,
        gateway,
        status: 'PAID',
      });
      setStatus('success');
      setTimeout(() => {
        navigate(`/account`);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Payment verification failed');
      setStatus('failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayFail = () => {
    setStatus('failed');
    setTimeout(() => {
      navigate('/checkout');
    }, 2000);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-cream-200">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden">
        {/* Gateway Header */}
        <div className={`${brandColor} text-white p-6 text-center space-y-2`}>
          <span className="text-[10px] uppercase font-bold tracking-widest bg-white/20 px-3 py-0.5 rounded-full">
            Sandbox Payment Simulator
          </span>
          <h2 className="text-2xl font-black uppercase tracking-tight">
            {isBkash ? 'bKash Payment' : isNagad ? 'Nagad Gateway' : 'SSLCommerz Gateway'}
          </h2>
          <p className="text-xs opacity-90">Merchant: Skincare Bangladesh Ltd.</p>
        </div>

        {/* Amount bar */}
        <div className="bg-cream-100 p-4 text-center border-b border-cream-300">
          <p className="text-xs text-gray-500">Total Payable Amount</p>
          <p className="text-2xl font-bold text-charcoal-900">{formatBDT(amount)}</p>
          <p className="text-[10px] font-mono text-gray-400 mt-0.5">TrxID: {trxId}</p>
        </div>

        {/* Simulation form */}
        <div className="p-6 space-y-5">
          {status === 'idle' && (
            <>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                <span className="font-bold">Development Sandbox Mode:</span> Click confirm below to simulate a successful payment callback or cancel to test failure.
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Simulated Mobile Number</label>
                  <input
                    type="text"
                    disabled
                    value="01712345678"
                    className="w-full px-3 py-2 bg-gray-100 rounded-lg font-mono text-gray-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">PIN / Secret Code</label>
                  <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 bg-cream-50 border rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handlePayFail}
                  className="py-3 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-semibold"
                >
                  Simulate Failure
                </button>
                <button
                  type="button"
                  onClick={handlePaySuccess}
                  disabled={isLoading}
                  className={`py-3 ${brandColor} text-white hover:opacity-95 rounded-xl text-xs font-bold uppercase tracking-wider shadow`}
                >
                  {isLoading ? 'Verifying...' : 'Confirm & Pay'}
                </button>
              </div>
            </>
          )}

          {status === 'success' && (
            <div className="py-6 text-center text-emerald-800 space-y-3">
              <CheckCircle2 size={48} className="text-emerald-600 mx-auto" />
              <h3 className="text-lg font-bold">Payment Verified Successfully!</h3>
              <p className="text-xs text-gray-500">Redirecting to your orders dashboard...</p>
            </div>
          )}

          {status === 'failed' && (
            <div className="py-6 text-center text-rose-800 space-y-3">
              <XCircle size={48} className="text-rose-600 mx-auto" />
              <h3 className="text-lg font-bold">Payment Cancelled</h3>
              <p className="text-xs text-gray-500">Redirecting back to checkout...</p>
            </div>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 pt-2 border-t border-gray-100">
            <Lock size={12} />
            <span>Secure Bangladesh Payment Adapter</span>
          </div>
        </div>
      </div>
    </div>
  );
};
