import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { orderService } from '../services/order.service';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { RatingStars } from '../components/common/RatingStars';
import { ProductCard } from '../components/product/ProductCard';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  CheckCircle2,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Star,
  Check,
  Sparkles,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { formatBDT } from '@skincare/shared';

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [selectedImg, setSelectedImg] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'ingredients' | 'howToUse' | 'reviews'>('description');

  // Review Form state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const addToCart = useCartStore((state) => state.addToCart);
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { user, openAuthModal } = useAuthStore();

  const { data: product, isLoading, refetch } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productService.getProductBySlug(slug || ''),
    enabled: !!slug,
  });

  const inWishlist = product ? isInWishlist(product.id) : false;

  const currentImage =
    selectedImg ||
    product?.images?.find((i) => i.isPrimary)?.url ||
    product?.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=800';

  const discountPercent =
    product?.compareAtPrice && product.compareAtPrice > product.price
      ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
      : null;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product.id, quantity);
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product.id, quantity);
    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    if (!product) return;
    setReviewSubmitting(true);
    try {
      await orderService.submitReview({
        productId: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewSuccess(true);
      refetch();
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewSuccess(false);
        setReviewTitle('');
        setReviewComment('');
      }, 1500);
    } catch (err: any) {
      alert(err.message || 'Failed to submit review');
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="aspect-square bg-cream-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 bg-cream-200 rounded w-1/4" />
            <div className="h-10 bg-cream-200 rounded w-3/4" />
            <div className="h-8 bg-cream-200 rounded w-1/3" />
            <div className="h-24 bg-cream-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-serif text-2xl font-bold text-charcoal-900">Product Not Found</h2>
        <p className="text-sm text-gray-500">The skincare product you are looking for does not exist or has been retired.</p>
        <Link to="/shop" className="inline-block px-6 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-semibold">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-16">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-gray-500">
        <Link to="/" className="hover:text-brand-800">Home</Link>
        <span>/</span>
        <Link to="/shop" className="hover:text-brand-800">Shop</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link to={`/shop?category=${product.category.slug}`} className="hover:text-brand-800">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-charcoal-800 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        {/* Left Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square bg-white rounded-3xl border border-cream-300 overflow-hidden p-6 flex items-center justify-center shadow-soft">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 px-3 py-1 text-xs uppercase font-bold tracking-wider bg-brand-800 text-white rounded-md shadow">
                {product.badge}
              </span>
            )}
            {discountPercent && (
              <span className="absolute top-4 right-4 z-10 px-3 py-1 text-xs uppercase font-bold tracking-wider bg-rose-600 text-white rounded-md shadow">
                {discountPercent}% OFF
              </span>
            )}

            <img
              src={currentImage}
              alt={product.name}
              className="w-full h-full object-contain object-center"
            />
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImg(img.url)}
                  className={`w-20 h-20 rounded-2xl border-2 overflow-hidden bg-white p-1.5 shrink-0 transition-all ${
                    currentImage === img.url ? 'border-brand-800 shadow-md' : 'border-cream-300 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={product.name} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Details Column */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            {product.brand && (
              <Link
                to={`/shop?brand=${product.brand.slug}`}
                className="text-xs uppercase font-bold tracking-widest text-brand-800 hover:underline"
              >
                {product.brand.name}
              </Link>
            )}
            <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-charcoal-900 mt-1 mb-3">
              {product.name}
            </h1>

            {/* Rating and SKU */}
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <RatingStars rating={product.averageRating || 5.0} reviewCount={product.reviewCount || 0} size={15} showScore />
              <span className="text-gray-300">|</span>
              <span className="text-gray-500">SKU: <span className="font-mono text-charcoal-800 font-semibold">{product.sku}</span></span>
              <span className="text-gray-300">|</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <Check size={14} /> In Stock ({product.stock} units)
              </span>
            </div>
          </div>

          {/* Pricing in BDT */}
          <div className="flex items-baseline gap-4 pt-2 border-t border-cream-300">
            <span className="text-3xl font-bold text-charcoal-900">{formatBDT(product.price)}</span>
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-lg text-gray-400 line-through">
                {formatBDT(product.compareAtPrice)}
              </span>
            )}
          </div>

          {/* Short Description */}
          <p className="text-sm text-gray-600 leading-relaxed">
            {product.shortDescription || product.description}
          </p>

          {/* Skin Type & Concern compatibility pills */}
          <div className="space-y-2">
            {product.skinTypes && product.skinTypes.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-gray-500">Skin Types:</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.skinTypes.map((st: any) => (
                    <span key={st.id} className="bg-cream-200 text-brand-900 font-medium px-2 py-0.5 rounded-md">
                      {st.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {product.skinConcerns && product.skinConcerns.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-gray-500">Target Concerns:</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.skinConcerns.map((sc: any) => (
                    <span key={sc.id} className="bg-amber-50 text-amber-900 font-medium px-2 py-0.5 rounded-md">
                      {sc.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quantity and Purchase Action Buttons */}
          <div className="space-y-3 pt-4 border-t border-cream-300">
            <div className="flex items-center gap-3">
              {/* Quantity Counter */}
              <div className="flex items-center border border-gray-200 rounded-xl bg-cream-50 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-gray-500 hover:text-charcoal-800"
                >
                  <Minus size={16} />
                </button>
                <span className="px-4 text-sm font-bold text-charcoal-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2 text-gray-500 hover:text-charcoal-800"
                >
                  <Plus size={16} />
                </button>
              </div>

              {/* Add to Cart */}
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className="flex-1 py-3.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95 disabled:opacity-50"
              >
                <ShoppingBag size={16} /> Add to Cart
              </button>

              {/* Wishlist */}
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-3.5 border rounded-xl transition-colors ${
                  inWishlist
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-gray-200 text-gray-500 hover:bg-cream-100'
                }`}
                aria-label="Wishlist"
              >
                <Heart size={20} className={inWishlist ? 'fill-current' : ''} />
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={handleBuyNow}
              disabled={product.stock <= 0}
              className="w-full py-3.5 bg-cream-100 hover:bg-cream-200 border border-brand-800 text-brand-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Buy Now (Instant Checkout)
            </button>
          </div>

          {/* Guarantees Box */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-cream-300 text-center">
            <div className="p-3 bg-cream-100/60 rounded-xl">
              <ShieldCheck size={20} className="text-brand-800 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-charcoal-800">100% Authentic</p>
              <p className="text-[9px] text-gray-500">Genuine Import</p>
            </div>
            <div className="p-3 bg-cream-100/60 rounded-xl">
              <Truck size={20} className="text-brand-800 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-charcoal-800">Fast BD Delivery</p>
              <p className="text-[9px] text-gray-500">24-48 Hours</p>
            </div>
            <div className="p-3 bg-cream-100/60 rounded-xl">
              <RotateCcw size={20} className="text-brand-800 mx-auto mb-1" />
              <p className="text-[11px] font-bold text-charcoal-800">Easy Returns</p>
              <p className="text-[9px] text-gray-500">7-Day Guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Product Details: Description, Ingredients, How to Use, Reviews */}
      <div className="bg-white rounded-3xl border border-cream-300 overflow-hidden shadow-sm">
        <div className="flex border-b border-gray-100 overflow-x-auto bg-cream-100/50">
          <button
            onClick={() => setActiveTab('description')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'description'
                ? 'text-brand-800 border-b-2 border-brand-800 bg-white'
                : 'text-gray-500 hover:text-charcoal-800'
            }`}
          >
            Description & Benefits
          </button>
          <button
            onClick={() => setActiveTab('ingredients')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'ingredients'
                ? 'text-brand-800 border-b-2 border-brand-800 bg-white'
                : 'text-gray-500 hover:text-charcoal-800'
            }`}
          >
            Full Ingredients List
          </button>
          <button
            onClick={() => setActiveTab('howToUse')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'howToUse'
                ? 'text-brand-800 border-b-2 border-brand-800 bg-white'
                : 'text-gray-500 hover:text-charcoal-800'
            }`}
          >
            How to Use
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-4 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === 'reviews'
                ? 'text-brand-800 border-b-2 border-brand-800 bg-white'
                : 'text-gray-500 hover:text-charcoal-800'
            }`}
          >
            Verified Reviews ({product.reviews?.length || 0})
          </button>
        </div>

        <div className="p-6 sm:p-10 text-sm leading-relaxed text-charcoal-800">
          {activeTab === 'description' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-2">Product Overview</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {product.benefits && (
                <div className="pt-4 border-t border-gray-100">
                  <h4 className="font-bold text-charcoal-900 mb-2">Key Benefits</h4>
                  <p className="text-gray-600 leading-relaxed">{product.benefits}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Formulation & Actives</h3>
              <p className="text-xs text-gray-600 bg-cream-100 p-4 rounded-xl font-mono leading-loose">
                {product.ingredients || 'Ingredients formulation data being verified from manufacturer.'}
              </p>
              <p className="text-xs text-gray-500 italic">
                Note: Ingredients may change at the manufacturer discretion. Please refer to packaging for the most up-to-date list.
              </p>
            </div>
          )}

          {activeTab === 'howToUse' && (
            <div className="space-y-4">
              <h3 className="font-serif text-xl font-bold text-charcoal-900">Application Instructions</h3>
              <p className="text-gray-600 leading-relaxed">{product.howToUse || 'Apply as directed on the label.'}</p>
              <div className="p-4 bg-brand-50 rounded-2xl border border-brand-200/60 text-xs text-brand-900 space-y-1">
                <span className="font-bold block">Dermatologist Tip:</span>
                <p>Always perform a patch test behind your ear for 24 hours prior to regular use. Apply broad spectrum sunscreen during daytime.</p>
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div>
                  <h3 className="font-serif text-xl font-bold text-charcoal-900">Customer Feedback</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <RatingStars rating={product.averageRating || 5.0} reviewCount={product.reviewCount || 0} size={16} showScore />
                  </div>
                </div>
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-semibold hover:bg-brand-900 shadow-sm"
                >
                  Write a Review
                </button>
              </div>

              {/* Reviews list */}
              {product.reviews && product.reviews.length > 0 ? (
                <div className="space-y-4">
                  {product.reviews.map((rev: any) => (
                    <div key={rev.id} className="p-4 bg-cream-50 rounded-2xl border border-cream-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-charcoal-800">{rev.userName}</span>
                          {rev.isVerifiedPurchase && (
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <CheckCircle2 size={10} /> Verified Purchase
                            </span>
                          )}
                        </div>
                        <RatingStars rating={rev.rating} size={12} />
                      </div>
                      <h4 className="font-bold text-sm text-charcoal-900">{rev.title}</h4>
                      <p className="text-xs text-gray-600">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-gray-500 text-xs">
                  No customer reviews yet. Be the first to leave a review!
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Frequently Bought Together / Routine Bundle */}
      {product.frequentlyBought && product.frequentlyBought.length > 0 && (
        <div className="bg-cream-100 rounded-3xl p-6 sm:p-8 border border-cream-300 space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="text-amber-500" size={20} />
            <h3 className="font-serif text-xl font-bold text-charcoal-900">Frequently Bought Together</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Current Product */}
            <div className="bg-white p-4 rounded-2xl border border-cream-300 text-center space-y-2">
              <img src={currentImage} alt={product.name} className="h-28 mx-auto object-contain" />
              <p className="text-xs font-semibold text-charcoal-800 line-clamp-1">{product.name}</p>
              <p className="text-sm font-bold text-brand-800">{formatBDT(product.price)}</p>
            </div>

            {/* Plus items */}
            {product.frequentlyBought.map((fItem) => (
              <div key={fItem.id} className="bg-white p-4 rounded-2xl border border-cream-300 text-center space-y-2">
                <img
                  src={fItem.images?.[0]?.url || 'https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=300'}
                  alt={fItem.name}
                  className="h-28 mx-auto object-contain"
                />
                <p className="text-xs font-semibold text-charcoal-800 line-clamp-1">{fItem.name}</p>
                <p className="text-sm font-bold text-brand-800">{formatBDT(fItem.price)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="space-y-6">
          <h3 className="font-serif text-2xl font-bold text-charcoal-900 text-center">
            You May Also Like
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsReviewModalOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 z-10 animate-in fade-in">
            <h3 className="font-serif text-xl font-bold text-charcoal-900 mb-4">Write a Product Review</h3>
            {reviewSuccess ? (
              <div className="p-6 text-center text-emerald-800 space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
                <p className="font-bold">Thank you for your review!</p>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Your Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 text-amber-400"
                      >
                        <Star size={24} className={reviewRating >= star ? 'fill-current' : 'text-gray-200'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Headline</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Cleared my skin in 2 weeks!"
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-500 mb-1">Review Comments</label>
                  <textarea
                    required
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share how this product felt, texture, results..."
                    className="w-full px-3.5 py-2 bg-cream-50 border border-cream-300 rounded-xl text-sm"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-1 py-2.5 bg-brand-800 text-white rounded-xl text-xs font-semibold disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
