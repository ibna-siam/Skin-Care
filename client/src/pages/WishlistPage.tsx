import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatBDT } from '@skincare/shared';

export const WishlistPage: React.FC = () => {
  const { items, toggleWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addToCart);

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-cream-200 text-gray-400 rounded-full flex items-center justify-center mx-auto">
          <Heart size={36} />
        </div>
        <h2 className="font-serif text-3xl font-bold text-charcoal-900">Your Wishlist is Empty</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          Save your favorite serums, cleansers, and sunscreens to monitor availability and easily add to cart later.
        </p>
        <Link
          to="/shop"
          className="inline-block px-8 py-3 bg-brand-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-brand-900"
        >
          Explore Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-charcoal-900">My Wishlist</h1>
        <p className="text-xs text-gray-500 mt-1">{items.length} saved skincare items</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-cream-300 p-4 shadow-sm space-y-3 flex flex-col justify-between">
            <div>
              <div className="relative aspect-square bg-cream-100/60 rounded-xl overflow-hidden mb-3 p-3 flex items-center justify-center">
                <img
                  src={item.product?.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400'}
                  alt={item.product?.name}
                  className="w-full h-full object-contain"
                />
                <button
                  onClick={() => toggleWishlist(item.productId || item.product?.id)}
                  className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-red-600 shadow"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {item.product?.brand && (
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                  {item.product.brand}
                </span>
              )}
              <h3 className="text-sm font-semibold text-charcoal-900 line-clamp-1">
                <Link to={`/product/${item.product?.slug}`}>{item.product?.name}</Link>
              </h3>
              <p className="text-base font-bold text-brand-800 mt-1">{formatBDT(item.product?.price || 0)}</p>
            </div>

            <button
              onClick={() => addToCart(item.productId || item.product?.id, 1)}
              className="w-full py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={14} /> Move to Cart
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
