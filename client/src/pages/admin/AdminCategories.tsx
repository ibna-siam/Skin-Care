import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

export const AdminCategories: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Fetch Categories
  const { data: categories = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adminService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to create category');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      closeModal();
    },
    onError: (err: any) => {
      setErrorMessage(err.message || 'Failed to update category');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Cannot delete category');
    },
  });

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setParentId('');
    setSortOrder('0');
    setIsFeatured(false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setParentId(cat.parentId || '');
    setSortOrder(cat.sortOrder?.toString() || '0');
    setIsFeatured(cat.isFeatured || false);
    setErrorMessage('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setErrorMessage('');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    if (!editingCategory) {
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
      imageUrl: imageUrl || null,
      parentId: parentId || null,
      sortOrder: parseInt(sortOrder, 10) || 0,
      isFeatured,
    };

    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory.id, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id: string, name: string, productCount: number) => {
    if (productCount > 0) {
      alert(`Cannot delete "${name}" because it has ${productCount} active products assigned.`);
      return;
    }
    if (confirm(`Are you sure you want to delete category "${name}"?`)) {
      deleteMutation.mutate(id);
    }
  };

  const filteredCategories = categories.filter((c: any) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FolderTree size={24} className="text-emerald-400" />
            Category Hierarchy & Taxonomy
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize skincare categories, parent-child relationships, storefront order, and product routing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add New Category</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh categories"
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
            placeholder="Search categories or slug..."
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="text-xs text-slate-400">
          Total Categories: <strong className="text-slate-200">{categories.length}</strong>
        </div>
      </div>

      {/* Categories Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Category Name</th>
                <th className="py-3.5 px-3">Slug</th>
                <th className="py-3.5 px-3">Parent Hierarchy</th>
                <th className="py-3.5 px-3 text-center">Products</th>
                <th className="py-3.5 px-3 text-center">Order</th>
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
                      <p className="text-xs font-mono">Loading categories...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400 space-y-2">
                    <Layers size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No categories found</p>
                    <p className="text-xs text-slate-400">Click &quot;Add New Category&quot; to build your hierarchy.</p>
                  </td>
                </tr>
              ) : (
                filteredCategories.map((c: any) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">
                      <div className="flex items-center gap-2.5">
                        {c.imageUrl ? (
                          <img src={c.imageUrl} alt={c.name} className="w-8 h-8 rounded-lg object-cover bg-slate-800" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                            {c.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <span>{c.name}</span>
                          {c.description && (
                            <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[200px]">{c.description}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 font-mono text-[11px] text-amber-400">/{c.slug}</td>

                    <td className="py-3 px-3 text-slate-300">
                      {c.parent ? (
                        <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 text-slate-300 rounded text-[10px]">
                          {c.parent.name}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-mono">Root Category</span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-slate-200">
                      {c.productCount || 0}
                    </td>

                    <td className="py-3 px-3 text-center font-mono text-slate-400">
                      {c.sortOrder || 0}
                    </td>

                    <td className="py-3 px-3 text-center">
                      {c.isFeatured ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          <Sparkles size={10} /> Featured
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-3 pr-4 pl-2 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Edit Category"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id, c.name, c.productCount || 0)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                          title="Delete Category"
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
                <FolderTree size={18} className="text-emerald-400" />
                {editingCategory ? 'Edit Category' : 'Create New Category'}
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
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={handleNameChange}
                    placeholder="e.g. Cleansers"
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
                    placeholder="e.g. cleansers"
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Parent Category</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                >
                  <option value="">None (Top-Level Category)</option>
                  {categories
                    .filter((c: any) => !editingCategory || c.id !== editingCategory.id)
                    .map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief description for SEO and category banner..."
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category Cover Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                  {/* Quick Sample Presets */}
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    <span className="text-[10px] text-slate-400">Samples:</span>
                    {[
                      { label: 'Cleanser', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop' },
                      { label: 'Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=600&auto=format&fit=crop' },
                      { label: 'Moisturizer', url: 'https://images.unsplash.com/photo-1556228722-d0b5b244719c?q=80&w=600&auto=format&fit=crop' },
                      { label: 'Sunscreen', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=600&auto=format&fit=crop' },
                      { label: 'Toner', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=600&auto=format&fit=crop' },
                    ].map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setImageUrl(s.url)}
                        className="px-1.5 py-0.5 rounded bg-slate-950 hover:bg-slate-800 border border-slate-800 text-[10px] text-emerald-400 font-mono"
                      >
                        + {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Display Sort Order</label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="rounded bg-slate-950 border-slate-800 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                />
                <label htmlFor="isFeatured" className="text-slate-300 text-xs cursor-pointer">
                  Feature in storefront navigation and homepage showcase
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
                    : editingCategory
                    ? 'Update Category'
                    : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
