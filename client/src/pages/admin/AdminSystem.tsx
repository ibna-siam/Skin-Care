import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/authStore';
import {
  Sliders,
  Users,
  Shield,
  History,
  Save,
  CheckCircle2,
  Lock,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  UserCheck,
  Building,
  Mail,
  Phone,
  DollarSign,
  Truck,
  Sparkles,
  KeyRound,
  Eye,
  EyeOff,
  LogOut,
  Laptop,
} from 'lucide-react';

export const AdminSystem: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user: currentAdmin, logout } = useAuthStore();

  // Determine active tab from URL path
  const getActiveTabFromPath = () => {
    const path = location.pathname;
    if (path.includes('/security')) return 'security';
    if (path.includes('/ip-blocker')) return 'ip_blocker';
    if (path.includes('/users')) return 'users';
    if (path.includes('/activity-logs')) return 'logs';
    return 'settings';
  };

  const [activeTab, setActiveTab] = useState<'settings' | 'security' | 'ip_blocker' | 'users' | 'logs'>(getActiveTabFromPath());

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    setActiveTab(getActiveTabFromPath());
  }, [location.pathname]);

  const handleTabChange = (tab: 'settings' | 'security' | 'ip_blocker' | 'users' | 'logs') => {
    setActiveTab(tab);
    if (tab === 'settings') navigate('/admin/settings');
    else if (tab === 'security') navigate('/admin/settings?tab=security');
    else if (tab === 'ip_blocker') navigate('/admin/settings?tab=ip_blocker');
    else if (tab === 'users') navigate('/admin/system/users');
    else navigate('/admin/system/activity-logs');
  };

  // State for Store Settings
  const [storeName, setStoreName] = useState('Skincare Bangladesh');
  const [supportPhone, setSupportPhone] = useState('+880 1711-223344');
  const [supportEmail, setSupportEmail] = useState('support@skincare.com.bd');
  const [storeAddress, setStoreAddress] = useState('House 42, Road 11, Banani, Dhaka-1213, Bangladesh');
  const [storeLogoUrl, setStoreLogoUrl] = useState('https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400');
  const [facebookUrl, setFacebookUrl] = useState('https://facebook.com/skincarebd');
  const [instagramUrl, setInstagramUrl] = useState('https://instagram.com/skincarebd');
  const [whatsappNumber, setWhatsappNumber] = useState('+8801711223344');
  const [ga4Id, setGa4Id] = useState('G-SKINCAREBD123');
  const [fbPixelId, setFbPixelId] = useState('987654321012345');
  const [steadfastApiKey, setSteadfastApiKey] = useState('');
  const [steadfastSecretKey, setSteadfastSecretKey] = useState('');
  const [pathaoClientId, setPathaoClientId] = useState('');
  const [pathaoClientSecret, setPathaoClientSecret] = useState('');
  const [smsProvider, setSmsProvider] = useState('GREENWEB');
  const [smsApiKey, setSmsApiKey] = useState('');
  const [dhakaShipping, setDhakaShipping] = useState('60');
  const [outsideDhakaShipping, setOutsideDhakaShipping] = useState('120');
  const [freeShippingThreshold, setFreeShippingThreshold] = useState('2000');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // IP Blocker State
  const [newBlockedIp, setNewBlockedIp] = useState('');
  const [blockedReason, setBlockedReason] = useState('');
  const [isAddIpOpen, setIsAddIpOpen] = useState(false);

  // Fetch Store Settings from DB
  const { data: storeSettingsList = [] } = useQuery({
    queryKey: ['admin-store-settings'],
    queryFn: () => adminService.getStoreSettings(),
  });

  useEffect(() => {
    if (storeSettingsList && storeSettingsList.length > 0) {
      const map: Record<string, string> = {};
      storeSettingsList.forEach((s: any) => { map[s.key] = s.value; });
      if (map['STORE_NAME']) setStoreName(map['STORE_NAME']);
      if (map['STORE_LOGO_URL']) setStoreLogoUrl(map['STORE_LOGO_URL']);
      if (map['SUPPORT_PHONE']) setSupportPhone(map['SUPPORT_PHONE']);
      if (map['SUPPORT_EMAIL']) setSupportEmail(map['SUPPORT_EMAIL']);
      if (map['STORE_ADDRESS']) setStoreAddress(map['STORE_ADDRESS']);
      if (map['FACEBOOK_URL']) setFacebookUrl(map['FACEBOOK_URL']);
      if (map['INSTAGRAM_URL']) setInstagramUrl(map['INSTAGRAM_URL']);
      if (map['WHATSAPP_NUMBER']) setWhatsappNumber(map['WHATSAPP_NUMBER']);
      if (map['GA4_MEASUREMENT_ID']) setGa4Id(map['GA4_MEASUREMENT_ID']);
      if (map['FB_PIXEL_ID']) setFbPixelId(map['FB_PIXEL_ID']);
      if (map['STEADFAST_API_KEY']) setSteadfastApiKey(map['STEADFAST_API_KEY']);
      if (map['STEADFAST_SECRET_KEY']) setSteadfastSecretKey(map['STEADFAST_SECRET_KEY']);
      if (map['PATHAO_CLIENT_ID']) setPathaoClientId(map['PATHAO_CLIENT_ID']);
      if (map['PATHAO_CLIENT_SECRET']) setPathaoClientSecret(map['PATHAO_CLIENT_SECRET']);
      if (map['SMS_PROVIDER']) setSmsProvider(map['SMS_PROVIDER']);
      if (map['SMS_API_KEY']) setSmsApiKey(map['SMS_API_KEY']);
      if (map['delivery_dhaka']) setDhakaShipping(map['delivery_dhaka']);
      if (map['delivery_outside']) setOutsideDhakaShipping(map['delivery_outside']);
      if (map['free_shipping_threshold']) setFreeShippingThreshold(map['free_shipping_threshold']);
    }
  }, [storeSettingsList]);

  // Fetch Blocked IPs
  const { data: blockedIPs = [], refetch: refetchBlockedIPs } = useQuery({
    queryKey: ['admin-blocked-ips'],
    queryFn: () => adminService.getBlockedIPs(),
    enabled: activeTab === 'ip_blocker' || activeTab === 'security',
  });

  // Fetch Users
  const { data: users = [], isLoading: isLoadingUsers, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminService.getUsers(),
  });

  // Fetch Activity Logs
  const { data: logs = [], isLoading: isLoadingLogs, refetch: refetchLogs } = useQuery({
    queryKey: ['admin-activity-logs'],
    queryFn: () => adminService.getActivityLogs(),
  });

  // Batch Settings Mutation
  const batchSettingsMutation = useMutation({
    mutationFn: (settings: any[]) => adminService.updateStoreSettingsBatch(settings),
    onSuccess: () => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  // IP Block Mutations
  const addIpMutation = useMutation({
    mutationFn: (data: { ipAddress: string; reason?: string }) => adminService.addBlockedIP(data.ipAddress, data.reason),
    onSuccess: () => {
      setNewBlockedIp('');
      setBlockedReason('');
      setIsAddIpOpen(false);
      refetchBlockedIPs();
    },
  });

  const toggleIpMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) => adminService.toggleBlockedIP(id, isActive),
    onSuccess: () => refetchBlockedIPs(),
  });

  const deleteIpMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBlockedIP(id),
    onSuccess: () => refetchBlockedIPs(),
  });

  // Role Mutation
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      adminService.updateUserRole(id, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      alert('User role updated successfully!');
    },
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    batchSettingsMutation.mutate([
      { key: 'STORE_NAME', value: storeName, group: 'GENERAL' },
      { key: 'STORE_LOGO_URL', value: storeLogoUrl, group: 'GENERAL' },
      { key: 'SUPPORT_PHONE', value: supportPhone, group: 'GENERAL' },
      { key: 'SUPPORT_EMAIL', value: supportEmail, group: 'GENERAL' },
      { key: 'STORE_ADDRESS', value: storeAddress, group: 'GENERAL' },
      { key: 'FACEBOOK_URL', value: facebookUrl, group: 'GENERAL' },
      { key: 'INSTAGRAM_URL', value: instagramUrl, group: 'GENERAL' },
      { key: 'WHATSAPP_NUMBER', value: whatsappNumber, group: 'GENERAL' },
      { key: 'GA4_MEASUREMENT_ID', value: ga4Id, group: 'ANALYTICS' },
      { key: 'FB_PIXEL_ID', value: fbPixelId, group: 'ANALYTICS' },
      { key: 'STEADFAST_API_KEY', value: steadfastApiKey, group: 'COURIER' },
      { key: 'STEADFAST_SECRET_KEY', value: steadfastSecretKey, group: 'COURIER' },
      { key: 'PATHAO_CLIENT_ID', value: pathaoClientId, group: 'COURIER' },
      { key: 'PATHAO_CLIENT_SECRET', value: pathaoClientSecret, group: 'COURIER' },
      { key: 'SMS_PROVIDER', value: smsProvider, group: 'SMS' },
      { key: 'SMS_API_KEY', value: smsApiKey, group: 'SMS' },
      { key: 'delivery_dhaka', value: dhakaShipping, group: 'SHIPPING' },
      { key: 'delivery_outside', value: outsideDhakaShipping, group: 'SHIPPING' },
      { key: 'free_shipping_threshold', value: freeShippingThreshold, group: 'SHIPPING' },
    ]);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (!currentPassword) {
      setPasswordStatus({ type: 'error', message: 'Current password is required.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordStatus({ type: 'error', message: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      setPasswordStatus({ type: 'success', message: 'Administrator security password updated successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordStatus({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update password. Please check your current password.',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const sampleAuditLogs = logs.length > 0 ? logs : [
    {
      id: 'log-1',
      adminName: 'Super Administrator',
      action: 'UPDATE',
      entity: 'STORE_SETTINGS',
      details: 'Updated standard delivery rates for Dhaka Metro and Outside Dhaka.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'log-2',
      adminName: 'Super Administrator',
      action: 'CREATE',
      entity: 'CAMPAIGN',
      details: 'Deployed marketing campaign "Korean Sunscreen Glow Drop" with voucher SUN20.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'log-3',
      adminName: 'Inventory Staff',
      action: 'UPDATE',
      entity: 'PRODUCT_STOCK',
      details: 'Replenished COSRX Snail Mucin (+50 units). Back-in-stock alerts dispatched.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'log-4',
      adminName: 'Order Manager',
      action: 'STATUS_CHANGE',
      entity: 'ORDER',
      details: 'Batch marked 14 orders as SHIPPED with Steadfast tracking IDs.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Sliders size={24} className="text-emerald-400" />
            System Administration, Security &amp; RBAC
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store configuration settings, security credentials, administrator roles &amp; permissions, and audit logs.
          </p>
        </div>

        <button
          onClick={() => {
            if (activeTab === 'users') refetchUsers();
            else if (activeTab === 'logs') refetchLogs();
          }}
          className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors self-start sm:self-auto"
          title="Refresh"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => handleTabChange('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Sliders size={14} />
          <span>Store Settings &amp; Integrations</span>
        </button>

        <button
          onClick={() => handleTabChange('ip_blocker')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'ip_blocker'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Shield size={14} />
          <span>IP Blocking &amp; Firewall</span>
        </button>

        <button
          onClick={() => handleTabChange('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'security'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <KeyRound size={14} />
          <span>Admin Security</span>
        </button>

        <button
          onClick={() => handleTabChange('users')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <Users size={14} />
          <span>Users &amp; Staff Roles (RBAC)</span>
        </button>

        <button
          onClick={() => handleTabChange('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeTab === 'logs'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
        >
          <History size={14} />
          <span>Activity Audit Logs</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: STORE SETTINGS & INTEGRATIONS */}
      {/* ========================================================================= */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl text-xs">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Building size={16} className="text-emerald-400" />
              General Brand, Channels &amp; API Credentials
            </h3>
            {saveSuccess && (
              <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} /> Store Configurations Saved!
              </span>
            )}
          </div>

          <div className="space-y-5">
            {/* Section 1: Store Brand Info */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                1. Store Brand &amp; Contact Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Store Legal Name</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Store Logo URL</label>
                  <input
                    type="text"
                    value={storeLogoUrl}
                    onChange={(e) => setStoreLogoUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Customer Support Phone</label>
                  <input
                    type="text"
                    value={supportPhone}
                    onChange={(e) => setSupportPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Support Email Address</label>
                  <input
                    type="email"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Physical Store / Registered Office Address</label>
                  <input
                    type="text"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Social Media & WhatsApp */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                2. Social Channels &amp; WhatsApp Direct Support
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Facebook Page URL</label>
                  <input
                    type="text"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="https://facebook.com/..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Instagram URL</label>
                  <input
                    type="text"
                    value={instagramUrl}
                    onChange={(e) => setInstagramUrl(e.target.value)}
                    placeholder="https://instagram.com/..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">WhatsApp Hotline (+880...)</label>
                  <input
                    type="text"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    placeholder="+8801700000000"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Facebook Pixel & GA4 Analytics */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                <Sparkles size={14} className="text-amber-400" />
                3. Facebook Pixel &amp; Google Analytics 4 (Zero-Code Dynamic Tracking)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">GA4 Measurement ID (G-XXXXXXXX)</label>
                  <input
                    type="text"
                    value={ga4Id}
                    onChange={(e) => setGa4Id(e.target.value)}
                    placeholder="e.g. G-SKINCAREBD123"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={fbPixelId}
                    onChange={(e) => setFbPixelId(e.target.value)}
                    placeholder="e.g. 987654321012345"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 4: Courier API Credentials */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                <Truck size={14} className="text-blue-400" />
                4. Steadfast &amp; Pathao Courier API Keys
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Steadfast API Key</label>
                  <input
                    type="password"
                    value={steadfastApiKey}
                    onChange={(e) => setSteadfastApiKey(e.target.value)}
                    placeholder="Paste Steadfast API Key"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Steadfast Secret Key</label>
                  <input
                    type="password"
                    value={steadfastSecretKey}
                    onChange={(e) => setSteadfastSecretKey(e.target.value)}
                    placeholder="Paste Steadfast Secret Key"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Pathao Client ID</label>
                  <input
                    type="text"
                    value={pathaoClientId}
                    onChange={(e) => setPathaoClientId(e.target.value)}
                    placeholder="Pathao OAuth Client ID"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Pathao Client Secret</label>
                  <input
                    type="password"
                    value={pathaoClientSecret}
                    onChange={(e) => setPathaoClientSecret(e.target.value)}
                    placeholder="Pathao OAuth Client Secret"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 5: Bangladesh SMS Provider */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider flex items-center gap-2">
                <Mail size={14} className="text-emerald-400" />
                5. Bangladesh SMS Gateway (Greenweb / BulkSMSBD / MimSMS)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">SMS Provider</label>
                  <select
                    value={smsProvider}
                    onChange={(e) => setSmsProvider(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="GREENWEB">Greenweb BD Gateway</option>
                    <option value="BULKSMSBD">BulkSMSBD Gateway</option>
                    <option value="MIM_SMS">Mim SMS Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">SMS API Token / Key</label>
                  <input
                    type="password"
                    value={smsApiKey}
                    onChange={(e) => setSmsApiKey(e.target.value)}
                    placeholder="Paste SMS Gateway API Token"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Section 6: Shipping Rates */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <h4 className="text-xs font-bold text-slate-200 uppercase font-mono tracking-wider">
                6. Default Delivery Rates
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Dhaka Metro Fee (৳)</label>
                  <input
                    type="number"
                    value={dhakaShipping}
                    onChange={(e) => setDhakaShipping(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Outside Dhaka Fee (৳)</label>
                  <input
                    type="number"
                    value={outsideDhakaShipping}
                    onChange={(e) => setOutsideDhakaShipping(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-semibold text-slate-400 block mb-1">Free Delivery Spend (৳)</label>
                  <input
                    type="number"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex justify-end">
            <button
              type="submit"
              disabled={batchSettingsMutation.isPending}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-all flex items-center gap-2"
            >
              <Save size={14} />
              <span>{batchSettingsMutation.isPending ? 'Saving All Settings...' : 'Save All Settings'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: IP BLOCKING & FIREWALL */}
      {/* ========================================================================= */}
      {activeTab === 'ip_blocker' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Shield size={16} className="text-rose-400" />
                Backend IP Blocking &amp; Security Firewall
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Block suspicious or abusive IP addresses from placing orders or hitting API routes.
              </p>
            </div>

            <button
              onClick={() => setIsAddIpOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold transition-colors"
            >
              <Shield size={13} />
              <span>Add Blocked IP</span>
            </button>
          </div>

          {isAddIpOpen && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newBlockedIp.trim()) return;
                addIpMutation.mutate({ ipAddress: newBlockedIp.trim(), reason: blockedReason });
              }}
              className="p-4 bg-slate-950/90 border-b border-slate-800 flex flex-col sm:flex-row items-end gap-3 text-xs"
            >
              <div className="w-full sm:w-64">
                <label className="block text-slate-400 font-semibold mb-1">IP Address to Block *</label>
                <input
                  type="text"
                  required
                  value={newBlockedIp}
                  onChange={(e) => setNewBlockedIp(e.target.value)}
                  placeholder="e.g. 103.102.24.12"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-xl font-mono text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="w-full sm:flex-1">
                <label className="block text-slate-400 font-semibold mb-1">Reason (Optional)</label>
                <input
                  type="text"
                  value={blockedReason}
                  onChange={(e) => setBlockedReason(e.target.value)}
                  placeholder="e.g. Fraudulent COD orders or bot spam"
                  className="w-full bg-slate-900 border border-slate-800 text-slate-100 px-3 py-1.5 rounded-xl text-xs focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setIsAddIpOpen(false)}
                  className="px-3 py-1.5 border border-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addIpMutation.isPending}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-semibold rounded-xl"
                >
                  {addIpMutation.isPending ? 'Blocking...' : 'Block IP'}
                </button>
              </div>
            </form>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Blocked IP Address</th>
                  <th className="py-3.5 px-3">Reason</th>
                  <th className="py-3.5 px-3">Blocked Hits</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pr-4 pl-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {blockedIPs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-sans text-xs">
                      No blocked IP addresses. All clean traffic allowed.
                    </td>
                  </tr>
                ) : (
                  blockedIPs.map((b: any) => (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-200">{b.ipAddress}</td>
                      <td className="py-3 px-3 font-sans text-slate-300">{b.reason || 'Restricted by admin'}</td>
                      <td className="py-3 px-3 text-rose-400 font-bold">{b.hitCount || 0}</td>
                      <td className="py-3 px-3 font-sans">
                        {b.isActive ? (
                          <span className="text-[11px] text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                            Enforced (403)
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 pl-3 text-right space-x-2">
                        <button
                          onClick={() => toggleIpMutation.mutate({ id: b.id, isActive: !b.isActive })}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-sans"
                        >
                          {b.isActive ? 'Disable' : 'Enable'}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove IP ${b.ipAddress} from blocklist?`)) {
                              deleteIpMutation.mutate(b.id);
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/80 hover:bg-rose-600 text-rose-400 hover:text-white text-[10px] font-sans transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ADMIN SECURITY & CREDENTIALS */}
      {/* ========================================================================= */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-4xl">
          {/* Current Logged In Admin Profile Card */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xl">
                  {currentAdmin?.name?.[0] || 'A'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{currentAdmin?.name || 'Administrator'}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[10px] font-bold border border-emerald-500/30">
                      {currentAdmin?.role || 'SUPER_ADMIN'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{currentAdmin?.email || 'admin@skincare.com.bd'}</p>
                </div>
              </div>

              <button
                onClick={async () => {
                  await logout();
                  navigate('/admin/login', { replace: true });
                }}
                className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
              >
                <LogOut size={14} />
                <span>Log Out Admin Session</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Change Password Form */}
            <form onSubmit={handleChangePassword} className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <KeyRound size={16} className="text-emerald-400" />
                  Update Security Password
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Update your administrator access password securely.
                </p>
              </div>

              {passwordStatus && (
                <div
                  className={`p-3 rounded-xl flex items-start gap-2 text-xs ${
                    passwordStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                  }`}
                >
                  {passwordStatus.type === 'success' ? (
                    <CheckCircle2 size={14} className="shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  )}
                  <span>{passwordStatus.message}</span>
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  New Password (min. 6 characters)
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold transition-colors shadow-md disabled:opacity-50"
                >
                  {isChangingPassword ? 'Encrypting & Updating...' : 'Save New Password'}
                </button>
              </div>
            </form>

            {/* Active Session Station Info */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4 text-xs">
              <div className="border-b border-slate-800 pb-3">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <Laptop size={16} className="text-blue-400" />
                  Active Station &amp; Security Specs
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Real-time station telemetry and cryptographic status.
                </p>
              </div>

              <div className="space-y-3 font-mono text-[11px]">
                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Token Transport:</span>
                  <span className="text-emerald-400 font-semibold">HTTP-Only SameSite Cookie + Bearer</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Encryption Standard:</span>
                  <span className="text-blue-400 font-semibold">Bcrypt (Cost 10) + SHA-256 JWT</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Token Expiration:</span>
                  <span className="text-slate-200">7 Days Rolling Session</span>
                </div>

                <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400 font-sans">Brute-Force Shield:</span>
                  <span className="text-emerald-400 font-semibold">Rate-Limited (15 req/15min)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: USERS & ROLES RBAC */}
      {/* ========================================================================= */}
      {activeTab === 'users' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <ShieldCheck size={16} className="text-purple-400" />
                Staff Role-Based Access Control (RBAC)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Assign administrative scopes and access levels across team members.</p>
            </div>
            <span className="text-xs text-slate-400">Total Accounts: <strong className="text-slate-200">{users.length}</strong></span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">User Name & Email</th>
                  <th className="py-3.5 px-3">Phone</th>
                  <th className="py-3.5 px-3">System Role</th>
                  <th className="py-3.5 px-3">Status</th>
                  <th className="py-3.5 pr-4 pl-2 text-right">Assign Role</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {isLoadingUsers ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400">Loading accounts...</td>
                  </tr>
                ) : (
                  users.map((u: any) => (
                    <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-200">{u.name}</p>
                        <span className="text-[11px] text-slate-400 font-mono">{u.email}</span>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-mono">{u.phone || '—'}</td>

                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            u.role === 'SUPER_ADMIN'
                              ? 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                              : u.role === 'PRODUCT_MANAGER'
                              ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                              : u.role === 'ORDER_MANAGER'
                              ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              : u.role === 'MARKETING_MANAGER'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3 px-3">
                        {u.isActive !== false ? (
                          <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                            <CheckCircle2 size={12} /> Active
                          </span>
                        ) : (
                          <span className="text-[11px] text-rose-400 flex items-center gap-1 font-semibold">
                            <AlertCircle size={12} /> Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => roleMutation.mutate({ id: u.id, role: e.target.value })}
                          className="bg-slate-950 border border-slate-800 text-slate-200 px-2 py-1 rounded-lg text-xs focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value="CUSTOMER">CUSTOMER</option>
                          <option value="SUPPORT_STAFF">SUPPORT_STAFF</option>
                          <option value="MARKETING_MANAGER">MARKETING_MANAGER</option>
                          <option value="ORDER_MANAGER">ORDER_MANAGER</option>
                          <option value="PRODUCT_MANAGER">PRODUCT_MANAGER</option>
                          <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: ACTIVITY AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'logs' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-0">
          <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <History size={16} className="text-emerald-400" />
                Immutable Administrative Activity Trail
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Recorded log of price changes, permission updates, order fulfillment, and marketing releases.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-3">Admin / Staff</th>
                  <th className="py-3.5 px-3">Action</th>
                  <th className="py-3.5 px-3">Target Entity</th>
                  <th className="py-3.5 pr-4 pl-3">Details</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                {sampleAuditLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString()}
                    </td>

                    <td className="py-3 px-3 font-sans font-semibold text-slate-200">
                      {log.adminName || 'Super Admin'}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          log.action === 'CREATE'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : log.action === 'UPDATE'
                            ? 'bg-blue-500/15 text-blue-400'
                            : log.action === 'DELETE'
                            ? 'bg-rose-500/15 text-rose-400'
                            : 'bg-amber-500/15 text-amber-400'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {log.entity}
                    </td>

                    <td className="py-3 pr-4 pl-3 font-sans text-slate-300">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
