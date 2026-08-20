import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Image as ImageIcon,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  RefreshCw,
  Layers,
  Upload,
  Link as LinkIcon,
  Eye,
  ArrowUpDown,
} from 'lucide-react';

export const AdminBanners: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkUrl, setLinkUrl] = useState('/products');
  const [position, setPosition] = useState('HERO');
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState('0');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch Banners
  const { data: banners = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-banners'],
    queryFn: () => adminService.getBanners(),
  });

  // Create / Update Mutation
  const saveMutation = useMutation({
    mutationFn: (payload: any) => {
      if (editingBannerId) {
        return adminService.updateBanner(editingBannerId, payload);
      }
      return adminService.createBanner(payload);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
  });

  // Toggle Active Mutation
  const toggleMutation = useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      adminService.updateBanner(id, { isActive: active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-banners'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingBannerId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setLinkUrl('/products');
    setPosition('HERO');
    setIsActive(true);
    setSortOrder('0');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: any) => {
    setEditingBannerId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImageUrl(b.imageUrl);
    setLinkUrl(b.linkUrl || '/products');
    setPosition(b.position || 'HERO');
    setIsActive(b.isActive);
    setSortOrder(b.sortOrder?.toString() || '0');
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const res = await adminService.uploadImage(file, 'skincare-banners');
      if (res?.url) {
        setImageUrl(res.url);
      }
    } catch (error) {
      console.error('Banner upload failed', error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !imageUrl) return;

    const payload = {
      title,
      subtitle,
      imageUrl,
      linkUrl,
      position,
      isActive,
      sortOrder: parseInt(sortOrder, 10) || 0,
    };

    saveMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <ImageIcon size={24} className="text-emerald-400" />
            Hero & Promotional Banners
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage high-impact storefront carousels, seasonal campaigns, and marketing popup visual banners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Create Banner</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh banners"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Banners Grid / Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Banner Preview</th>
                <th className="py-3.5 px-3">Title & Subtitle</th>
                <th className="py-3.5 px-3 text-center">Position</th>
                <th className="py-3.5 px-3">Target Destination</th>
                <th className="py-3.5 px-3 text-center">Order</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading banners...</p>
                    </div>
                  </td>
                </tr>
              ) : banners.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                    <ImageIcon size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No promotional banners created</p>
                    <p className="text-xs text-slate-400">Click &quot;Create Banner&quot; to launch a new hero slide.</p>
                  </td>
                </tr>
              ) : (
                banners.map((b: any) => {
                  return (
                    <tr key={b.id} className="hover:bg-slate-800/40 transition-colors group">
                      <td className="py-3 px-4">
                        <div className="w-28 h-14 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shrink-0">
                          <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                      </td>

                      <td className="py-3 px-3 max-w-[220px]">
                        <p className="font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                          {b.title}
                        </p>
                        {b.subtitle && (
                          <p className="text-[11px] text-slate-400 truncate mt-0.5">{b.subtitle}</p>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300">
                          {b.position}
                        </span>
                      </td>

                      <td className="py-3 px-3 text-slate-300 font-mono text-[11px] truncate max-w-[150px]">
                        {b.linkUrl || '/products'}
                      </td>

                      <td className="py-3 px-3 text-center font-mono text-slate-300 font-bold">
                        {b.sortOrder ?? 0}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() =>
                            toggleMutation.mutate({ id: b.id, active: !b.isActive })
                          }
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono cursor-pointer transition-colors ${
                            b.isActive
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                          title="Click to toggle"
                        >
                          {b.isActive ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                            title="Edit Banner"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete banner "${b.title}"?`)) {
                                deleteMutation.mutate(b.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-400 text-slate-300 rounded-lg transition-colors"
                            title="Delete Banner"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ImageIcon className="text-emerald-400" size={18} />
                <h3 className="text-base font-bold text-slate-100">
                  {editingBannerId ? 'Edit Hero Banner' : 'Create New Promotional Banner'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Banner Headline *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Summer Hydration Sale: Up to 25% Off"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-semibold"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Subtitle / Supporting Text</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Dermatologist-approved sunscreens & hyaluronic acid serums"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Banner Image URL *</label>
                <div className="flex flex-col sm:flex-row items-center gap-2.5">
                  <input
                    type="text"
                    required
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/... or Cloudinary URL"
                    className="flex-1 w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />

                  <label className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                    <Upload size={14} />
                    <span>{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={isUploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Quick Sample Presets */}
                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  <span className="text-[10px] text-slate-400">Sample presets:</span>
                  {[
                    { label: 'Hero Sunscreen', url: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1600&auto=format&fit=crop' },
                    { label: 'Glass Skin Serums', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1600&auto=format&fit=crop' },
                    { label: 'Hydration Fest', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=1600&auto=format&fit=crop' },
                    { label: 'Ceramide Glow', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop' },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setImageUrl(s.url)}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-emerald-400 font-mono transition-colors"
                    >
                      + {s.label}
                    </button>
                  ))}
                </div>

                {imageUrl && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-slate-800 h-24 bg-slate-950">
                    <img src={imageUrl} alt="Banner preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Placement Position</label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="HERO">HERO (Main Carousel)</option>
                    <option value="MIDDLE">MIDDLE (Mid-page Promo)</option>
                    <option value="POPUP">POPUP (Storefront Modal)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Link URL</label>
                  <input
                    type="text"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    placeholder="/products?category=serum"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Sort Display Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span className="text-slate-300 font-medium">Visible & Active</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold shadow-sm transition-all disabled:opacity-50"
                >
                  {saveMutation.isPending ? 'Saving...' : editingBannerId ? 'Update Banner' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
