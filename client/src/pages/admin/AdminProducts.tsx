import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../../services/admin.service';
import { productService } from '../../services/product.service';
import { Plus, Edit2, Trash2, Search, X, Check, Package, Image as ImageIcon } from 'lucide-react';
import { formatBDT } from '@skincare/shared';

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('20');
  const [gender, setGender] = useState<'ALL' | 'MEN' | 'WOMEN' | 'UNISEX'>('ALL');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch Products
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['admin-products', searchTerm],
    queryFn: () => adminService.getProducts({ search: searchTerm || undefined }),
  });

  // Fetch Brands & Categories for selectors
  const { data: brands = [] } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productService.getBrands(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  const products = productsData?.data || [];

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setName('');
    setBrandId(brands[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setCompareAtPrice('');
    setSku(`SKN-${Math.floor(1000 + Math.random() * 9000)}`);
    setStock('30');
    setGender('ALL');
    setDescription('');
    setShortDescription('');
    setImageUrl('https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800');
    setBadge('New');
    setIsBestSeller(false);
    setIsFeatured(false);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProductId(p.id);
    setName(p.name);
    setBrandId(p.brandId);
    setCategoryId(p.categoryId);
    setPrice(p.price.toString());
    setCompareAtPrice(p.compareAtPrice ? p.compareAtPrice.toString() : '');
    setSku(p.sku);
    setStock(p.stock.toString());
    setGender(p.gender || 'ALL');
    setDescription(p.description);
    setShortDescription(p.shortDescription || '');
    setImageUrl(p.images?.[0]?.url || '');
    setBadge(p.badge || '');
    setIsBestSeller(p.isBestSeller || false);
    setIsFeatured(p.isFeatured || false);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProductId) {
        await adminService.updateProduct(editingProductId, {
          name,
          brandId,
          categoryId,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          sku,
          stock: parseInt(stock, 10),
          gender,
          description,
          shortDescription,
          badge,
          isBestSeller,
          isFeatured,
          images: imageUrl ? [{ url: imageUrl, isPrimary: true, sortOrder: 0 }] : [],
        });
      } else {
        await adminService.createProduct({
          name,
          brandId,
          categoryId,
          price: parseFloat(price),
          compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
          sku,
          stock: parseInt(stock, 10),
          gender,
          description,
          shortDescription,
          badge,
          isBestSeller,
          isFeatured,
          images: [{ url: imageUrl, isPrimary: true, sortOrder: 0 }],
        });
      }
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete/archive this product?')) {
      try {
        await adminService.deleteProduct(id);
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      } catch (err: any) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Product Management</h1>
          <p className="text-xs text-slate-400 mt-1">Add, update prices, manage stock, and edit skincare catalog.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow"
        >
          <Plus size={16} /> Add New Product
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
        <Search size={18} className="text-slate-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search products by title, SKU, brand..."
          className="w-full bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
        />
      </div>

      {/* Products Table */}
      <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 border-b border-slate-800 text-slate-400 uppercase text-[10px]">
              <tr>
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Brand</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">Loading catalog...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">No products found.</td>
                </tr>
              ) : (
                products.map((p: any) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={p.images?.[0]?.url || ''}
                        alt={p.name}
                        className="w-10 h-10 object-contain bg-white rounded-lg p-1 shrink-0"
                      />
                      <div>
                        <p className="font-semibold text-slate-100 line-clamp-1">{p.name}</p>
                        {p.badge && (
                          <span className="text-[9px] uppercase font-bold text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded">
                            {p.badge}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-400">{p.sku}</td>
                    <td className="p-4">{p.brand?.name}</td>
                    <td className="p-4">{p.category?.name}</td>
                    <td className="p-4 font-bold text-slate-100">{formatBDT(p.price)}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock <= 5 ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-300'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-900 rounded-lg hover:bg-slate-800"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 rounded-lg hover:bg-slate-800"
                          title="Delete / Archive"
                        >
                          <Trash2 size={14} />
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

      {/* Product Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100">
                {editingProductId ? 'Edit Skincare Product' : 'Create New Product'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. CeraVe Foaming Cleanser"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Brand *</label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Selling Price (BDT ৳) *</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="1350"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Compare Price (Old Price) ৳</label>
                  <input
                    type="number"
                    value={compareAtPrice}
                    onChange={(e) => setCompareAtPrice(e.target.value)}
                    placeholder="1550"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="CRV-FC-236"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Inventory Stock Quantity *</label>
                  <input
                    type="number"
                    required
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  />
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="block text-slate-400 font-semibold">Product Image (Upload or URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="https://... or upload below"
                      className="flex-1 p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                    />
                    <label className={`px-4 py-2.5 ${isUploadingImage ? 'bg-slate-700 cursor-not-allowed' : 'bg-slate-800 hover:bg-slate-700 cursor-pointer'} text-slate-200 rounded-xl font-semibold flex items-center gap-1.5 shrink-0 transition-colors`}>
                      <ImageIcon size={14} className={isUploadingImage ? 'animate-pulse' : ''} />
                      <span>{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isUploadingImage}
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setIsUploadingImage(true);
                            try {
                              const res = await adminService.uploadImage(file, 'skincare-products');
                              if (res?.url) {
                                setImageUrl(res.url);
                              }
                            } catch (err: any) {
                              alert(err.message || 'Image upload failed');
                            } finally {
                              setIsUploadingImage(false);
                            }
                          }
                        }}
                      />
                    </label>
                  </div>
                  {imageUrl && (
                    <div className="flex items-center gap-2 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                      <img src={imageUrl} alt="Preview" className="w-10 h-10 object-contain bg-white rounded-lg p-0.5" />
                      <span className="text-[10px] text-slate-400 truncate max-w-xs">{imageUrl}</span>
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-slate-400 font-semibold mb-1">Full Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Badge Tag</label>
                  <input
                    type="text"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    placeholder="e.g. Best Seller"
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Gender Target</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs"
                  >
                    <option value="ALL">All / Unisex</option>
                    <option value="MEN">Men</option>
                    <option value="WOMEN">Women</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4 pt-3 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(e) => setIsBestSeller(e.target.checked)}
                    className="rounded bg-slate-900 text-emerald-500"
                  />
                  <span>Mark as Best Seller</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="rounded bg-slate-900 text-emerald-500"
                  />
                  <span>Mark as Featured</span>
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
