import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import { productService } from '../../services/product.service';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  X,
  Check,
  Package,
  Image as ImageIcon,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Sparkles,
  AlertTriangle,
  Upload,
  Layers,
  Star,
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

const STATUS_TABS = [
  { key: 'ALL', label: 'All Catalog' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'DRAFT', label: 'Draft' },
  { key: 'ARCHIVED', label: 'Archived' },
];

export const AdminProducts: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeStatus = searchParams.get('status') || 'ALL';
  const actionParam = searchParams.get('action');

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedBrand, setSelectedBrand] = useState('ALL');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Selected products for bulk actions
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Modal form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [compareAtPrice, setCompareAtPrice] = useState('');
  const [sku, setSku] = useState('');
  const [stock, setStock] = useState('30');
  const [lowStockThreshold, setLowStockThreshold] = useState('5');
  const [status, setStatus] = useState('ACTIVE');
  const [gender, setGender] = useState<'ALL' | 'MEN' | 'WOMEN' | 'UNISEX'>('ALL');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState<Array<{ url: string; altText?: string; sortOrder?: number; isPrimary?: boolean }>>([]);
  const [selectedSkinTypeIds, setSelectedSkinTypeIds] = useState<string[]>([]);
  const [selectedSkinConcernIds, setSelectedSkinConcernIds] = useState<string[]>([]);
  const [activeModalTab, setActiveModalTab] = useState<'basic' | 'details' | 'media' | 'concerns'>('basic');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isNewArrival, setIsNewArrival] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [ingredients, setIngredients] = useState('');
  const [benefits, setBenefits] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Fetch Products
  const { data: productsData, isLoading, isFetching, refetch } = useQuery({
    queryKey: [
      'admin-products',
      activeStatus,
      searchTerm,
      selectedCategory,
      selectedBrand,
      page,
      limit,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      adminService.getProducts({
        page,
        limit,
        status: activeStatus === 'ALL' ? undefined : activeStatus,
        categoryId: selectedCategory === 'ALL' ? undefined : selectedCategory,
        brandId: selectedBrand === 'ALL' ? undefined : selectedBrand,
        search: searchTerm || undefined,
        sortBy,
        sortOrder,
      }),
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

  // Fetch Taxonomies (Skin Types & Target Concerns)
  const { data: taxonomies } = useQuery({
    queryKey: ['taxonomies'],
    queryFn: () => productService.getTaxonomies(),
  });

  const skinTypes = taxonomies?.skinTypes || [
    { id: 'st-normal', name: 'Normal Skin', slug: 'normal' },
    { id: 'st-dry', name: 'Dry Skin', slug: 'dry' },
    { id: 'st-oily', name: 'Oily Skin', slug: 'oily' },
    { id: 'st-combination', name: 'Combination Skin', slug: 'combination' },
    { id: 'st-sensitive', name: 'Sensitive Skin', slug: 'sensitive' },
  ];

  const skinConcerns = taxonomies?.skinConcerns || [
    { id: 'sc-acne', name: 'Acne & Blemishes', slug: 'acne' },
    { id: 'sc-dryness', name: 'Dryness & Dehydration', slug: 'dryness' },
    { id: 'sc-dark-spots', name: 'Dark Spots & Pigmentation', slug: 'dark-spots' },
    { id: 'sc-dullness', name: 'Dullness & Uneven Tone', slug: 'dullness' },
    { id: 'sc-aging', name: 'Anti-Aging & Fine Lines', slug: 'aging' },
    { id: 'sc-pores', name: 'Large Pores & Oiliness', slug: 'pores' },
    { id: 'sc-sensitivity', name: 'Redness & Irritation', slug: 'sensitivity' },
  ];

  // Automatically open modal if requested in URL (e.g. from quick actions)
  React.useEffect(() => {
    if (actionParam === 'create') {
      handleOpenCreate();
      searchParams.delete('action');
      setSearchParams(searchParams);
    }
  }, [actionParam]);

  const products = productsData?.data || [];
  const meta = productsData?.meta || (productsData as any)?.pagination || {
    total: 0,
    totalPages: 1,
    countsByStatus: {},
  };
  const countsByStatus = meta.countsByStatus || {};

  // Create/Update Product Mutation
  const saveMutation = useMutation({
    mutationFn: (productPayload: any) => {
      if (editingProductId) {
        return adminService.updateProduct(editingProductId, productPayload);
      }
      return adminService.createProduct(productPayload);
    },
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  // Bulk Status Mutation
  const bulkMutation = useMutation({
    mutationFn: (newStatus: string) =>
      adminService.bulkUpdateProducts(selectedProductIds, newStatus),
    onSuccess: () => {
      setSelectedProductIds([]);
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });

  const handleOpenCreate = () => {
    setEditingProductId(null);
    setName('');
    setBrandId(brands[0]?.id || '');
    setCategoryId(categories[0]?.id || '');
    setPrice('');
    setCompareAtPrice('');
    setSku(`SKN-${Math.floor(1000 + Math.random() * 9000)}`);
    setStock('30');
    setLowStockThreshold('5');
    setStatus('ACTIVE');
    setGender('ALL');
    setDescription('');
    setShortDescription('');
    setCountryOfOrigin('South Korea');
    setImageUrl('');
    setImagesList([
      { url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop', isPrimary: true, sortOrder: 0 }
    ]);
    setSelectedSkinTypeIds([]);
    setSelectedSkinConcernIds([]);
    setActiveModalTab('basic');
    setBadge('');
    setIsBestSeller(false);
    setIsFeatured(false);
    setIsNewArrival(true);
    setIsTrending(false);
    setIngredients('');
    setBenefits('');
    setHowToUse('');
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
    setLowStockThreshold(p.lowStockThreshold ? p.lowStockThreshold.toString() : '5');
    setStatus(p.status);
    setGender(p.gender || 'ALL');
    setDescription(p.description || '');
    setShortDescription(p.shortDescription || '');
    setCountryOfOrigin(p.countryOfOrigin || '');
    setImagesList(p.images && p.images.length > 0 ? p.images : [{ url: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800', isPrimary: true, sortOrder: 0 }]);
    setSelectedSkinTypeIds((p.skinTypes || []).map((st: any) => st.id));
    setSelectedSkinConcernIds((p.skinConcerns || []).map((sc: any) => sc.id));
    setActiveModalTab('basic');
    setBadge(p.badge || '');
    setIsBestSeller(p.isBestSeller || false);
    setIsFeatured(p.isFeatured || false);
    setIsNewArrival(p.isNewArrival || false);
    setIsTrending(p.isTrending || false);
    setIngredients(p.ingredients || '');
    setBenefits(p.benefits || '');
    setHowToUse(p.howToUse || '');
    setIsModalOpen(true);
  };

  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingImage(true);
      const url = await adminService.uploadImage(file, 'products');
      if (url) {
        setImagesList((prev) => [
          ...prev,
          { url, isPrimary: prev.length === 0, sortOrder: prev.length, altText: name },
        ]);
      }
    } catch (error: any) {
      alert(error.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setImagesList((prev) => [
      ...prev,
      { url: newImageUrl.trim(), isPrimary: prev.length === 0, sortOrder: prev.length, altText: name },
    ]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    setImagesList((prev) =>
      prev.map((img, idx) => ({
        ...img,
        isPrimary: idx === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    setImagesList((prev) => {
      const filtered = prev.filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((img) => img.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return filtered;
    });
  };

  const toggleSkinType = (id: string) => {
    setSelectedSkinTypeIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSkinConcern = (id: string) => {
    setSelectedSkinConcernIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !sku || !brandId || !categoryId) {
      alert('Please provide Product Title, Brand, Category, SKU, and Price.');
      return;
    }

    const payload: any = {
      name,
      brandId,
      categoryId,
      price: parseFloat(price),
      compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
      sku,
      stock: parseInt(stock, 10),
      lowStockThreshold: parseInt(lowStockThreshold, 10),
      status,
      gender,
      countryOfOrigin: countryOfOrigin || null,
      description: description || name,
      shortDescription,
      badge: badge || undefined,
      isBestSeller,
      isFeatured,
      isNewArrival,
      isTrending,
      ingredients,
      benefits,
      howToUse,
      images: imagesList.length > 0
        ? imagesList.map((img, idx) => ({
            url: img.url,
            altText: img.altText || name,
            sortOrder: idx,
            isPrimary: img.isPrimary ?? (idx === 0),
          }))
        : [{ url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800', isPrimary: true, sortOrder: 0, altText: name }],
      skinTypeIds: selectedSkinTypeIds,
      skinConcernIds: selectedSkinConcernIds,
    };

    saveMutation.mutate(payload);
  };

  const handleStatusTabChange = (st: string) => {
    if (st === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', st);
    }
    setSearchParams(searchParams);
    setPage(1);
    setSelectedProductIds([]);
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedProductIds(products.map((p: any) => p.id));
    } else {
      setSelectedProductIds([]);
    }
  };

  const handleSelectRow = (productId: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const toggleSort = (col: string) => {
    if (sortBy === col) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(col);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Package size={24} className="text-emerald-400" />
            Product Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, manage pricing, SKU inventory, and marketing attributes for skincare products.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adminService.exportProductsCsv()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl text-xs font-semibold transition-colors"
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-all"
          >
            <Plus size={15} />
            <span>Add Product</span>
          </button>

          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-xl transition-colors disabled:opacity-50"
            title="Refresh products"
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin text-emerald-400' : ''} />
          </button>
        </div>
      </div>

      {/* Status Tabs Navigation */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 border-b border-slate-800/80 custom-scrollbar">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.key;
          const count = tab.key === 'ALL' ? meta.total : countsByStatus[tab.key] ?? 0;

          return (
            <button
              key={tab.key}
              onClick={() => handleStatusTabChange(tab.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filters Toolbar */}
      <div className="bg-slate-900/80 border border-slate-800 p-4 rounded-2xl space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              placeholder="Search product name, SKU..."
              className="w-full bg-slate-950/60 border border-slate-800 text-slate-200 pl-9 pr-3 py-2 rounded-xl text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Category: All</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Brand Filter */}
          <select
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setPage(1);
            }}
            className="w-full bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">Brand: All</option>
            {brands.map((b: any) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          {/* Page Size */}
          <div className="flex items-center justify-end gap-2">
            <span className="text-xs text-slate-400">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(Number(e.target.value));
                setPage(1);
              }}
              className="bg-slate-950/60 border border-slate-800 text-slate-300 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="10">10 / page</option>
              <option value="20">20 / page</option>
              <option value="50">50 / page</option>
              <option value="100">100 / page</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Bar */}
        {selectedProductIds.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded-xl animate-in fade-in duration-150">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-xs font-semibold text-emerald-300">
                {selectedProductIds.length} products selected
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => bulkMutation.mutate('ACTIVE')}
                disabled={bulkMutation.isPending}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Publish (Active)
              </button>
              <button
                onClick={() => bulkMutation.mutate('DRAFT')}
                disabled={bulkMutation.isPending}
                className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Unpublish (Draft)
              </button>
              <button
                onClick={() => bulkMutation.mutate('ARCHIVED')}
                disabled={bulkMutation.isPending}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
              >
                Archive
              </button>
              <button
                onClick={() => setSelectedProductIds([])}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition-colors"
              >
                Deselect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider">
              <tr>
                <th className="py-3.5 pl-4 pr-2 w-10">
                  <input
                    type="checkbox"
                    checked={products.length > 0 && selectedProductIds.length === products.length}
                    onChange={handleSelectAll}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                  />
                </th>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3.5 px-3 cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center gap-1">
                    <span>Product & SKU</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3.5 px-3">Brand / Category</th>
                <th
                  onClick={() => toggleSort('price')}
                  className="py-3.5 px-3 text-right cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Price</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('stock')}
                  className="py-3.5 px-3 text-center cursor-pointer hover:text-slate-200"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Stock</span>
                    <ArrowUpDown size={11} />
                  </div>
                </th>
                <th className="py-3.5 px-3 text-center">Badges</th>
                <th className="py-3.5 px-3 text-center">Status</th>
                <th className="py-3.5 pr-4 pl-2 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs font-mono">Loading product catalog...</p>
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400 space-y-2">
                    <Package size={28} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-300">No products found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                products.map((p: any) => {
                  const isSelected = selectedProductIds.includes(p.id);
                  const firstImg = p.images?.[0]?.url;

                  return (
                    <tr
                      key={p.id}
                      className={`hover:bg-slate-800/40 transition-colors group ${
                        isSelected ? 'bg-emerald-950/20' : ''
                      }`}
                    >
                      <td className="py-3 pl-4 pr-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(p.id)}
                          className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-900"
                        />
                      </td>

                      <td className="py-3 px-3 flex items-center gap-3">
                        {firstImg ? (
                          <img
                            src={firstImg}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                            <Package size={16} />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-slate-200 truncate group-hover:text-emerald-400 transition-colors">
                            {p.name}
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">{p.sku}</span>
                        </div>
                      </td>

                      <td className="py-3 px-3 text-slate-400">
                        <p className="text-slate-300 font-medium">{p.brand?.name || '—'}</p>
                        <span className="text-[10px] text-slate-400">{p.category?.name || '—'}</span>
                      </td>

                      <td className="py-3 px-3 text-right">
                        <p className="font-bold text-slate-100">{formatBDT(p.price)}</p>
                        {p.compareAtPrice && p.compareAtPrice > p.price && (
                          <span className="text-[10px] text-slate-400 line-through">
                            {formatBDT(p.compareAtPrice)}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                            p.stock <= 0
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : p.stock <= 5
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {p.stock} in stock
                        </span>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {p.isBestSeller && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 text-[9px] font-bold uppercase">
                              Best Seller
                            </span>
                          )}
                          {p.isFeatured && (
                            <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400 text-[9px] font-bold uppercase">
                              Featured
                            </span>
                          )}
                          {p.isNewArrival && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-400 text-[9px] font-bold uppercase">
                              New
                            </span>
                          )}
                          {p.badge && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 text-[9px] font-bold uppercase">
                              {p.badge}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono ${
                            p.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : p.status === 'DRAFT'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>

                      <td className="py-3 pr-4 pl-2 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 rounded-lg transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Archive product "${p.name}"?`)) {
                                deleteMutation.mutate(p.id);
                              }
                            }}
                            className="p-1.5 bg-slate-800 hover:bg-rose-900/60 hover:text-rose-400 text-slate-300 rounded-lg transition-colors"
                            title="Archive / Delete"
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

        {/* Pagination Footer */}
        <div className="px-5 py-4 border-t border-slate-800/80 bg-slate-950/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{(page - 1) * limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(page * limit, meta.total)}</span> of{' '}
            <span className="font-semibold text-slate-200">{meta.total}</span> products
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="font-mono px-2">
              Page {page} of {meta.totalPages || 1}
            </span>
            <button
              onClick={() => setPage((prev) => Math.min(meta.totalPages || 1, prev + 1))}
              disabled={page >= meta.totalPages}
              className="p-2 bg-slate-900 border border-slate-800 text-slate-300 rounded-xl hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Create / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl text-slate-100 my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-800 p-6 pb-4 shrink-0">
              <div className="flex items-center gap-2">
                <Package className="text-emerald-400" size={22} />
                <div>
                  <h3 className="text-base font-bold text-slate-100">
                    {editingProductId ? 'Edit Skincare Product' : 'Add New Skincare Product'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Complete all product details, images, and taxonomy classifications</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 px-6 border-b border-slate-800/80 bg-slate-950/40 shrink-0 overflow-x-auto py-2">
              {[
                { id: 'basic', label: '1. Basic Info & Pricing' },
                { id: 'details', label: '2. Clinical Details & Usage' },
                { id: 'concerns', label: `3. Skin Types & Concerns (${selectedSkinTypeIds.length + selectedSkinConcernIds.length})` },
                { id: 'media', label: `4. Multi-Image Gallery (${imagesList.length})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveModalTab(tab.id as any)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeModalTab === tab.id
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              {/* TAB 1: BASIC INFO & PRICING */}
              {activeModalTab === 'basic' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Title & SKU */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Product Title *</label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. CeraVe Foaming Facial Cleanser 236ml"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">SKU *</label>
                      <input
                        type="text"
                        required
                        value={sku}
                        onChange={(e) => setSku(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Brand, Category, Gender, Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Brand *</label>
                      <select
                        value={brandId}
                        onChange={(e) => setBrandId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        {brands.map((b: any) => (
                          <option key={b.id} value={b.id}>
                            {b.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Category *</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        {categories.map((c: any) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Gender</label>
                      <select
                        value={gender}
                        onChange={(e) => setGender(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ALL">All (Unisex)</option>
                        <option value="MEN">Men / Grooming</option>
                        <option value="WOMEN">Women</option>
                        <option value="UNISEX">Unisex</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Status</label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      >
                        <option value="ACTIVE">Active (Live on Store)</option>
                        <option value="DRAFT">Draft (Hidden)</option>
                        <option value="ARCHIVED">Archived</option>
                      </select>
                    </div>
                  </div>

                  {/* Pricing & Inventory */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Regular Price (৳) *</label>
                      <input
                        type="number"
                        step="any"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="1250"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Compare-at Price (৳)</label>
                      <input
                        type="number"
                        step="any"
                        value={compareAtPrice}
                        onChange={(e) => setCompareAtPrice(e.target.value)}
                        placeholder="1450"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Stock Quantity *</label>
                      <input
                        type="number"
                        required
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Low Stock Alert Level</label>
                      <input
                        type="number"
                        value={lowStockThreshold}
                        onChange={(e) => setLowStockThreshold(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* Country of Origin & Badge */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Country of Origin</label>
                      <input
                        type="text"
                        value={countryOfOrigin}
                        onChange={(e) => setCountryOfOrigin(e.target.value)}
                        placeholder="e.g. South Korea, USA, France, Japan"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Custom Promo Badge Text</label>
                      <input
                        type="text"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        placeholder="e.g. 20% OFF, DERMATOLOGIST TESTED"
                        className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Badges & Marketing Flags */}
                  <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-2">
                    <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider font-mono">
                      Merchandising & Showcase Flags
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <input
                          type="checkbox"
                          checked={isFeatured}
                          onChange={(e) => setIsFeatured(e.target.checked)}
                          className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-300 font-medium text-xs">Featured Product</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <input
                          type="checkbox"
                          checked={isBestSeller}
                          onChange={(e) => setIsBestSeller(e.target.checked)}
                          className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-300 font-medium text-xs">Best Seller</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <input
                          type="checkbox"
                          checked={isNewArrival}
                          onChange={(e) => setIsNewArrival(e.target.checked)}
                          className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-300 font-medium text-xs">New Arrival</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer p-2 rounded-xl bg-slate-900 border border-slate-800">
                        <input
                          type="checkbox"
                          checked={isTrending}
                          onChange={(e) => setIsTrending(e.target.checked)}
                          className="rounded bg-slate-800 border-slate-700 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-slate-300 font-medium text-xs">Trending Now</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLINICAL DETAILS & USAGE */}
              {activeModalTab === 'details' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Short Description (Summary Card)</label>
                    <input
                      type="text"
                      value={shortDescription}
                      onChange={(e) => setShortDescription(e.target.value)}
                      placeholder="e.g. Daily hydrating foaming cleanser with 3 essential ceramides and hyaluronic acid."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Key Benefits (Bullet Points / Highlights)</label>
                    <textarea
                      rows={2}
                      value={benefits}
                      onChange={(e) => setBenefits(e.target.value)}
                      placeholder="• Gently cleanses without disrupting skin barrier&#10;• Formulated with 3 essential ceramides&#10;• Non-comedogenic and fragrance-free"
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">How to Use (Application Instructions)</label>
                    <textarea
                      rows={2}
                      value={howToUse}
                      onChange={(e) => setHowToUse(e.target.value)}
                      placeholder="Wet skin with lukewarm water. Massage cleanser into skin in a gentle, circular motion. Rinse well and pat dry."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Ingredients (INCI List)</label>
                    <textarea
                      rows={3}
                      value={ingredients}
                      onChange={(e) => setIngredients(e.target.value)}
                      placeholder="Aqua / Water / Eau, Cocamidopropyl Hydroxysultaine, Glycerin, Niacinamide, Sodium Hyaluronate, Ceramide NP, Ceramide AP, Ceramide EOP..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Detailed Product Description</label>
                    <textarea
                      rows={4}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Complete product details, manufacturer background, clinical testing notes, and dermatological properties..."
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {/* TAB 3: SKIN TYPES & TARGET CONCERNS */}
              {activeModalTab === 'concerns' && (
                <div className="space-y-6 animate-in fade-in duration-150">
                  {/* Skin Types */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Sparkles size={14} className="text-emerald-400" /> Suitable Skin Types
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {selectedSkinTypeIds.length} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {skinTypes.map((st: any) => {
                        const isSelected = selectedSkinTypeIds.includes(st.id);
                        return (
                          <button
                            key={st.id}
                            type="button"
                            onClick={() => toggleSkinType(st.id)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <span className="font-semibold text-xs">{st.name}</span>
                            {isSelected && <Check size={14} className="text-emerald-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Skin Concerns */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                        <Sparkles size={14} className="text-amber-400" /> Target Skin Concerns
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {selectedSkinConcernIds.length} selected
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {skinConcerns.map((sc: any) => {
                        const isSelected = selectedSkinConcernIds.includes(sc.id);
                        return (
                          <button
                            key={sc.id}
                            type="button"
                            onClick={() => toggleSkinConcern(sc.id)}
                            className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                              isSelected
                                ? 'bg-amber-500/15 border-amber-500/40 text-amber-300'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                            }`}
                          >
                            <span className="font-semibold text-xs">{sc.name}</span>
                            {isSelected && <Check size={14} className="text-amber-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: MULTI-IMAGE GALLERY */}
              {activeModalTab === 'media' && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* Upload Actions */}
                  <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3">
                    <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
                      <ImageIcon size={14} className="text-emerald-400" /> Add Product Media
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Upload from PC */}
                      <label className="cursor-pointer flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-slate-700 hover:border-emerald-500/50 bg-slate-900 hover:bg-slate-800/80 text-slate-300 hover:text-emerald-400 transition-colors">
                        <Upload size={16} />
                        <span className="font-semibold">{isUploadingImage ? 'Uploading Image...' : 'Upload Image from PC'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingImage}
                          onChange={handleUploadImageFile}
                        />
                      </label>

                      {/* Paste URL */}
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Paste image URL..."
                          className="flex-1 bg-slate-900 border border-slate-800 text-slate-100 px-3 py-2 rounded-xl focus:outline-none focus:border-emerald-500 text-xs"
                        />
                        <button
                          type="button"
                          onClick={handleAddImageUrl}
                          disabled={!newImageUrl.trim()}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white rounded-xl font-semibold transition-colors shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Presets */}
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="text-[10px] text-slate-400">Presets:</span>
                      {[
                        { label: 'Cleanser', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800&auto=format&fit=crop' },
                        { label: 'Serum', url: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop' },
                        { label: 'Moisturizer', url: 'https://images.unsplash.com/photo-1556228722-d0b5b244719c?q=80&w=800&auto=format&fit=crop' },
                        { label: 'Sunscreen', url: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=800&auto=format&fit=crop' },
                        { label: 'Toner', url: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?q=80&w=800&auto=format&fit=crop' },
                      ].map((s) => (
                        <button
                          key={s.label}
                          type="button"
                          onClick={() => {
                            setImagesList((prev) => [
                              ...prev,
                              { url: s.url, isPrimary: prev.length === 0, sortOrder: prev.length, altText: name },
                            ]);
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-emerald-400 font-mono"
                        >
                          + {s.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded Images List */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block">
                      Uploaded Images ({imagesList.length}) - Select Primary Image:
                    </span>

                    {imagesList.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl text-slate-500">
                        No product images attached yet. Add at least one image above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {imagesList.map((img, idx) => (
                          <div
                            key={idx}
                            className={`group relative p-2.5 rounded-2xl border transition-all flex flex-col justify-between ${
                              img.isPrimary
                                ? 'bg-emerald-500/10 border-emerald-500/50 ring-1 ring-emerald-500/30'
                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-2 bg-slate-900">
                              <img src={img.url} alt={`Product image ${idx + 1}`} className="w-full h-full object-cover" />
                              {img.isPrimary && (
                                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-bold shadow flex items-center gap-1">
                                  <Star size={10} className="fill-white" /> Primary
                                </span>
                              )}
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-1">
                              {!img.isPrimary ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(idx)}
                                  className="text-[10px] text-emerald-400 hover:underline font-semibold"
                                >
                                  Set Primary
                                </button>
                              ) : (
                                <span className="text-[10px] text-emerald-400 font-bold">Primary Cover</span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleRemoveImage(idx)}
                                className="p-1 rounded-lg text-rose-400 hover:bg-rose-500/20 transition-colors"
                                title="Remove Image"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={saveMutation.isPending}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {saveMutation.isPending ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Saving Product...
                      </>
                    ) : editingProductId ? (
                      'Update Product'
                    ) : (
                      'Create Product'
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
