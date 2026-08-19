import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { X, Heart, ShoppingBag, Plus, Minus, Check, ShieldCheck, Truck } from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { RatingStars } from '../common/RatingStars';
import { formatBDT } from '@skincare/shared';

export const QuickViewModal: React.FC = () => {
  const { quickViewProduct, closeQuickView } = useUIStore();
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState<string>('');

  React.useEffect(() => {
    if (quickViewProduct) {
      setQuantity(1);
      setSelectedImage(
        quickViewProduct.images?.[0]?.url ||
          'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800'
      );
    }
  }, [quickViewProduct]);

  if (!quickViewProduct) return null;

  const inWishlist = isInWishlist(quickViewProduct.id);

  const handleAddToCart = () => {
    addToCart(quickViewProduct.id, quantity);
    closeQuickView();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={closeQuickView} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-cream-300 overflow-hidden z-10 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={closeQuickView}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/80 backdrop-blur-md text-gray-500 hover:text-charcoal-800 shadow-sm"
        >
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Gallery View */}
          <div className="bg-cream-100/70 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-cream-300">
            <div className="w-full aspect-square flex items-center justify-center mb-4">
              <img
                src={selectedImage || quickViewProduct.images?.[0]?.url}
                alt={quickViewProduct.name}
                className="max-h-72 object-contain"
              />
            </div>

            {/* Thumbnails */}
            {quickViewProduct.images && quickViewProduct.images.length > 1 && (
              <div className="flex gap-2">
                {quickViewProduct.images.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(img.url)}
                    className={`w-14 h-14 rounded-xl border-2 overflow-hidden bg-white p-1 ${
                      selectedImage === img.url ? 'border-brand-800' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.url} alt="Thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between">
            <div>
              {quickViewProduct.brand && (
                <span className="text-xs uppercase font-bold tracking-wider text-brand-800">
                  {quickViewProduct.brand.name}
                </span>
              )}
              <h2 className="font-serif text-xl font-bold text-charcoal-800 mt-1 mb-2">
                {quickViewProduct.name}
              </h2>

              <div className="flex items-center gap-3 mb-3">
                <RatingStars rating={quickViewProduct.averageRating || 5} reviewCount={quickViewProduct.reviewCount || 0} />
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck size={14} /> 100% Authentic
                </span>
              </div>

              <div className="flex items-baseline gap-3 mb-4">
                <span className="text-2xl font-bold text-brand-900">{formatBDT(quickViewProduct.price)}</span>
                {quickViewProduct.compareAtPrice && quickViewProduct.compareAtPrice > quickViewProduct.price && (
                  <span className="text-sm text-gray-400 line-through">
                    {formatBDT(quickViewProduct.compareAtPrice)}
                  </span>
                )}
              </div>

              <p className="text-xs text-gray-600 leading-relaxed line-clamp-3 mb-4">
                {quickViewProduct.shortDescription || quickViewProduct.description}
              </p>

              {/* Badges / Guarantees */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-600 bg-cream-100 p-2.5 rounded-xl mb-4">
                <span className="flex items-center gap-1"><Truck size={13} className="text-brand-800" /> Fast BD Delivery</span>
                <span className="flex items-center gap-1"><Check size={13} className="text-brand-800" /> Cash on Delivery</span>
              </div>
            </div>

            {/* Quantity and Actions */}
            <div className="space-y-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center border border-gray-200 rounded-xl bg-cream-50">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-gray-500 hover:text-charcoal-800"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-3 text-sm font-semibold text-charcoal-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 text-gray-500 hover:text-charcoal-800"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                <button
                  onClick={handleAddToCart}
                  disabled={quickViewProduct.stock <= 0}
                  className="flex-1 py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-40"
                >
                  <ShoppingBag size={16} /> Add to Cart
                </button>

                <button
                  onClick={() => toggleWishlist(quickViewProduct.id)}
                  className={`p-3 border rounded-xl transition-colors ${
                    inWishlist ? 'border-rose-300 bg-rose-50 text-rose-600' : 'border-gray-200 text-gray-500 hover:bg-cream-100'
                  }`}
                  aria-label="Wishlist"
                >
                  <Heart size={18} className={inWishlist ? 'fill-current' : ''} />
                </button>
              </div>

              <Link
                to={`/product/${quickViewProduct.slug}`}
                onClick={closeQuickView}
                className="block text-center text-xs font-semibold text-brand-800 hover:underline pt-1"
              >
                View Full Product Details →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
