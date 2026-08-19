import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { Product, formatBDT } from '@skincare/shared';
import { RatingStars } from '../common/RatingStars';
import { useCartStore } from '../../stores/cartStore';
import { useWishlistStore } from '../../stores/wishlistStore';
import { useUIStore } from '../../stores/uiStore';

interface ProductCardProps {
  product: Product;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, className = '' }) => {
  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const openQuickView = useUIStore((state) => state.openQuickView);

  const inWishlist = isInWishlist(product.id);
  const primaryImage = product.images?.find((img) => img.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600';
  const discountPercent = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div
      className={`group relative bg-white rounded-2xl border border-cream-300/80 p-4 flex flex-col justify-between hover:shadow-card transition-all duration-300 ${className}`}
    >
      <div>
        {/* Top Badges & Wishlist */}
        <div className="relative w-full aspect-square bg-cream-100/60 rounded-xl overflow-hidden mb-3.5 flex items-center justify-center p-3">
          {/* Badge */}
          {product.badge && (
            <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-brand-800 text-white rounded-md shadow-sm">
              {product.badge}
            </span>
          )}
          {!product.badge && discountPercent && (
            <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-rose-600 text-white rounded-md shadow-sm">
              {discountPercent}% OFF
            </span>
          )}

          {/* Wishlist Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              toggleWishlist(product.id);
            }}
            className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition-all shadow-sm ${
              inWishlist
                ? 'bg-rose-50 text-rose-600'
                : 'bg-white/80 text-gray-400 hover:text-rose-600 hover:bg-white'
            }`}
            aria-label="Add to Wishlist"
          >
            <Heart size={16} className={inWishlist ? 'fill-current' : ''} />
          </button>

          {/* Product Image */}
          <Link to={`/product/${product.slug}`} className="w-full h-full flex items-center justify-center">
            <img
              src={primaryImage}
              alt={product.name}
              className="w-full h-full object-contain object-center group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          </Link>

          {/* Quick View Button on Hover */}
          <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hidden sm:flex">
            <button
              onClick={() => openQuickView(product)}
              className="w-full py-2 bg-white/95 backdrop-blur-sm text-charcoal-800 hover:text-brand-800 hover:bg-white text-xs font-semibold rounded-lg shadow-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <Eye size={14} /> Quick View
            </button>
          </div>
        </div>

        {/* Brand */}
        {product.brand && (
          <span className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 block mb-0.5">
            {product.brand.name}
          </span>
        )}

        {/* Title */}
        <Link to={`/product/${product.slug}`}>
          <h3 className="text-sm font-semibold text-charcoal-800 hover:text-brand-800 transition-colors line-clamp-1 mb-1">
            {product.name}
          </h3>
        </Link>

        {/* Rating Stars & Count */}
        <div className="mb-2">
          <RatingStars
            rating={product.averageRating || 5.0}
            reviewCount={product.reviewCount || 0}
            size={12}
          />
        </div>
      </div>

      {/* Price and Add to Cart button (Matching reference design) */}
      <div className="pt-2 border-t border-gray-100/80">
        <div className="flex items-baseline gap-2 mb-2.5">
          <span className="text-base font-bold text-charcoal-900">
            {formatBDT(product.price)}
          </span>
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-gray-400 line-through">
              {formatBDT(product.compareAtPrice)}
            </span>
          )}
        </div>

        {/* Solid green button matching design */}
        <button
          onClick={() => addToCart(product.id, 1)}
          disabled={product.stock <= 0}
          className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold transition-all duration-200 shadow-sm flex items-center justify-center gap-1.5 active:scale-[0.98] disabled:bg-gray-200 disabled:text-gray-400"
        >
          {product.stock > 0 ? (
            <>
              <ShoppingBag size={14} /> Add to Cart
            </>
          ) : (
            'Out of Stock'
          )}
        </button>
      </div>
    </div>
  );
};
