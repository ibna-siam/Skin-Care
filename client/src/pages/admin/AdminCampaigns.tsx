import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Megaphone,
  Plus,
  Search,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  RefreshCw,
  X,
  Play,
  Pause,
  Send,
  Users,
  Percent,
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  DRAFT: 'bg-slate-800 text-slate-300 border-slate-700',
  SCHEDULED: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
  ACTIVE: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  PAUSED: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  COMPLETED: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
  CANCELLED: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
};

export const AdminCampaigns: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('PROMOTION');
  const [status, setStatus] = useState('DRAFT');
  const [audience, setAudience] = useState('ALL');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Fetch Campaigns
  const { data: campaigns = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-campaigns'],
    queryFn: () => adminService.getCampaigns(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createCampaign(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateCampaign(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCampaign(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-campaigns'] });
    },
  });

  const openCreateModal = () => {
    setEditingCampaign(null);
    setName('');
    setDescription('');
    setType('PROMOTION');
    setStatus('DRAFT');
    setAudience('ALL');
    setSubject('');
    setMessage('');
    setCouponCode('');
    setImageUrl('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setIsModalOpen(true);
  };

  const openEditModal = (c: any) => {
    setEditingCampaign(c);
    setName(c.name);
    setDescription(c.description || '');
    setType(c.type || 'PROMOTION');
    setStatus(c.status || 'DRAFT');
    setAudience(c.audience || 'ALL');
    setSubject(c.subject || '');
    setMessage(c.message || '');
    setCouponCode(c.couponCode || '');
    setImageUrl(c.imageUrl || '');
    setStartDate(c.startDate ? c.startDate.split('T')[0] : '');
    setEndDate(c.endDate ? c.endDate.split('T')[0] : '');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCampaign(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !message) return;

    const payload = {
      name,
      description,
      type,
      status,
      audience,
      subject,
      message,
      couponCode,
      imageUrl,
      startDate: startDate ? new Date(startDate).toISOString() : null,
      endDate: endDate ? new Date(endDate).toISOString() : null,
    };

    if (editingCampaign) {
      updateMutation.mutate({ id: editingCampaign.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const toggleStatus = (c: any) => {
    const newStatus = c.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    updateMutation.mutate({ id: c.id, data: { status: newStatus } });
  };

  const filteredCampaigns = campaigns.filter((c: any) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.subject && c.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.couponCode && c.couponCode.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Megaphone size={24} className="text-purple-400" />
            Marketing Campaigns & Broadcasts
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, schedule, and track promotional campaigns, seasonal sales drops, and customer cohort messaging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Create Campaign</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh campaigns"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns or coupon..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Status: All</option>
            <option value="ACTIVE">Active</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="PAUSED">Paused</option>
            <option value="DRAFT">Draft</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-3 py-16 text-center text-slate-400">
            <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-mono mt-2">Loading marketing campaigns...</p>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="col-span-3 py-16 text-center text-slate-400 bg-slate-900/80 border border-slate-800 rounded-3xl space-y-2">
            <Megaphone size={28} className="mx-auto text-slate-400" />
            <p className="text-sm font-semibold text-slate-300">No campaigns found</p>
            <p className="text-xs text-slate-400">Click &quot;Create Campaign&quot; to build your first promotional campaign.</p>
          </div>
        ) : (
          filteredCampaigns.map((c: any) => (
            <div
              key={c.id}
              className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all shadow-lg"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-purple-400 border border-purple-500/20">
                    {c.type}
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${STATUS_COLORS[c.status] || 'bg-slate-800'}`}>
                    {c.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100">{c.name}</h3>
                  {c.subject && (
                    <p className="text-xs font-medium text-slate-300 mt-0.5 line-clamp-1">{c.subject}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">{c.message}</p>
                </div>

                <div className="pt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                    <Users size={11} className="text-blue-400" /> {c.audience}
                  </span>
                  {c.couponCode && (
                    <span className="flex items-center gap-1 bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-amber-400 font-mono">
                      <Percent size={11} /> {c.couponCode}
                    </span>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                <div className="text-[10px] text-slate-400">
                  {c.startDate ? (
                    <span className="flex items-center gap-1">
                      <Calendar size={10} /> {new Date(c.startDate).toLocaleDateString()}
                    </span>
                  ) : (
                    <span>No schedule</span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => toggleStatus(c)}
                    className="p-1.5 text-slate-300 hover:text-amber-400 rounded-lg hover:bg-slate-800"
                    title={c.status === 'ACTIVE' ? 'Pause Campaign' : 'Activate Campaign'}
                  >
                    {c.status === 'ACTIVE' ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800"
                    title="Edit Campaign"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete campaign "${c.name}"?`)) deleteMutation.mutate(c.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800"
                    title="Delete Campaign"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Megaphone size={18} className="text-purple-400" />
                {editingCampaign ? 'Edit Campaign' : 'Create Marketing Campaign'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Campaign Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Eid Glow Flash Sale"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Audience</label>
                  <select
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  >
                    <option value="ALL">All Customers</option>
                    <option value="VIP">VIP Spenders (Over ৳10,000)</option>
                    <option value="REPEAT">Repeat Customers (2+ orders)</option>
                    <option value="INACTIVE">Inactive Customers (60+ days)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Campaign Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="SCHEDULED">Scheduled</option>
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Coupon Voucher Code</label>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g. GLOW20"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subject / Headline</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Exclusive 20% off all Korean Sunscreens!"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Campaign Message *</label>
                <textarea
                  rows={3}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Detailed campaign promotional content..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? 'Saving...'
                    : editingCampaign
                    ? 'Update Campaign'
                    : 'Save Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
