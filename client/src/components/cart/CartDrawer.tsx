import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../../stores/cartStore';
import { formatBDT } from '@skincare/shared';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    isCartOpen,
    closeCart,
    items,
    subtotal,
    updateQuantity,
    removeItem,
    freeShippingThreshold,
  } = useCartStore();

  if (!isCartOpen) return null;

  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  const handleCheckoutClick = () => {
    closeCart();
    navigate('/checkout');
  };

  const handleViewCartClick = () => {
    closeCart();
    navigate('/cart');
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={closeCart} />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-cream-100/50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="text-brand-800" size={20} />
            <h3 className="font-serif text-lg font-bold text-charcoal-800">Your Shopping Cart</h3>
            <span className="text-xs font-semibold bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full">
              {items.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>
          <button onClick={closeCart} className="p-1 rounded-full text-gray-400 hover:text-charcoal-800 hover:bg-cream-200">
            <X size={20} />
          </button>
        </div>

        {/* Free delivery progress bar */}
        <div className="bg-cream-200/70 px-5 py-3 border-b border-cream-300/60">
          {remainingForFreeShipping > 0 ? (
            <p className="text-xs text-charcoal-800 font-medium mb-1.5 flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-500" />
              Add <span className="font-bold text-brand-800">{formatBDT(remainingForFreeShipping)}</span> more for <span className="font-bold uppercase text-brand-800">Free Delivery</span>
            </p>
          ) : (
            <p className="text-xs font-semibold text-emerald-800 mb-1.5 flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-emerald-600" />
              Congratulations! You unlocked <span className="uppercase">Free Delivery</span>
            </p>
          )}
          <div className="w-full bg-cream-300 rounded-full h-2 overflow-hidden">
            <div
              className="bg-brand-800 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-full bg-cream-200 flex items-center justify-center text-gray-400 mb-4">
                <ShoppingBag size={28} />
              </div>
              <h4 className="text-base font-bold text-charcoal-800 mb-1">Your cart is empty</h4>
              <p className="text-xs text-gray-500 mb-5 max-w-xs">
                Explore our dermatologist-tested skincare formulas for radiant, healthy skin.
              </p>
              <button
                onClick={() => {
                  closeCart();
                  navigate('/shop');
                }}
                className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Shop Best Sellers
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                <img
                  src={item.product?.image || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300'}
                  alt={item.product?.name}
                  className="w-18 h-18 object-cover rounded-xl border border-gray-100 bg-cream-50 shrink-0"
                />
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    {item.product?.brand && (
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        {item.product.brand}
                      </span>
                    )}
                    <h5 className="text-sm font-semibold text-charcoal-800 line-clamp-1 hover:text-brand-800">
                      {item.product?.name}
                    </h5>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-bold text-brand-800">
                        {formatBDT(item.unitPrice)}
                      </span>
                      {item.product?.compareAtPrice && (
                        <span className="text-xs text-gray-400 line-through">
                          {formatBDT(item.product.compareAtPrice)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity and Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-gray-200 rounded-lg bg-cream-50">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="p-1 text-gray-500 hover:text-charcoal-800 disabled:opacity-30"
                        aria-label="Decrease quantity"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="px-2.5 text-xs font-semibold text-charcoal-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-1 text-gray-500 hover:text-charcoal-800"
                        aria-label="Increase quantity"
                      >
                        <Plus size={14} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                      aria-label="Remove product"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-100 bg-cream-100/40 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-bold text-base text-charcoal-800">{formatBDT(subtotal)}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Shipping & taxes calculated at checkout. Cash on Delivery available across Bangladesh.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={handleViewCartClick}
                className="py-3 border border-brand-800 text-brand-800 hover:bg-brand-50 rounded-xl font-semibold text-xs transition-colors"
              >
                View Full Cart
              </button>
              <button
                onClick={handleCheckoutClick}
                className="py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-xl font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                <span>Checkout</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
