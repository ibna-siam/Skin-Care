import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowRight, Sparkles, TrendingUp } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { productService } from '../../services/product.service';
import { formatBDT } from '@skincare/shared';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, closeSearch } = useUIStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{ products: any[]; brands: any[]; categories: any[] }>({
    products: [],
    brands: [],
    categories: [],
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setSuggestions({ products: [], brands: [], categories: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const data = await productService.getSearchSuggestions(query);
        if (data) setSuggestions(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    closeSearch();
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
  };

  const handleItemClick = (path: string) => {
    closeSearch();
    navigate(path);
  };

  if (!isSearchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={closeSearch} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-cream-300 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-gray-100 p-4">
          <Search size={22} className="text-gray-400 ml-2" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, brands (CeraVe, The Ordinary), concerns..."
            className="w-full px-4 py-2 text-base text-charcoal-800 placeholder-gray-400 bg-transparent focus:outline-none"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 mr-2">
              <X size={18} />
            </button>
          )}
          <button type="button" onClick={closeSearch} className="text-xs font-semibold text-gray-500 hover:text-charcoal-800 px-2.5 py-1.5 bg-cream-200 rounded-lg">
            ESC
          </button>
        </form>

        {/* Results / Autocomplete */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <div className="py-6 text-center text-sm text-gray-500">
              Searching skincare catalog...
            </div>
          )}

          {!isLoading && query.length >= 2 && suggestions.products.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-charcoal-800">No matching products found</p>
              <p className="text-xs text-gray-500 mt-1">Try searching for "CeraVe", "Serum", "Cleanser", or "Acne"</p>
            </div>
          )}

          {/* Product suggestions */}
          {suggestions.products.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Products</p>
              <div className="space-y-1.5">
                {suggestions.products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleItemClick(`/product/${product.slug}`)}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-cream-100 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      {product.images?.[0]?.url && (
                        <img
                          src={product.images[0].url}
                          alt={product.name}
                          className="w-10 h-10 object-cover rounded-lg border border-gray-100"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-charcoal-800 hover:text-brand-800">{product.name}</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-brand-800">{formatBDT(product.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Brand suggestions */}
          {suggestions.brands.length > 0 && (
            <div className="pt-2 border-t border-gray-100">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Brands</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.brands.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleItemClick(`/shop?brand=${b.slug}`)}
                    className="px-3 py-1.5 bg-cream-200 hover:bg-brand-50 hover:text-brand-800 rounded-lg text-xs font-semibold text-charcoal-800 transition-colors"
                  >
                    {b.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Default Popular searches when input is empty */}
          {!query && (
            <div className="py-2 space-y-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                  <TrendingUp size={14} className="text-brand-800" /> Popular Searches in BD
                </p>
                <div className="flex flex-wrap gap-2">
                  {['CeraVe Foaming Cleanser', 'The Ordinary Niacinamide', 'Minimalist Vitamin C', 'COSRX Snail Mucin', 'Beauty of Joseon Sunscreen', 'WOW Aloe Vera Gel', 'Acne Treatments'].map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setQuery(item);
                      }}
                      className="px-3 py-1.5 bg-cream-200 hover:bg-cream-300 text-xs font-medium text-charcoal-800 rounded-full transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
