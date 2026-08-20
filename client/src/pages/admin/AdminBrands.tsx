import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  Award,
  Plus,
  Search,
  Edit2,
  Trash2,
  Globe,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  X,
  Building2,
} from 'lucide-react';

export const AdminBrands: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [country, setCountry] = useState('');
  const [website, setWebsite] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Brands
  const { data: brands = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-brands'],
    queryFn: () => adminService.getBrands(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createBrand(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to create brand');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateBrand(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update brand');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteBrand(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-brands'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Cannot delete brand');
    },
  });

  const openCreateModal = () => {
    setEditingBrand(null);
    setName('');
    setSlug('');
    setDescription('');
    setLogoUrl('');
    setCountry('South Korea');
    setWebsite('');
    setIsFeatured(false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (brand: any) => {
    setEditingBrand(brand);
    setName(brand.name);
    setSlug(brand.slug);
    setDescription(brand.description || '');
    setLogoUrl(brand.logoUrl || '');
    setCountry(brand.country || '');
    setWebsite(brand.website || '');
    setIsFeatured(brand.isFeatured || false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBrand(null);
    setErrorMessage('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingBrand) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')
      );
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug) return;

    const payload = {
      name,
      slug,
      description: description || null,
      logoUrl: logoUrl || null,
      country: country || null,
      website: website || null,
      isFeatured,
    };

    if (editingBrand) {
      updateMutation.mutate({ id: editingBrand.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Cannot delete "${name}" because it has ${productCount} active products assigned.`);
      return;
    }
    if (confirm(`Are you sure you want to delete brand "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredBrands = brands.filter((b: any) =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.country && b.country.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Award size={24} className="text-amber-400" />
            Brand Partner Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage authenticated skincare brands, authorized distributors, country of origin, and featured partners.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add Brand Partner</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh brands"
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
            placeholder="Search brands by name or country..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Brands: <strong className="text-slate-200">{brands.length}</strong>
        </div>
      </div>

      {/* Brands Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-3">Slug</th>
                <th className="py-3.5 px-3">Country of Origin</th>
                <th className="py-3.5 px-3">Official Website</th>
                <th className="py-3.5 px-3 text-center">Products</th>
                <th className="py-3.5 px-3 text-center">Featured</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading brands...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredBrands.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                    <Building2 size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No brands found</p>
                    <p className="text-xs text-slate-400">Click &quot;Add Brand Partner&quot; to add skincare brands.</p>
                  </td>
                </tr>
              ) : (
                filteredBrands.map((b: any) => (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2.5">
                        {b.logoUrl ? (
                          <img src={b.logoUrl} alt={b.name} className="w-8 h-8 rounded-lg object-contain bg-slate-800 p-0.5 border border-slate-700" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                            {b.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span>{b.name}</span>
                          {b.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{b.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-amber-400">/{b.slug}</td>

                    <td className="py-3 px-3 text-slate-300">
                      {b.country ? (
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px]">
                          {b.country}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-300">
                      {b.website ? (
                        <a
                          href={b.website}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-400 hover:underline inline-flex items-center gap-1 text-[11px]"
                        >
                          <Globe size={11} /> Visit
                        </a>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {b.productCount || 0}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {b.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Sparkles size={10} /> Partner
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(b)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Brand"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(b.id, b.name, b.productCount || 0)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete Brand"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Award size={18} className="text-amber-400" />
                {editingBrand ? 'Edit Brand Partner' : 'Add Brand Partner'}
              </h3>
              <button onClick={closeModal} className="p-1 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800">
                <X size={18} />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Brand Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. COSRX"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">URL Slug *</label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="e.g. cosrx"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Country of Origin</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. South Korea, USA, UK"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Official Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Brand Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
                {/* Quick Sample Presets */}
                <div className="flex flex-wrap items-center gap-1 mt-1.5">
                  <span className="text-[10px] text-slate-400">Sample logos:</span>
                  {[
                    { label: 'CeraVe', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300&auto=format&fit=crop' },
                    { label: 'The Ordinary', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=300&auto=format&fit=crop' },
                    { label: 'Minimalist', url: 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=300&auto=format&fit=crop' },
                    { label: 'Neutrogena', url: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=300&auto=format&fit=crop' },
                    { label: 'COSRX', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=300&auto=format&fit=crop' },
                    { label: 'Beauty of Joseon', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=300&auto=format&fit=crop' },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => setLogoUrl(s.url)}
                      className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-amber-400 font-mono"
                    >
                      + {s.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Description / Brand Story</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description about brand authenticity and specialties..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isBrandFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="isBrandFeatured" className="text-slate-300 text-xs cursor-pointer">
                  Feature in storefront brand carousel and authorized partner list
                </label>
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
                    : editingBrand
                    ? 'Update Brand'
                    : 'Add Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
