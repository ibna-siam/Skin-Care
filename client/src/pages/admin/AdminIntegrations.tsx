import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  KeyRound,
  Truck,
  CreditCard,
  Mail,
  Smartphone,
  Sparkles,
  Cloud,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Send,
  Activity,
  ShieldCheck,
  Eye,
  EyeOff,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

export const AdminIntegrations: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'courier' | 'payments' | 'sms' | 'email' | 'analytics' | 'storage' | 'auth'>('courier');
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Testing states
  const [testEmail, setTestEmail] = useState('');
  const [testEmailStatus, setTestEmailStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testPhone, setTestPhone] = useState('');
  const [testSmsStatus, setTestSmsStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [testCourierStatus, setTestCourierStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State
  const [formData, setFormData] = useState<Record<string, string>>({
    // Courier - Steadfast
    STEADFAST_API_KEY: '',
    STEADFAST_SECRET_KEY: '',
    STEADFAST_BASE_URL: 'https://portal.packzy.com/api/v1',
    STEADFAST_ENABLED: 'true',

    // Courier - Pathao
    PATHAO_CLIENT_ID: '',
    PATHAO_CLIENT_SECRET: '',
    PATHAO_USERNAME: '',
    PATHAO_PASSWORD: '',
    PATHAO_STORE_ID: '',
    PATHAO_BASE_URL: 'https://api-hermes.pathao.com',
    PATHAO_ENABLED: 'true',

    // Payments - bKash
    BKASH_APP_KEY: '',
    BKASH_APP_SECRET: '',
    BKASH_USERNAME: '',
    BKASH_PASSWORD: '',
    BKASH_BASE_URL: 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    BKASH_IS_SANDBOX: 'true',
    BKASH_ENABLED: 'true',

    // Payments - SSLCOMMERZ
    SSLCOMMERZ_STORE_ID: '',
    SSLCOMMERZ_STORE_PASSWORD: '',
    SSLCOMMERZ_IS_SANDBOX: 'true',
    SSLCOMMERZ_ENABLED: 'true',

    // Payments - Cash on Delivery & Manual
    COD_ENABLED: 'true',
    MANUAL_PAYMENT_ENABLED: 'true',
    MANUAL_PAYMENT_INSTRUCTIONS: 'Send money via bKash Personal to 01700-000000 or Bank Transfer.',

    // SMS Gateway
    SMS_PROVIDER: 'GREENWEB',
    SMS_API_KEY: '',
    SMS_SENDER_ID: 'SkinCareBD',
    SMS_ORDER_PLACED_ENABLED: 'true',
    SMS_ORDER_SHIPPED_ENABLED: 'true',

    // Email & SMTP
    SMTP_HOST: '',
    SMTP_PORT: '587',
    SMTP_USER: '',
    SMTP_PASS: '',
    SMTP_FROM: '',
    ADMIN_NOTIFICATION_EMAIL: '',

    // Analytics & Pixels
    GA4_MEASUREMENT_ID: '',
    FB_PIXEL_ID: '',
    FB_CONVERSIONS_API_TOKEN: '',
    GTM_CONTAINER_ID: '',

    // Cloudinary Storage
    CLOUDINARY_CLOUD_NAME: '',
    CLOUDINARY_API_KEY: '',
    CLOUDINARY_API_SECRET: '',

    // Google OAuth
    GOOGLE_CLIENT_ID: '',
    GOOGLE_CLIENT_SECRET: '',
  });

  // Fetch Existing Settings
  const { data: serverSettings, isLoading, refetch } = useQuery({
    queryKey: ['admin-integrations-settings'],
    queryFn: () => adminService.getIntegrationSettings(),
  });

  useEffect(() => {
    if (serverSettings) {
      setFormData((prev) => ({
        ...prev,
        ...serverSettings,
      }));
    }
  }, [serverSettings]);

  const [saveError, setSaveError] = useState<string | null>(null);

  // Batch Save Mutation
  const saveMutation = useMutation({
    mutationFn: (settings: Array<{ key: string; value: string; group?: string }>) =>
      adminService.updateStoreSettingsBatch(settings),
    onSuccess: () => {
      setSaveSuccess(true);
      setSaveError(null);
      setTimeout(() => setSaveSuccess(false), 4000);
      queryClient.invalidateQueries({ queryKey: ['admin-integrations-settings'] });
      queryClient.invalidateQueries({ queryKey: ['admin-store-settings'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'Failed to save settings';
      setSaveError(msg);
      setTimeout(() => setSaveError(null), 6000);
    },
  });

  // Test Email Mutation
  const testEmailMutation = useMutation({
    mutationFn: (email: string) => adminService.testEmailConnection(email),
    onSuccess: (data: any) => {
      setTestEmailStatus({ type: 'success', message: data?.message || 'Verification test email sent successfully!' });
    },
    onError: (err: any) => {
      setTestEmailStatus({ type: 'error', message: err.message || 'SMTP Connection test failed' });
    },
  });

  // Test SMS Mutation
  const testSmsMutation = useMutation({
    mutationFn: (phone: string) => adminService.testSmsConnection(phone),
    onSuccess: (data: any) => {
      setTestSmsStatus({ type: 'success', message: data?.message || 'Test SMS dispatched successfully!' });
    },
    onError: (err: any) => {
      setTestSmsStatus({ type: 'error', message: err.message || 'SMS Gateway test failed' });
    },
  });

  // Test Courier Mutation
  const testCourierMutation = useMutation({
    mutationFn: (courier: string) => adminService.testCourierConnection(courier),
    onSuccess: (data: any) => {
      setTestCourierStatus({ type: 'success', message: data?.message || 'Courier API connection verified!' });
    },
    onError: (err: any) => {
      setTestCourierStatus({ type: 'error', message: err.message || 'Courier API ping failed' });
    },
  });

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getGroup = (key: string): string => {
    if (key.startsWith('STEADFAST_') || key.startsWith('PATHAO_')) return 'COURIER';
    if (key.startsWith('BKASH_') || key.startsWith('SSLCOMMERZ_') || key.startsWith('NAGAD_') || key.includes('COD') || key.includes('MANUAL')) return 'PAYMENT';
    if (key.startsWith('SMS_')) return 'SMS';
    if (key.startsWith('SMTP_') || key.includes('EMAIL')) return 'SMTP';
    if (key.includes('GA4_') || key.includes('FB_') || key.includes('GTM_')) return 'ANALYTICS';
    if (key.startsWith('CLOUDINARY_')) return 'STORAGE';
    if (key.startsWith('GOOGLE_')) return 'AUTH';
    return 'GENERAL';
  };

  const handleSaveAll = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaveError(null);

    const batch = Object.entries(formData)
      .filter(([key]) => key && typeof key === 'string' && key.trim().length > 0)
      .map(([key, value]) => ({
        key: key.trim(),
        value: value !== undefined && value !== null ? String(value) : '',
        group: getGroup(key),
      }));

    if (batch.length === 0) return;
    saveMutation.mutate(batch);
  };

  const handleSaveCurrentTab = () => {
    setSaveError(null);
    let targetPrefixes: string[] = [];
    if (activeTab === 'courier') targetPrefixes = ['STEADFAST_', 'PATHAO_'];
    else if (activeTab === 'payments') targetPrefixes = ['BKASH_', 'SSLCOMMERZ_', 'NAGAD_', 'COD_', 'MANUAL_'];
    else if (activeTab === 'sms') targetPrefixes = ['SMS_'];
    else if (activeTab === 'email') targetPrefixes = ['SMTP_', 'ADMIN_NOTIFICATION_EMAIL'];
    else if (activeTab === 'analytics') targetPrefixes = ['GA4_', 'FB_', 'GTM_'];
    else if (activeTab === 'storage') targetPrefixes = ['CLOUDINARY_'];
    else if (activeTab === 'auth') targetPrefixes = ['GOOGLE_'];

    const batch = Object.entries(formData)
      .filter(([key]) => targetPrefixes.some((prefix) => key.startsWith(prefix) || key.includes(prefix)))
      .map(([key, value]) => ({
        key: key.trim(),
        value: value !== undefined && value !== null ? String(value) : '',
        group: getGroup(key),
      }));

    if (batch.length > 0) {
      saveMutation.mutate(batch);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 p-6 rounded-3xl shadow-xl backdrop-blur">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <KeyRound size={22} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                API Keys &amp; Third-Party Providers Hub
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Paste live API keys, secrets &amp; merchant credentials. Features activate immediately without code changes.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isLoading}
            className="p-2.5 bg-slate-950 border border-slate-800 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            title="Reload server settings"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin text-emerald-400' : ''} />
          </button>

          <button
            type="button"
            onClick={handleSaveCurrentTab}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
            title="Save only credentials in the current active tab"
          >
            <Check size={14} />
            <span>Save This Tab</span>
          </button>

          <button
            type="button"
            onClick={() => handleSaveAll()}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-950/50 transition-all disabled:opacity-50"
          >
            <Save size={15} />
            <span>{saveMutation.isPending ? 'Saving All Credentials...' : 'Save All API Keys'}</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3 text-xs text-emerald-400 animate-in fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <div>
            <p className="font-bold">Third-party integrations successfully updated and cached!</p>
            <p className="text-[11px] text-emerald-400/80">Couriers, Payment Gateways, SMS triggers, and Analytics are now using these live credentials.</p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-center gap-3 text-xs text-rose-400 animate-in fade-in">
          <AlertCircle size={18} className="shrink-0" />
          <div>
            <p className="font-bold">Save Error</p>
            <p className="text-[11px] text-rose-400/90">{saveError}</p>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto custom-scrollbar">
        {[
          { key: 'courier', label: 'Courier & Logistics', icon: Truck, count: 'SteadFast + Pathao' },
          { key: 'payments', label: 'Payment Gateways', icon: CreditCard, count: 'bKash, SSLC, Nagad' },
          { key: 'sms', label: 'Bangladesh SMS', icon: Smartphone, count: 'Greenweb, BulkSMS' },
          { key: 'email', label: 'Email & SMTP', icon: Mail, count: 'Nodemailer SMTP' },
          { key: 'analytics', label: 'Marketing & Pixels', icon: Sparkles, count: 'FB Pixel & GA4' },
          { key: 'storage', label: 'Media & Storage', icon: Cloud, count: 'Cloudinary CDN' },
          { key: 'auth', label: 'Google OAuth', icon: Lock, count: 'Social Sign-In' },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-950/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 1. COURIER LOGISTICS (Steadfast & Pathao) */}
      {/* ========================================================================= */}
      {activeTab === 'courier' && (
        <div className="space-y-6">
          {/* Steadfast Courier Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                  SF
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    SteadFast Courier API
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono">
                      Official Dispatch API
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Automates consignment creation, pickup orders, and tracking in Bangladesh.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={testCourierMutation.isPending}
                  onClick={() => testCourierMutation.mutate('Steadfast')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-emerald-400 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Activity size={13} />
                  <span>{testCourierMutation.isPending ? 'Pinging API...' : 'Test Steadfast Connection'}</span>
                </button>
              </div>
            </div>

            {testCourierStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testCourierStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {testCourierStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{testCourierStatus.message}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Steadfast API Key *</label>
                <div className="relative">
                  <input
                    type={showSecrets['STEADFAST_API_KEY'] ? 'text' : 'password'}
                    value={formData.STEADFAST_API_KEY}
                    onChange={(e) => handleInputChange('STEADFAST_API_KEY', e.target.value)}
                    placeholder="Enter SteadFast API Key"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('STEADFAST_API_KEY')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecrets['STEADFAST_API_KEY'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Steadfast Secret Key *</label>
                <div className="relative">
                  <input
                    type={showSecrets['STEADFAST_SECRET_KEY'] ? 'text' : 'password'}
                    value={formData.STEADFAST_SECRET_KEY}
                    onChange={(e) => handleInputChange('STEADFAST_SECRET_KEY', e.target.value)}
                    placeholder="Enter SteadFast Secret Key"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('STEADFAST_SECRET_KEY')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecrets['STEADFAST_SECRET_KEY'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">Steadfast Base URL Endpoint</label>
                <input
                  type="text"
                  value={formData.STEADFAST_BASE_URL}
                  onChange={(e) => handleInputChange('STEADFAST_BASE_URL', e.target.value)}
                  placeholder="https://portal.packzy.com/api/v1"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Pathao Logistics Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center font-bold">
                  PT
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    Pathao Logistics Courier API (OAuth2)
                    <span className="px-2 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-mono">
                      Hermes Logistics API
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Automated doorstep parcel pickup and delivery across all 64 districts in Bangladesh.</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={testCourierMutation.isPending}
                  onClick={() => testCourierMutation.mutate('Pathao')}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-red-400 rounded-xl text-xs font-semibold transition-colors"
                >
                  <Activity size={13} />
                  <span>{testCourierMutation.isPending ? 'Pinging API...' : 'Test Pathao Connection'}</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pathao Client ID *</label>
                <input
                  type="text"
                  value={formData.PATHAO_CLIENT_ID}
                  onChange={(e) => handleInputChange('PATHAO_CLIENT_ID', e.target.value)}
                  placeholder="Paste Pathao Client ID"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pathao Client Secret *</label>
                <div className="relative">
                  <input
                    type={showSecrets['PATHAO_CLIENT_SECRET'] ? 'text' : 'password'}
                    value={formData.PATHAO_CLIENT_SECRET}
                    onChange={(e) => handleInputChange('PATHAO_CLIENT_SECRET', e.target.value)}
                    placeholder="Paste Pathao Client Secret"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('PATHAO_CLIENT_SECRET')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecrets['PATHAO_CLIENT_SECRET'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pathao Account Username / Email *</label>
                <input
                  type="text"
                  value={formData.PATHAO_USERNAME}
                  onChange={(e) => handleInputChange('PATHAO_USERNAME', e.target.value)}
                  placeholder="e.g. merchant@skincare.com.bd"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pathao Account Password *</label>
                <div className="relative">
                  <input
                    type={showSecrets['PATHAO_PASSWORD'] ? 'text' : 'password'}
                    value={formData.PATHAO_PASSWORD}
                    onChange={(e) => handleInputChange('PATHAO_PASSWORD', e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-red-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('PATHAO_PASSWORD')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecrets['PATHAO_PASSWORD'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pathao Store ID (Optional)</label>
                <input
                  type="text"
                  value={formData.PATHAO_STORE_ID}
                  onChange={(e) => handleInputChange('PATHAO_STORE_ID', e.target.value)}
                  placeholder="e.g. 12948"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Pathao API Base URL</label>
                <input
                  type="text"
                  value={formData.PATHAO_BASE_URL}
                  onChange={(e) => handleInputChange('PATHAO_BASE_URL', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. PAYMENT GATEWAYS */}
      {/* ========================================================================= */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* bKash Tokenized Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 text-pink-400 flex items-center justify-center font-bold">
                  bK
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    bKash Tokenized Checkout Payment Gateway
                    <span className="px-2 py-0.5 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[10px] font-mono">
                      Tokenized v1.2.0
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Official Direct Checkout API for bKash Bangladesh mobile wallet payments.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">bKash App Key *</label>
                <input
                  type="text"
                  value={formData.BKASH_APP_KEY}
                  onChange={(e) => handleInputChange('BKASH_APP_KEY', e.target.value)}
                  placeholder="Paste bKash App Key"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">bKash App Secret *</label>
                <div className="relative">
                  <input
                    type={showSecrets['BKASH_APP_SECRET'] ? 'text' : 'password'}
                    value={formData.BKASH_APP_SECRET}
                    onChange={(e) => handleInputChange('BKASH_APP_SECRET', e.target.value)}
                    placeholder="Paste bKash App Secret"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('BKASH_APP_SECRET')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecrets['BKASH_APP_SECRET'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">bKash Merchant Username *</label>
                <input
                  type="text"
                  value={formData.BKASH_USERNAME}
                  onChange={(e) => handleInputChange('BKASH_USERNAME', e.target.value)}
                  placeholder="bKash Merchant Username"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">bKash Merchant Password *</label>
                <div className="relative">
                  <input
                    type={showSecrets['BKASH_PASSWORD'] ? 'text' : 'password'}
                    value={formData.BKASH_PASSWORD}
                    onChange={(e) => handleInputChange('BKASH_PASSWORD', e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-pink-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('BKASH_PASSWORD')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecrets['BKASH_PASSWORD'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-400 font-semibold mb-1">bKash Base URL (Sandbox vs Live Production)</label>
                <input
                  type="text"
                  value={formData.BKASH_BASE_URL}
                  onChange={(e) => handleInputChange('BKASH_BASE_URL', e.target.value)}
                  placeholder="https://tokenized.sandbox.bka.sh/v1.2.0-beta or https://tokenized.pay.bka.sh/v1.2.0-beta"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>
          </div>

          {/* SSLCOMMERZ Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                  SSL
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                    SSLCOMMERZ Session Gateway (v4)
                    <span className="px-2 py-0.5 rounded-md bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-mono">
                      Cards, MFS &amp; Internet Banking
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Supports Visa, MasterCard, Amex, Nagad, Rocket, Upay, and 30+ BD banks.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">SSLCOMMERZ Store ID *</label>
                <input
                  type="text"
                  value={formData.SSLCOMMERZ_STORE_ID}
                  onChange={(e) => handleInputChange('SSLCOMMERZ_STORE_ID', e.target.value)}
                  placeholder="e.g. skinc6508abcd"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">SSLCOMMERZ Store Password *</label>
                <div className="relative">
                  <input
                    type={showSecrets['SSLCOMMERZ_STORE_PASSWORD'] ? 'text' : 'password'}
                    value={formData.SSLCOMMERZ_STORE_PASSWORD}
                    onChange={(e) => handleInputChange('SSLCOMMERZ_STORE_PASSWORD', e.target.value)}
                    placeholder="Enter Store Password"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => toggleSecret('SSLCOMMERZ_STORE_PASSWORD')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showSecrets['SSLCOMMERZ_STORE_PASSWORD'] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Sandbox Test Mode</label>
                <select
                  value={formData.SSLCOMMERZ_IS_SANDBOX}
                  onChange={(e) => handleInputChange('SSLCOMMERZ_IS_SANDBOX', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500"
                >
                  <option value="true">Sandbox (Test Mode - sandbox.sslcommerz.com)</option>
                  <option value="false">Live Production (securepay.sslcommerz.com)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Cash on Delivery & Manual Transfer */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <ShieldCheck size={16} className="text-emerald-400" />
              Cash on Delivery &amp; Manual Bank/MFS Deposit
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Cash on Delivery (COD) Status</label>
                <select
                  value={formData.COD_ENABLED}
                  onChange={(e) => handleInputChange('COD_ENABLED', e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="true">Enabled across Bangladesh</option>
                  <option value="false">Disabled</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Manual Transfer Instructions</label>
                <input
                  type="text"
                  value={formData.MANUAL_PAYMENT_INSTRUCTIONS}
                  onChange={(e) => handleInputChange('MANUAL_PAYMENT_INSTRUCTIONS', e.target.value)}
                  placeholder="e.g. bKash Personal 01711223344 (Send Money) with Order #"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. BANGLADESH SMS GATEWAYS */}
      {/* ========================================================================= */}
      {activeTab === 'sms' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Smartphone size={20} />
              </div>
              <div>
                <h3 className="font-bold text-slate-100 text-sm">
                  Bangladesh SMS Gateway Provider
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Automated transactional SMS notifications for order confirmations &amp; courier dispatch.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">SMS Provider Gateway *</label>
              <select
                value={formData.SMS_PROVIDER}
                onChange={(e) => handleInputChange('SMS_PROVIDER', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
              >
                <option value="GREENWEB">Greenweb BD Gateway (api.greenweb.com.bd)</option>
                <option value="BULKSMSBD">BulkSMSBD Gateway (bulksmsbd.net)</option>
                <option value="MIM_SMS">Mim SMS Gateway (mimsms.com)</option>
                <option value="ALPHA_SMS">Alpha SMS Bangladesh</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">SMS API Token / Key *</label>
              <div className="relative">
                <input
                  type={showSecrets['SMS_API_KEY'] ? 'text' : 'password'}
                  value={formData.SMS_API_KEY}
                  onChange={(e) => handleInputChange('SMS_API_KEY', e.target.value)}
                  placeholder="Paste SMS Gateway API Token"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('SMS_API_KEY')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showSecrets['SMS_API_KEY'] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Approved Brand / Sender ID *</label>
              <input
                type="text"
                value={formData.SMS_SENDER_ID}
                onChange={(e) => handleInputChange('SMS_SENDER_ID', e.target.value)}
                placeholder="e.g. SkinCareBD or 8809612..."
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Test SMS Dispatcher */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Live SMS Test Tool (Verify Credentials)
            </h4>

            {testSmsStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testSmsStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {testSmsStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{testSmsStatus.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="Enter BD Phone Number (e.g. 01711223344)"
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                disabled={testSmsMutation.isPending || !testPhone.trim()}
                onClick={() => testSmsMutation.mutate(testPhone.trim())}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Send size={13} />
                <span>{testSmsMutation.isPending ? 'Dispatching...' : 'Send Live Test SMS'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. EMAIL & SMTP GATEWAY */}
      {/* ========================================================================= */}
      {activeTab === 'email' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <Mail size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                SMTP Email Gateway (Nodemailer)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Sends branded HTML order receipts to customers and alerts to administrators.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">SMTP Host Server *</label>
              <input
                type="text"
                value={formData.SMTP_HOST}
                onChange={(e) => handleInputChange('SMTP_HOST', e.target.value)}
                placeholder="e.g. smtp.gmail.com or smtp.mailgun.org"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">SMTP Port (587 TLS / 465 SSL) *</label>
              <input
                type="text"
                value={formData.SMTP_PORT}
                onChange={(e) => handleInputChange('SMTP_PORT', e.target.value)}
                placeholder="587"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">SMTP Username / Email *</label>
              <input
                type="text"
                value={formData.SMTP_USER}
                onChange={(e) => handleInputChange('SMTP_USER', e.target.value)}
                placeholder="e.g. orders@skincare.com.bd"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">SMTP Password / App Password *</label>
              <div className="relative">
                <input
                  type={showSecrets['SMTP_PASS'] ? 'text' : 'password'}
                  value={formData.SMTP_PASS}
                  onChange={(e) => handleInputChange('SMTP_PASS', e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('SMTP_PASS')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showSecrets['SMTP_PASS'] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Sender Email / From Header</label>
              <input
                type="text"
                value={formData.SMTP_FROM}
                onChange={(e) => handleInputChange('SMTP_FROM', e.target.value)}
                placeholder='Skincare Bangladesh <orders@skincare.com.bd>'
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Admin Notification Recipient Email</label>
              <input
                type="email"
                value={formData.ADMIN_NOTIFICATION_EMAIL}
                onChange={(e) => handleInputChange('ADMIN_NOTIFICATION_EMAIL', e.target.value)}
                placeholder="admin@skincare.com.bd"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Test Email Dispatcher */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Live SMTP Verification Tool (Send Test Email)
            </h4>

            {testEmailStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testEmailStatus.type === 'success'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {testEmailStatus.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                <span>{testEmailStatus.message}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="Enter recipient email (e.g. yourname@gmail.com)"
                className="flex-1 bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-blue-500"
              />
              <button
                type="button"
                disabled={testEmailMutation.isPending || !testEmail.trim()}
                onClick={() => testEmailMutation.mutate(testEmail.trim())}
                className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
              >
                <Send size={13} />
                <span>{testEmailMutation.isPending ? 'Sending...' : 'Send Test Email'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MARKETING & TRACKING PIXELS */}
      {/* ========================================================================= */}
      {activeTab === 'analytics' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Facebook Pixel, Google Analytics 4 &amp; GTM DataLayer
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Injected dynamically on customer storefront. Automatically tracks ViewItem, AddToCart, BeginCheckout, and Purchase.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Google Analytics 4 Measurement ID</label>
              <input
                type="text"
                value={formData.GA4_MEASUREMENT_ID}
                onChange={(e) => handleInputChange('GA4_MEASUREMENT_ID', e.target.value)}
                placeholder="e.g. G-XXXXXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Facebook Pixel ID</label>
              <input
                type="text"
                value={formData.FB_PIXEL_ID}
                onChange={(e) => handleInputChange('FB_PIXEL_ID', e.target.value)}
                placeholder="e.g. 987654321012345"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Facebook Conversion API (CAPI) Token</label>
              <div className="relative">
                <input
                  type={showSecrets['FB_CONVERSIONS_API_TOKEN'] ? 'text' : 'password'}
                  value={formData.FB_CONVERSIONS_API_TOKEN}
                  onChange={(e) => handleInputChange('FB_CONVERSIONS_API_TOKEN', e.target.value)}
                  placeholder="Paste Meta Access Token"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-purple-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('FB_CONVERSIONS_API_TOKEN')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showSecrets['FB_CONVERSIONS_API_TOKEN'] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Google Tag Manager (GTM) Container ID</label>
              <input
                type="text"
                value={formData.GTM_CONTAINER_ID}
                onChange={(e) => handleInputChange('GTM_CONTAINER_ID', e.target.value)}
                placeholder="e.g. GTM-XXXXXXX"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. MEDIA & CLOUDINARY STORAGE */}
      {/* ========================================================================= */}
      {activeTab === 'storage' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
              <Cloud size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Cloudinary Media Storage &amp; CDN
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">High-speed global CDN for product photos, customer review attachments, and banners.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cloudinary Cloud Name *</label>
              <input
                type="text"
                value={formData.CLOUDINARY_CLOUD_NAME}
                onChange={(e) => handleInputChange('CLOUDINARY_CLOUD_NAME', e.target.value)}
                placeholder="e.g. dxyz12345"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cloudinary API Key *</label>
              <input
                type="text"
                value={formData.CLOUDINARY_API_KEY}
                onChange={(e) => handleInputChange('CLOUDINARY_API_KEY', e.target.value)}
                placeholder="Paste API Key"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Cloudinary API Secret *</label>
              <div className="relative">
                <input
                  type={showSecrets['CLOUDINARY_API_SECRET'] ? 'text' : 'password'}
                  value={formData.CLOUDINARY_API_SECRET}
                  onChange={(e) => handleInputChange('CLOUDINARY_API_SECRET', e.target.value)}
                  placeholder="Paste API Secret"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-cyan-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('CLOUDINARY_API_SECRET')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showSecrets['CLOUDINARY_API_SECRET'] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. GOOGLE OAUTH & SOCIAL LOGIN */}
      {/* ========================================================================= */}
      {activeTab === 'auth' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="font-bold text-slate-100 text-sm">
                Google OAuth 2.0 Social Sign-In
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Allows 1-click Google account login on customer checkout and account portals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Google Client ID *</label>
              <input
                type="text"
                value={formData.GOOGLE_CLIENT_ID}
                onChange={(e) => handleInputChange('GOOGLE_CLIENT_ID', e.target.value)}
                placeholder="e.g. 1234567890-xxx.apps.googleusercontent.com"
                className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Google Client Secret *</label>
              <div className="relative">
                <input
                  type={showSecrets['GOOGLE_CLIENT_SECRET'] ? 'text' : 'password'}
                  value={formData.GOOGLE_CLIENT_SECRET}
                  onChange={(e) => handleInputChange('GOOGLE_CLIENT_SECRET', e.target.value)}
                  placeholder="Paste Google Client Secret"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl font-mono text-xs focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={() => toggleSecret('GOOGLE_CLIENT_SECRET')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showSecrets['GOOGLE_CLIENT_SECRET'] ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl text-xs space-y-2 text-slate-400">
            <span className="font-semibold text-slate-200">Authorized Redirect URIs to configure in Google Cloud Console:</span>
            <div className="space-y-1 font-mono text-[11px] text-emerald-400">
              <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>https://skin-care-client.vercel.app</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://skin-care-client.vercel.app', 'uri1')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === 'uri1' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
              <div className="flex items-center justify-between bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                <span>https://skincare-backend-api-wifp.onrender.com/api/auth/google/callback</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard('https://skincare-backend-api-wifp.onrender.com/api/auth/google/callback', 'uri2')}
                  className="text-slate-400 hover:text-white"
                >
                  {copiedKey === 'uri2' ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
