import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { ProductCard } from '../components/product/ProductCard';
import { Filter, X, ChevronDown, SlidersHorizontal, ArrowUpDown, Sparkles, Check } from 'lucide-react';
import { Product } from '@skincare/shared';

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Filter state extracted from URL query params
  const categoryParam = searchParams.get('category') || '';
  const brandParam = searchParams.get('brand') || '';
  const skinTypeParam = searchParams.get('skinType') || '';
  const skinConcernParam = searchParams.get('skinConcern') || '';
  const genderParam = searchParams.get('gender') || 'ALL';
  const sortParam = searchParams.get('sort') || 'featured';
  const searchParam = searchParams.get('search') || '';
  const minPriceParam = searchParams.get('minPrice') || '';
  const maxPriceParam = searchParams.get('maxPrice') || '';

  // Local price input state
  const [priceRange, setPriceRange] = useState<[number, number]>([
    minPriceParam ? parseInt(minPriceParam, 10) : 0,
    maxPriceParam ? parseInt(maxPriceParam, 10) : 3000,
  ]);

  // Fetch taxonomies, categories, and brands
  const { data: taxonomies } = useQuery({
    queryKey: ['taxonomies'],
    queryFn: () => productService.getTaxonomies(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productService.getCategories(),
  });

  const { data: brands } = useQuery({
    queryKey: ['brands'],
    queryFn: () => productService.getBrands(),
  });

  // Fetch products from backend API based on active filters
  const { data: productsData, isLoading } = useQuery({
    queryKey: ['products', categoryParam, brandParam, skinTypeParam, skinConcernParam, genderParam, sortParam, searchParam, minPriceParam, maxPriceParam],
    queryFn: () =>
      productService.getProducts({
        category: categoryParam || undefined,
        brand: brandParam || undefined,
        skinType: skinTypeParam || undefined,
        skinConcern: skinConcernParam || undefined,
        gender: genderParam !== 'ALL' ? genderParam : undefined,
        sort: sortParam || undefined,
        search: searchParam || undefined,
        minPrice: minPriceParam ? parseInt(minPriceParam, 10) : undefined,
        maxPrice: maxPriceParam ? parseInt(maxPriceParam, 10) : undefined,
      }),
  });

  const products: Product[] = productsData?.data || [];
  const totalProducts = productsData?.meta?.total || products.length;

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === null || value === '' || value === 'ALL') {
      newParams.delete(key);
    } else {
      newParams.set(key, value);
    }
    setSearchParams(newParams);
  };

  const handlePriceApply = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('minPrice', priceRange[0].toString());
    newParams.set('maxPrice', priceRange[1].toString());
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setPriceRange([0, 3000]);
  };

  const activeFilterCount = [
    categoryParam,
    brandParam,
    skinTypeParam,
    skinConcernParam,
    genderParam !== 'ALL' ? genderParam : null,
    searchParam,
    minPriceParam,
    maxPriceParam,
  ].filter(Boolean).length;

  const FilterSection = () => (
    <div className="space-y-6 text-charcoal-800">
      {/* Category filter */}
      <div>
        <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Category</h4>
        <div className="space-y-2">
          <button
            onClick={() => updateFilter('category', null)}
            className={`flex items-center justify-between w-full text-left text-xs font-medium py-1 hover:text-brand-800 ${
              !categoryParam ? 'text-brand-800 font-bold' : 'text-gray-600'
            }`}
          >
            <span>All Categories</span>
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.slug === categoryParam ? null : cat.slug)}
              className={`flex items-center justify-between w-full text-left text-xs py-1 hover:text-brand-800 ${
                categoryParam === cat.slug ? 'text-brand-800 font-bold' : 'text-gray-600'
              }`}
            >
              <span>{cat.name}</span>
              {cat.productCount !== undefined && (
                <span className="text-[10px] text-gray-400">({cat.productCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Target Gender */}
      <div className="pt-4 border-t border-cream-300">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Gender</h4>
        <div className="flex flex-wrap gap-1.5">
          {['ALL', 'MEN', 'WOMEN', 'UNISEX'].map((g) => (
            <button
              key={g}
              onClick={() => updateFilter('gender', g)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                genderParam === g
                  ? 'bg-brand-800 text-white'
                  : 'bg-cream-200 text-charcoal-800 hover:bg-cream-300'
              }`}
            >
              {g === 'ALL' ? 'All' : g === 'MEN' ? 'Men' : g === 'WOMEN' ? 'Women' : 'Unisex'}
            </button>
          ))}
        </div>
      </div>

      {/* Skin Type Filter */}
      <div className="pt-4 border-t border-cream-300">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Skin Type</h4>
        <div className="space-y-1.5">
          {taxonomies?.skinTypes.map((st) => (
            <button
              key={st.id}
              onClick={() => updateFilter('skinType', skinTypeParam === st.slug ? null : st.slug)}
              className={`flex items-center gap-2 w-full text-left text-xs py-1 hover:text-brand-800 ${
                skinTypeParam === st.slug ? 'text-brand-800 font-bold' : 'text-gray-600'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  skinTypeParam === st.slug ? 'bg-brand-800 border-brand-800 text-white' : 'border-gray-300'
                }`}
              >
                {skinTypeParam === st.slug && <Check size={10} />}
              </div>
              <span>{st.name} Skin</span>
            </button>
          ))}
        </div>
      </div>

      {/* Skin Concern Filter */}
      <div className="pt-4 border-t border-cream-300">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Skin Concern</h4>
        <div className="space-y-1.5">
          {taxonomies?.skinConcerns.map((sc) => (
            <button
              key={sc.id}
              onClick={() => updateFilter('skinConcern', skinConcernParam === sc.slug ? null : sc.slug)}
              className={`flex items-center gap-2 w-full text-left text-xs py-1 hover:text-brand-800 ${
                skinConcernParam === sc.slug ? 'text-brand-800 font-bold' : 'text-gray-600'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  skinConcernParam === sc.slug ? 'bg-brand-800 border-brand-800 text-white' : 'border-gray-300'
                }`}
              >
                {skinConcernParam === sc.slug && <Check size={10} />}
              </div>
              <span>{sc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand Filter */}
      <div className="pt-4 border-t border-cream-300">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Brand</h4>
        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {brands?.map((b) => (
            <button
              key={b.id}
              onClick={() => updateFilter('brand', brandParam === b.slug ? null : b.slug)}
              className={`flex items-center gap-2 w-full text-left text-xs py-1 hover:text-brand-800 ${
                brandParam === b.slug ? 'text-brand-800 font-bold' : 'text-gray-600'
              }`}
            >
              <div
                className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${
                  brandParam === b.slug ? 'bg-brand-800 border-brand-800 text-white' : 'border-gray-300'
                }`}
              >
                {brandParam === b.slug && <Check size={10} />}
              </div>
              <span>{b.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter (BDT) */}
      <div className="pt-4 border-t border-cream-300">
        <h4 className="font-semibold text-xs uppercase tracking-wider text-gray-500 mb-3">Price Range (BDT)</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
              placeholder="Min"
              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
            />
            <span className="text-gray-400">-</span>
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 3000])}
              placeholder="Max"
              className="w-full px-2 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
            />
          </div>
          <button
            onClick={handlePriceApply}
            className="w-full py-1.5 bg-brand-800 text-white rounded-lg text-xs font-semibold hover:bg-brand-900"
          >
            Apply Price
          </button>
        </div>
      </div>

      {activeFilterCount > 0 && (
        <button
          onClick={clearAllFilters}
          className="w-full py-2 border border-red-200 text-red-600 rounded-xl text-xs font-semibold hover:bg-red-50"
        >
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-cream-100 rounded-3xl p-6 sm:p-10 border border-cream-300/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-800">
            Catalog & Discovery
          </span>
          <h1 className="font-serif text-3xl font-bold text-charcoal-900 mt-1">
            {searchParam
              ? `Results for "${searchParam}"`
              : categoryParam
              ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Products`
              : genderParam === 'MEN'
              ? 'Men Skincare Solutions'
              : genderParam === 'WOMEN'
              ? 'Women Skincare Solutions'
              : 'All Authentic Skincare'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Showing {products.length} authentic products in Bangladesh
          </p>
        </div>

        {/* Diagnostic skin quiz shortcut pill */}
        <button
          onClick={() => (window.location.href = '/skin-guide')}
          className="px-4 py-2.5 bg-white border border-brand-800/30 text-brand-800 hover:bg-brand-50 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Sparkles size={14} className="text-amber-500" />
          <span>Find My Skin Routine</span>
        </button>
      </div>

      {/* Main Grid: Filters Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filters Sidebar */}
        <aside className="hidden lg:block lg:col-span-1 bg-white rounded-2xl border border-cream-300 p-5 h-fit sticky top-24 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-cream-300 mb-4">
            <h3 className="font-bold text-sm text-charcoal-900 flex items-center gap-1.5">
              <SlidersHorizontal size={16} /> Filters
            </h3>
            {activeFilterCount > 0 && (
              <span className="text-[11px] font-bold text-brand-800 bg-brand-50 px-2 py-0.5 rounded-full">
                {activeFilterCount} active
              </span>
            )}
          </div>
          <FilterSection />
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-5">
          {/* Controls Bar: Mobile Filter Button, Sorting */}
          <div className="bg-white rounded-2xl border border-cream-300 p-4 flex flex-wrap items-center justify-between gap-3 shadow-sm">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-cream-100 border border-cream-300 rounded-xl text-xs font-semibold text-charcoal-800"
            >
              <Filter size={14} />
              <span>Filters {activeFilterCount > 0 && `(${activeFilterCount})`}</span>
            </button>

            {/* Active search query tag */}
            {searchParam && (
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Keyword:</span>
                <span className="bg-brand-50 text-brand-800 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  {searchParam}
                  <button onClick={() => updateFilter('search', null)}>
                    <X size={12} />
                  </button>
                </span>
              </div>
            )}

            {/* Sorting Dropdown */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-500 font-medium">Sort by:</span>
              <select
                value={sortParam}
                onChange={(e) => updateFilter('sort', e.target.value)}
                className="px-3 py-1.5 bg-cream-100 border border-cream-300 rounded-xl text-xs font-semibold text-charcoal-800 focus:outline-none"
              >
                <option value="featured">Featured & Best Selling</option>
                <option value="newest">Newest Arrivals</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="discount">Biggest Discount</option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-cream-300 animate-pulse space-y-3">
                  <div className="aspect-square bg-cream-200 rounded-xl" />
                  <div className="h-4 bg-cream-200 rounded w-2/3" />
                  <div className="h-4 bg-cream-200 rounded w-1/3" />
                  <div className="h-10 bg-cream-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded-3xl border border-cream-300 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-cream-100 text-gray-400 flex items-center justify-center mx-auto">
                <Filter size={28} />
              </div>
              <h3 className="font-serif text-xl font-bold text-charcoal-900">No products match your filters</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Try selecting different skin concerns, expanding your price range, or clearing current filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-6 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-semibold hover:bg-brand-900"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl p-6 overflow-y-auto z-10 animate-in slide-in-from-left">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <h3 className="font-bold text-base text-charcoal-900">Filters</h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-1 rounded-full text-gray-400 hover:bg-cream-100">
                <X size={20} />
              </button>
            </div>
            <FilterSection />
          </div>
        </div>
      )}
    </div>
  );
};
