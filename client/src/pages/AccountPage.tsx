import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { orderService } from '../services/order.service';
import { authService } from '../services/auth.service';
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  Sparkles,
  Truck,
  Plus,
  Trash2,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { BANGLADESH_DIVISIONS, formatBDT, normalizeBDPhone } from '@skincare/shared';

export const AccountPage: React.FC = () => {
  const { user, fetchUser, openAuthModal, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'profile'>('overview');

  // Address modal state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState('Dhaka');
  const [district, setDistrict] = useState('dhaka-city');
  const [area, setArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [isDefault, setIsDefault] = useState(true);

  // Profile update state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [preferredSkinType, setPreferredSkinType] = useState(user?.preferredSkinType || 'Normal');
  const [profileSaved, setProfileSaved] = useState(false);

  // Fetch orders from API
  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => orderService.getMyOrders(),
    enabled: !!user,
  });

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-cream-200 text-brand-800 flex items-center justify-center mx-auto">
          <User size={32} />
        </div>
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Sign in to your Account</h2>
        <p className="text-xs text-gray-500">
          View your order status, manage delivery addresses, and track your skincare routine.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 bg-brand-800 text-white rounded-xl text-xs font-semibold hover:bg-brand-900 shadow-sm"
        >
          Sign In / Create Account
        </button>
      </div>
    );
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.addAddress({
        recipientName,
        phone: normalizeBDPhone(phone),
        division,
        district,
        area,
        fullAddress,
        isDefault,
      });
      await fetchUser();
      setIsAddressModalOpen(false);
      setRecipientName('');
      setPhone('');
      setArea('');
      setFullAddress('');
    } catch (err: any) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Delete this delivery address?')) {
      await authService.deleteAddress(id);
      await fetchUser();
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile({
        name: profileName,
        phone: profilePhone ? normalizeBDPhone(profilePhone) : undefined,
        preferredSkinType,
      });
      await fetchUser();
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-cream-100 rounded-3xl p-6 sm:p-8 border border-cream-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand-800 text-white flex items-center justify-center font-serif text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold text-charcoal-900">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">{user.email} • {user.role}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => logout()}
            className="px-4 py-2 bg-white border border-gray-300 text-charcoal-800 rounded-xl text-xs font-semibold hover:bg-cream-200"
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-3 space-y-2">
          <div className="bg-white rounded-2xl border border-cream-300 p-3 shadow-sm space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'overview' ? 'bg-brand-800 text-white' : 'text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              <User size={16} /> Overview
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'orders' ? 'bg-brand-800 text-white' : 'text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              <ShoppingBag size={16} /> My Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'addresses' ? 'bg-brand-800 text-white' : 'text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              <MapPin size={16} /> Delivery Addresses ({user.addresses?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                activeTab === 'profile' ? 'bg-brand-800 text-white' : 'text-charcoal-800 hover:bg-cream-100'
              }`}
            >
              <Sparkles size={16} /> Skin Profile & Settings
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-9 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium">Total Orders</span>
                  <p className="font-serif text-3xl font-bold text-charcoal-900 mt-1">{orders.length}</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium">Preferred Skin Type</span>
                  <p className="font-serif text-2xl font-bold text-brand-800 mt-1">
                    {user.preferredSkinType || 'Not set'}
                  </p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-cream-300 shadow-sm">
                  <span className="text-xs text-gray-500 font-medium">Saved Addresses</span>
                  <p className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
                    {user.addresses?.length || 0}
                  </p>
                </div>
              </div>

              {/* Recent Orders Snapshot */}
              <div className="bg-white rounded-3xl border border-cream-300 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <h3 className="font-bold text-sm text-charcoal-900">Recent Orders</h3>
                  <button onClick={() => setActiveTab('orders')} className="text-xs font-semibold text-brand-800 hover:underline">
                    View All
                  </button>
                </div>

                {orders.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4">No orders placed yet.</p>
                ) : (
                  <div className="space-y-3">
                    {orders.slice(0, 3).map((ord) => (
                      <div key={ord.id} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div>
                          <span className="font-bold font-mono text-charcoal-900">#{ord.orderNumber}</span>
                          <p className="text-gray-500 text-[11px]">{new Date(ord.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-brand-100 text-brand-800">
                          {ord.orderStatus}
                        </span>
                        <span className="font-bold text-charcoal-900">{formatBDT(ord.totalAmount)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: ORDERS */}
          {activeTab === 'orders' && (
            <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">My Order History</h3>

              {orders.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-xs">No orders yet.</div>
              ) : (
                <div className="space-y-4">
                  {orders.map((ord) => (
                    <div key={ord.id} className="p-5 rounded-2xl border border-cream-300 bg-cream-50/50 space-y-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-200">
                        <div>
                          <span className="font-bold font-mono text-sm text-charcoal-900">#{ord.orderNumber}</span>
                          <span className="text-xs text-gray-500 ml-2">({new Date(ord.createdAt).toLocaleDateString('en-BD')})</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[11px] uppercase font-bold bg-brand-800 text-white">
                            {ord.orderStatus}
                          </span>
                          <span className="text-xs font-semibold bg-white px-2 py-1 rounded border">
                            {ord.paymentMethod} • {ord.paymentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {ord.items.map((it: any) => (
                          <div key={it.id} className="flex items-center justify-between text-xs">
                            <span className="text-charcoal-800 font-medium">{it.quantity}x {it.productName}</span>
                            <span className="font-semibold">{formatBDT(it.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-gray-200 flex flex-wrap items-center justify-between text-xs">
                        <span className="text-gray-500">Shipping to: {ord.fullAddress}, {ord.area}, {ord.division}</span>
                        <span className="font-bold text-sm text-brand-900">Total: {formatBDT(ord.totalAmount)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-serif text-xl font-bold text-charcoal-900">Delivery Addresses</h3>
                <button
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-4 py-2 bg-brand-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <Plus size={14} /> Add New Address
                </button>
              </div>

              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {user.addresses.map((addr: any) => (
                    <div key={addr.id} className="p-5 rounded-2xl border border-cream-300 bg-cream-50 space-y-2 relative">
                      {addr.isDefault && (
                        <span className="text-[10px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                          Default Address
                        </span>
                      )}
                      <h4 className="font-bold text-sm text-charcoal-900">{addr.recipientName}</h4>
                      <p className="text-xs text-gray-600">{addr.phone}</p>
                      <p className="text-xs text-gray-600">{addr.fullAddress}, {addr.area}, {addr.division}</p>

                      <button
                        onClick={() => handleDeleteAddress(addr.id)}
                        className="text-xs text-red-600 hover:underline pt-2 inline-block"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 py-6">No saved addresses yet.</p>
              )}
            </div>
          )}

          {/* TAB 4: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-cream-300 p-6 sm:p-8 shadow-sm space-y-6">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Profile & Skin Preferences</h3>

              {profileSaved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 rounded-xl flex items-center gap-1.5">
                  <CheckCircle2 size={16} /> Profile updated successfully!
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">Email</label>
                  <input
                    type="email"
                    disabled
                    value={user.email}
                    className="w-full px-3.5 py-2.5 bg-gray-100 border rounded-xl text-sm text-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">Mobile Phone (Bangladesh)</label>
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="01712345678"
                    className="w-full px-3.5 py-2.5 bg-cream-50 border rounded-xl text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-charcoal-800 mb-1">Primary Skin Type</label>
                  <select
                    value={preferredSkinType}
                    onChange={(e) => setPreferredSkinType(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-cream-50 border rounded-xl text-sm"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Oily">Oily</option>
                    <option value="Dry">Dry</option>
                    <option value="Combination">Combination</option>
                    <option value="Sensitive">Sensitive</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-semibold hover:bg-brand-900"
                >
                  Save Changes
                </button>
              </form>
            </div>
          )}
        </main>
      </div>

      {/* Address modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsAddressModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 space-y-4">
            <h3 className="font-serif text-lg font-bold">Add Delivery Address</h3>
            <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">Recipient Name</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Division</label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border rounded-xl"
                >
                  {BANGLADESH_DIVISIONS.map((d) => (
                    <option key={d.id} value={d.name}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Area</label>
                <input
                  type="text"
                  required
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Full Street Address</label>
                <textarea
                  required
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full p-2.5 bg-cream-50 border rounded-xl"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(false)}
                  className="flex-1 py-2.5 border rounded-xl font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-brand-800 text-white rounded-xl font-semibold"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
