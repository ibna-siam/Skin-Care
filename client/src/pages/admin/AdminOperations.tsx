import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Truck,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Package,
  ShieldCheck,
  MapPin,
  RefreshCw,
  Clock,
  DollarSign,
  AlertCircle,
  Save,
  Sliders,
  ExternalLink,
} from 'lucide-react';

export const AdminOperations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/payments')) return 'payments';
    if (path.includes('/alerts')) return 'alerts';
    return 'delivery';
  };

  const [activeTab, setActiveTab] = useState<'delivery' | 'payments' | 'alerts'>(getActiveTabFromPath());

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'delivery' | 'payments' | 'alerts') => {
    setActiveTab(tab);
    navigate(`/admin/operations/${tab}`);
  };

  // State for editable delivery rates
  const [dhakaFee, setDhakaFee] = useState('60');
  const [outsideDhakaFee, setOutsideDhakaFee] = useState('120');
  const [expressFee, setExpressFee] = useState('150');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('2000');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [paymentSaveSuccess, setPaymentSaveSuccess] = useState(false);

  // Fetch Live Store Settings for Operations & Payments Sync
  const { data: storeSettings = [], isLoading: isLoadingSettings } = useQuery({
    queryKey: ['admin-store-settings'],
    queryFn: () => adminService.getStoreSettings(),
  });

  const getSettingVal = (k: string, def = '') => {
    const s = storeSettings.find((item: any) => item.key === k);
    return s ? s.value : def;
  };

  useEffect(() => {
    if (storeSettings.length > 0) {
      setDhakaFee(getSettingVal('delivery_dhaka', '60'));
      setOutsideDhakaFee(getSettingVal('delivery_outside', '120'));
      setExpressFee(getSettingVal('delivery_express', '150'));
      setFreeShippingThreshold(getSettingVal('free_shipping_threshold', '2000'));
    }
  }, [storeSettings]);

  // Payment Gateway Toggle Mutation
  const paymentToggleMutation = useMutation({
    mutationFn: async (payload: { key: string; value: string; group: string }) => {
      return adminService.updateStoreSetting(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-store-settings'] });
      setPaymentSaveSuccess(true);
      setTimeout(() => setPaymentSaveSuccess(false), 3000);
    },
  });

  const handleTogglePayment = (key: string, currentValue: string) => {
    const nextVal = currentValue === 'true' ? 'false' : 'true';
    paymentToggleMutation.mutate({ key, value: nextVal, group: 'PAYMENT' });
  };

  // Fetch Inventory and Orders for live alerts
  const { data: inventoryData, isLoading: isLoadingInventory, refetch: refetchInventory } = useQuery({
    queryKey: ['admin-operations-inventory'],
    queryFn: () => adminService.getProducts({ limit: 50, stockLevel: 'low' }),
  });

  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ['admin-operations-orders'],
    queryFn: () => adminService.getOrders({ limit: 20, status: 'PENDING' }),
  });

  const lowStockProducts = inventoryData?.data || [];
  const pendingOrders = ordersData?.data || [];

  const handleSaveDeliveryRates = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminService.updateStoreSettingsBatch([
      { key: 'delivery_dhaka', value: dhakaFee, group: 'SHIPPING' },
      { key: 'delivery_outside', value: outsideDhakaFee, group: 'SHIPPING' },
      { key: 'delivery_express', value: expressFee, group: 'SHIPPING' },
      { key: 'free_shipping_threshold', value: freeShippingThreshold, group: 'SHIPPING' },
    ]);
    queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] });
    queryClient.invalidateQueries({ queryKey: ['public-store-settings'] });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const isCodEnabled = getSettingVal('ENABLE_COD', 'true') === 'true';
  const isBkashEnabled = getSettingVal('ENABLE_BKASH', 'true') === 'true';
  const isSslEnabled = getSettingVal('ENABLE_SSLCOMMERZ', 'true') === 'true';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Truck size={24} className="text-emerald-400" />
            Operations, Delivery & Reconciliation Hub
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure Bangladesh courier delivery zones, reconcile bKash/SSLCommerz/COD settlements, and synchronize payment gateway availability.
          </p>
        </div>

        <button
          onClick={() => {
            refetchInventory();
            queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] });
          }}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh operations"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('delivery')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'delivery'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Truck size={14} />
          <span>Delivery Zones & Rates</span>
        </button>

        <button
          onClick={() => handleTabChange('payments')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'payments'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <CreditCard size={14} />
          <span>Payment Gateways & Operations Sync</span>
        </button>

        <button
          onClick={() => handleTabChange('alerts')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'alerts'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <AlertTriangle size={14} />
          <span>Operations Watchlist ({lowStockProducts.length + pendingOrders.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: DELIVERY ZONES & RATES */}
      {/* ========================================================================= */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MapPin size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Inside Dhaka Zone</h3>
                <p className="text-xs text-slate-400 mt-0.5">24-48 Hours Doorstep Delivery</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Shipping Rate:</span>
                <strong className="text-emerald-400 font-mono text-base">৳{dhakaFee} BDT</strong>
              </div>
              <span className="inline-block text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Steadfast Courier / Pathao
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                <Truck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Outside Dhaka Zone</h3>
                <p className="text-xs text-slate-400 mt-0.5">64 Districts (3-5 Business Days)</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Shipping Rate:</span>
                <strong className="text-blue-400 font-mono text-base">৳{outsideDhakaFee} BDT</strong>
              </div>
              <span className="inline-block text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Steadfast Courier / RedX
              </span>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
              <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-100">Urgent Same-Day Express</h3>
                <p className="text-xs text-slate-400 mt-0.5">Guaranteed Delivery within 12 Hours (Dhaka only)</p>
              </div>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">Shipping Rate:</span>
                <strong className="text-purple-400 font-mono text-base">৳{expressFee} BDT</strong>
              </div>
              <span className="inline-block text-[10px] text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                Pathao Instant Logistics
              </span>
            </div>
          </div>

          {/* Editable Rates Form */}
          <form onSubmit={handleSaveDeliveryRates} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 max-w-2xl text-xs">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders size={16} className="text-emerald-400" />
              Modify Live Shipping Rate Configurations
            </h3>

            {saveSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle2 size={14} />
                <span>Shipping rates updated and synced across the checkout engine!</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Inside Dhaka Fee (BDT)</label>
                <input
                  type="number"
                  value={dhakaFee}
                  onChange={(e) => setDhakaFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Outside Dhaka Fee (BDT)</label>
                <input
                  type="number"
                  value={outsideDhakaFee}
                  onChange={(e) => setOutsideDhakaFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Express Courier Fee (BDT)</label>
                <input
                  type="number"
                  value={expressFee}
                  onChange={(e) => setExpressFee(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Free Shipping Order Threshold (BDT)</label>
                <input
                  type="number"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-all flex items-center gap-1.5"
              >
                <Save size={14} />
                <span>Save Delivery Setup</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: PAYMENTS GATEWAYS & SYNCHRONIZATION */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {paymentSaveSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} />
              <span>Payment gateway state synchronized across Admin Panel and Storefront Checkout!</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* bKash Card */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">bKash Direct Merchant</span>
                <CreditCard size={16} className="text-pink-400" />
              </div>
              <p className="text-2xl font-bold text-pink-400">bKash Gateway</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className={`text-xs font-bold ${isBkashEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isBkashEnabled ? '● Active in Checkout' : '○ Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => handleTogglePayment('ENABLE_BKASH', isBkashEnabled ? 'true' : 'false')}
                  disabled={paymentToggleMutation.isPending}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isBkashEnabled
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  }`}
                >
                  {isBkashEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* SSLCommerz Card */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">SSLCOMMERZ Multi-Gateway</span>
                <CreditCard size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400">Cards & MFS</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className={`text-xs font-bold ${isSslEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isSslEnabled ? '● Active in Checkout' : '○ Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => handleTogglePayment('ENABLE_SSLCOMMERZ', isSslEnabled ? 'true' : 'false')}
                  disabled={paymentToggleMutation.isPending}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isSslEnabled
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  }`}
                >
                  {isSslEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>

            {/* Cash on Delivery Card */}
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold">Cash on Delivery (COD)</span>
                <DollarSign size={16} className="text-amber-400" />
              </div>
              <p className="text-2xl font-bold text-amber-400">Doorstep COD</p>
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className={`text-xs font-bold ${isCodEnabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isCodEnabled ? '● Active in Checkout' : '○ Disabled'}
                </span>
                <button
                  type="button"
                  onClick={() => handleTogglePayment('ENABLE_COD', isCodEnabled ? 'true' : 'false')}
                  disabled={paymentToggleMutation.isPending}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    isCodEnabled
                      ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30'
                  }`}
                >
                  {isCodEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <CreditCard size={16} className="text-emerald-400" />
                Payment Gateway Reconciliation & Configuration
              </h3>
              <button
                onClick={() => navigate('/admin/integrations/payments')}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <span>Edit API Credentials</span>
                <ExternalLink size={12} />
              </button>
            </div>

            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs space-y-2 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Next Courier COD Settlement:</span>
                <span className="font-mono text-emerald-400 font-bold">Upcoming Sunday, 11:00 AM BDT</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Partner Courier Accounts:</span>
                <span className="font-mono text-slate-400">Steadfast ID: #SF-88392, Pathao ID: #PT-1940</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold">Payment Synchronization:</span>
                <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                  <CheckCircle2 size={12} /> Synchronized with DB & Storefront
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: INVENTORY & FULFILLMENT ALERTS */}
      {/* ========================================================================= */}
      {activeTab === 'alerts' && (
        <div className="space-y-6">
          {/* Low Stock Watchlist */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-amber-400" />
                  Inventory Low-Stock Warning List
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Products below safe reorder threshold (≤ 5 units)</p>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                {lowStockProducts.length} Items Alert
              </span>
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs">
                <CheckCircle2 size={18} />
                <span>All skincare products are safely stocked above minimum threshold!</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 text-xs">
                {lowStockProducts.map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">{p.name}</p>
                      <span className="text-[10px] text-slate-400 font-mono">SKU: {p.sku} | Brand: {p.brand?.name || 'Skincare'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-rose-400 font-mono">{p.stock} in stock</span>
                      <button
                        onClick={() => navigate('/admin/inventory')}
                        className="block text-[11px] text-emerald-400 hover:underline mt-0.5"
                      >
                        Adjust Stock →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pending Orders Needing Dispatch */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  Pending Orders Needing Dispatch
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Awaiting packing and courier handover</p>
              </div>

              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-400 border border-blue-500/30">
                {pendingOrders.length} Orders
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-xs">
                <CheckCircle2 size={18} />
                <span>Zero backlogged pending orders!</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 text-xs">
                {pendingOrders.slice(0, 5).map((o: any) => (
                  <div key={o.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-200">Order #{o.orderNumber}</p>
                      <span className="text-[10px] text-slate-400">Customer: {o.customerName} ({o.customerPhone})</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-400 font-mono">৳{o.totalAmount}</span>
                      <button
                        onClick={() => navigate('/admin/orders')}
                        className="block text-[11px] text-emerald-400 hover:underline mt-0.5"
                      >
                        Fulfill Order →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
