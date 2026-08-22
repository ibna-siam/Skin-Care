import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productService } from '../services/product.service';
import { orderService } from '../services/order.service';
import { publicMediaService } from '../services/admin.service';
import { ProductCard } from '../components/product/ProductCard';
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Search,
  Star,
  CheckCircle2,
  PhoneCall,
  Mail,
  Send,
  Loader2,
  Lock,
  Clock,
} from 'lucide-react';
import { Product } from '@skincare/shared';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSuccess, setNewsletterSuccess] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);

  // Carousel Slide State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);

  // Showcase Product Tabs State ('best_sellers' | 'featured' | 'new_arrivals')
  const [productTab, setProductTab] = useState<'best_sellers' | 'featured' | 'new_arrivals'>('best_sellers');

  // Fetch Best Seller Products from real API
  const { data: productsData, isLoading: isProductsLoading } = useQuery({
    queryKey: ['home-best-sellers'],
    queryFn: () => productService.getProducts({ isBestSeller: 'true', limit: 4 }),
  });

  // Fetch Featured Products from real API
  const { data: featuredData, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['home-featured-products'],
    queryFn: () => productService.getProducts({ isFeatured: 'true', limit: 4 }),
  });

  // Fetch New Arrivals from real API
  const { data: newArrivalsData, isLoading: isNewArrivalsLoading } = useQuery({
    queryKey: ['home-new-arrivals'],
    queryFn: () => productService.getProducts({ isNewArrival: 'true', limit: 4 }),
  });

  // Fetch Dynamic Website Media Slots (Zero-Code Image Management)
  const { data: mediaSlots = {} } = useQuery({
    queryKey: ['public-media-slots'],
    queryFn: () => publicMediaService.getSlots(),
  });

  // Fetch Public Banners for HERO and PROMO positions
  const { data: heroBanners = [] } = useQuery({
    queryKey: ['public-hero-banners'],
    queryFn: () => orderService.getPublicBanners('HERO'),
  });

  const { data: promoBanners = [] } = useQuery({
    queryKey: ['public-promo-banners'],
    queryFn: () => orderService.getPublicBanners('PROMO'),
  });

  // Fetch Featured Customer Reviews from real API
  const { data: reviewsData } = useQuery({
    queryKey: ['featured-reviews'],
    queryFn: () => productService.getFeaturedReviews(),
  });

  // Fetch Homepage CMS Sections
  const { data: cmsSections = [] } = useQuery({
    queryKey: ['homepage-cms'],
    queryFn: () => orderService.getHomepageCMS(),
  });

  const getCms = (key: string) => cmsSections.find((s: any) => s.sectionKey === key);

  const heroSection = getCms('hero');
  const heroTitle = heroSection?.title || 'Original Skincare for Real Skin';
  const heroSubtitle = heroSection?.subtitle || 'Trusted brands. 100% authentic.';
  const heroImageUrl =
    mediaSlots['homepage.hero']?.url ||
    heroSection?.imageUrl ||
    'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?q=80&w=1600&auto=format&fit=crop';
  const heroAltText = mediaSlots['homepage.hero']?.altText || 'Original Skincare for Real Skin';

  const categoryCardsSection = getCms('category_cards');
  const bestSellersSection = getCms('best_sellers');
  const whyChooseUsSection = getCms('why_choose_us');
  const skinQuizSection = getCms('skin_quiz_banner') || getCms('promo_banner');
  const reviewsSection = getCms('customer_reviews');
  const newsletterSection = getCms('newsletter');

  // Build Hero Banner Carousel Slides from Admin Banners / CMS / Fallback
  const heroSlides = useMemo(() => {
    if (heroBanners && heroBanners.length > 0) {
      return heroBanners.map((b: any, idx: number) => ({
        id: b.id || `banner-${idx}`,
        title: b.title || heroTitle,
        subtitle: b.subtitle || heroSubtitle,
        imageUrl: b.imageUrl || heroImageUrl,
        linkUrl: b.linkUrl || '/shop',
        buttonText: b.buttonText || (idx === 0 ? 'Shop Men' : 'Explore Now'),
        secondaryButtonText: idx === 0 ? 'Shop Women' : undefined,
        secondaryButtonLink: idx === 0 ? '/shop/women' : undefined,
      }));
    }

    // Default 3 rich slides from CMS & Brand assets
    return [
      {
        id: 'slide-1',
        title: heroTitle,
        subtitle: heroSubtitle,
        imageUrl: heroImageUrl,
        linkUrl: '/shop/men',
        buttonText: 'Shop Men',
        secondaryButtonText: 'Shop Women',
        secondaryButtonLink: '/shop/women',
      },
      {
        id: 'slide-2',
        title: 'Authentic Korean & Japanese Formulas',
        subtitle: 'Targeted serums, ampoules, and essences clinically formulated for deep hydration and radiance.',
        imageUrl: mediaSlots['homepage.promo_banner']?.url || 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=1600&auto=format&fit=crop',
        linkUrl: '/shop?category=serum',
        buttonText: 'Explore Serums',
        secondaryButtonText: 'View All Skincare',
        secondaryButtonLink: '/shop',
      },
      {
        id: 'slide-3',
        title: 'Dermatologist-Approved Sun Protection',
        subtitle: 'Broad-spectrum SPF 50+ PA++++ lightweight formulations tailored for Bangladesh humid weather.',
        imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop',
        linkUrl: '/shop?category=sunscreen',
        buttonText: 'Shop Sun Care',
        secondaryButtonText: 'Skin Quiz Guide',
        secondaryButtonLink: '/skin-guide',
      },
    ];
  }, [heroBanners, heroTitle, heroSubtitle, heroImageUrl, mediaSlots]);

  // Auto-advance Carousel every 5.5 seconds
  useEffect(() => {
    if (isSlidePaused || heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isSlidePaused, heroSlides.length]);

  const prevHeroSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? heroSlides.length - 1 : prev - 1));
  };

  const nextHeroSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  };

  const activeSlide = heroSlides[currentSlide] || heroSlides[0];

  // Active showcase products based on active tab
  const bestSellerProducts: Product[] = productsData?.data || [];
  const featuredProducts: Product[] = featuredData?.data || [];
  const newArrivalProducts: Product[] = newArrivalsData?.data || [];

  const displayProducts = useMemo(() => {
    if (productTab === 'featured') {
      return featuredProducts.length > 0 ? featuredProducts : bestSellerProducts;
    }
    if (productTab === 'new_arrivals') {
      return newArrivalProducts.length > 0 ? newArrivalProducts : bestSellerProducts;
    }
    return bestSellerProducts;
  }, [productTab, featuredProducts, newArrivalProducts, bestSellerProducts]);

  const isCurrentProductLoading =
    productTab === 'featured'
      ? isFeaturedLoading
      : productTab === 'new_arrivals'
      ? isNewArrivalsLoading
      : isProductsLoading;

  const reviews = reviewsData && reviewsData.length > 0 ? reviewsData : [
    {
      id: '1',
      userName: 'Ayesha Rahman',
      userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200&auto=format&fit=crop',
      rating: 5,
      comment: '"My skin was hyper-pigmented from sun exposure. The Minimalist Vitamin C serum cleared it within 3 weeks. Genuine, fast delivery in Dhaka."',
      isVerifiedPurchase: true,
      product: { name: 'Minimalist Vitamin C' },
    },
    {
      id: '2',
      userName: 'Rafi Ahmed',
      userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop',
      rating: 5,
      comment: '"The CeraVe cleanser worked wonders for my oily skin without causing irritation. Finally an authentic source in Bangladesh where I can trust the products."',
      isVerifiedPurchase: true,
      product: { name: 'CeraVe Foaming Cleanser' },
    },
    {
      id: '3',
      userName: 'Farhana Islam',
      userAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop',
      rating: 5,
      comment: '"I always had doubt about fake products in BD until I found this store. Customer service helped match my exact skin type routines. Highly recommended!"',
      isVerifiedPurchase: true,
      product: { name: 'Beauty of Joseon Sunscreen' },
    },
  ];

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    try {
      await orderService.subscribeNewsletter(newsletterEmail);
      setNewsletterSuccess(true);
      setNewsletterEmail('');
    } catch {
      alert('Thank you for subscribing!');
      setNewsletterSuccess(true);
    }
  };

  // Active Promo Banner from DB Banner or CMS
  const activePromoBanner = promoBanners?.[0] || null;

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* ========================================================================= */}
      {/* 1. HERO BANNER CAROUSEL (Controlled by Admin CMS & Banners) */}
      {/* ========================================================================= */}
      {heroSection?.isActive !== false && (
        <section
          className="relative overflow-hidden bg-cream-200 pt-6 pb-12 sm:pb-16 group"
          onMouseEnter={() => setIsSlidePaused(true)}
          onMouseLeave={() => setIsSlidePaused(false)}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[380px] sm:min-h-[440px]">
              {/* Left Content */}
              <div className="lg:col-span-5 space-y-6 z-10 animate-in fade-in duration-300 key={activeSlide.id}">
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-brand-900 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                    <Sparkles size={12} className="text-brand-800" /> Curated Skincare Collection
                  </span>
                  <h1 className="font-serif text-3xl sm:text-4xl lg:text-[46px] leading-[1.15] font-bold text-charcoal-900 tracking-tight transition-all duration-300">
                    {activeSlide.title.includes('for') ? (
                      <>
                        {activeSlide.title.split('for')[0]}for <br />
                        <span className="text-brand-800">{activeSlide.title.split('for')[1]}</span>
                      </>
                    ) : (
                      activeSlide.title
                    )}
                  </h1>
                  <p className="text-sm sm:text-base text-charcoal-800/80 font-normal pt-1 transition-all duration-300">
                    {activeSlide.subtitle}
                  </p>
                </div>

                {/* CTAs: Primary & Secondary */}
                <div className="flex flex-wrap gap-3.5 pt-2">
                  <Link
                    to={activeSlide.linkUrl}
                    className="px-7 py-3 bg-brand-800 hover:bg-brand-900 text-white rounded-md font-semibold text-sm transition-all duration-200 shadow-sm hover:shadow active:scale-95 flex items-center gap-2"
                  >
                    <span>{activeSlide.buttonText}</span>
                    <ArrowRight size={15} />
                  </Link>
                  {activeSlide.secondaryButtonText && activeSlide.secondaryButtonLink && (
                    <Link
                      to={activeSlide.secondaryButtonLink}
                      className="px-7 py-3 bg-transparent hover:bg-cream-300/80 text-charcoal-800 border border-charcoal-800/80 rounded-md font-semibold text-sm transition-all duration-200 active:scale-95"
                    >
                      {activeSlide.secondaryButtonText}
                    </Link>
                  )}
                </div>
              </div>

              {/* Right Hero Image */}
              <div className="lg:col-span-7 relative flex items-center justify-center">
                <div className="relative w-full rounded-2xl overflow-hidden shadow-soft-lg border border-cream-300/60 bg-gradient-to-tr from-cream-300 via-cream-100 to-cream-200 aspect-[16/10] max-h-[440px]">
                  <img
                    key={activeSlide.imageUrl}
                    src={activeSlide.imageUrl}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover object-center animate-in fade-in zoom-in-95 duration-500"
                  />

                  {/* Floating Authentic Guarantee Badge */}
                  <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl shadow-md border border-gray-100 flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-brand-800 text-white flex items-center justify-center">
                      <ShieldCheck size={16} />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-charcoal-900 leading-tight">100% Genuine</p>
                      <p className="text-[9px] text-gray-500">Dermatologist Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Controls: Arrows & Indicators */}
            {heroSlides.length > 1 && (
              <div className="flex items-center justify-between pt-6 border-t border-cream-300/60 mt-4">
                {/* Slide Counter & Dots */}
                <div className="flex items-center gap-2">
                  {heroSlides.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setCurrentSlide(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentSlide === idx ? 'w-8 bg-brand-800' : 'w-2 bg-charcoal-800/25 hover:bg-charcoal-800/40'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                {/* Prev / Next Arrows */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={prevHeroSlide}
                    className="p-2 rounded-full bg-white/80 hover:bg-white text-charcoal-800 border border-cream-300 shadow-sm transition-all active:scale-90"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={nextHeroSlide}
                    className="p-2 rounded-full bg-white/80 hover:bg-white text-charcoal-800 border border-cream-300 shadow-sm transition-all active:scale-90"
                    aria-label="Next Slide"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 2. CATEGORY DISCOVERY (Controlled by Admin CMS 'category_cards') */}
      {/* ========================================================================= */}
      {categoryCardsSection?.isActive !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8 space-y-1">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900">
              {categoryCardsSection?.title || 'Category Discovery'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
              {categoryCardsSection?.subtitle || 'Find targeted solutions tailored for your unique skin.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1: Men Skincare */}
            <div className="bg-white rounded-2xl border border-cream-300/80 overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 flex flex-col group">
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
                <img
                  src={mediaSlots['homepage.men_skincare']?.url || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop'}
                  alt={mediaSlots['homepage.men_skincare']?.altText || 'Men Skincare'}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-center flex-1 flex flex-col justify-between space-y-4">
                <h3 className="font-serif text-xl font-bold text-charcoal-900">
                  Men Skincare
                </h3>
                <div>
                  <button
                    onClick={() => navigate('/shop/men')}
                    className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Explore Men</span>
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 2: Women Skincare */}
            <div className="bg-white rounded-2xl border border-cream-300/80 overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 flex flex-col group">
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
                <img
                  src={mediaSlots['homepage.women_skincare']?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=600&auto=format&fit=crop'}
                  alt={mediaSlots['homepage.women_skincare']?.altText || 'Women Skincare'}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-center flex-1 flex flex-col justify-between space-y-4">
                <h3 className="font-serif text-xl font-bold text-charcoal-900">
                  Women Skincare
                </h3>
                <div>
                  <button
                    onClick={() => navigate('/shop/women')}
                    className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Explore Women</span>
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>

            {/* Card 3: Skin Type Guide */}
            <div className="bg-white rounded-2xl border border-cream-300/80 overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 flex flex-col group">
              <div className="relative aspect-[4/3] overflow-hidden bg-cream-100">
                <img
                  src={mediaSlots['homepage.skin_guide_card']?.url || 'https://images.unsplash.com/photo-1608248597359-00976156e520?q=80&w=600&auto=format&fit=crop'}
                  alt={mediaSlots['homepage.skin_guide_card']?.altText || 'Skin Type Guide'}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5 text-center flex-1 flex flex-col justify-between space-y-4">
                <h3 className="font-serif text-xl font-bold text-charcoal-900">
                  Skin Type Guide
                </h3>
                <div>
                  <button
                    onClick={() => navigate('/skin-guide')}
                    className="px-6 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors shadow-sm"
                  >
                    <span>Take Skin Quiz</span>
                    <ChevronDown size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 3. PRODUCT SHOWCASE: BEST SELLERS, FEATURED, NEW ARRIVALS (Admin CMS Controlled) */}
      {/* ========================================================================= */}
      {bestSellersSection?.isActive !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Heading & Interactive Tab Switches */}
          <div className="text-center mb-8 space-y-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 tracking-tight">
              {bestSellersSection?.title || 'Curated Skincare Essentials'}
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-xl mx-auto">
              {bestSellersSection?.subtitle || '100% genuine formulations from trusted international skincare dermatologists.'}
            </p>

            {/* Merchandising Tabs: Best Sellers | Featured Products | New Arrivals */}
            <div className="inline-flex p-1 bg-cream-100 rounded-2xl border border-cream-300 gap-1 mt-2">
              <button
                type="button"
                onClick={() => setProductTab('best_sellers')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  productTab === 'best_sellers'
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                Best Sellers
              </button>
              <button
                type="button"
                onClick={() => setProductTab('featured')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  productTab === 'featured'
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                Featured Products
              </button>
              <button
                type="button"
                onClick={() => setProductTab('new_arrivals')}
                className={`px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                  productTab === 'new_arrivals'
                    ? 'bg-brand-800 text-white shadow-sm'
                    : 'text-charcoal-700 hover:text-charcoal-900'
                }`}
              >
                New Arrivals
              </button>
            </div>
          </div>

          {/* Product Grid */}
          {isCurrentProductLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-cream-300 animate-pulse space-y-3">
                  <div className="aspect-square bg-cream-200 rounded-xl" />
                  <div className="h-4 bg-cream-200 rounded w-2/3" />
                  <div className="h-4 bg-cream-200 rounded w-1/3" />
                  <div className="h-10 bg-cream-200 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {displayProducts.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-xl border-2 border-brand-800 text-brand-800 hover:bg-brand-800 hover:text-white font-semibold text-xs transition-all duration-200"
            >
              <span>View All Authentic Skincare</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4. WHY CHOOSE US (Controlled by Admin CMS 'why_choose_us') */}
      {/* ========================================================================= */}
      {whyChooseUsSection?.isActive !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-10">
            <div className="flex-1 h-px bg-gray-200" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 px-6 sm:px-10 text-center tracking-tight">
              {whyChooseUsSection?.title || 'Why Choose Us'}
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* Badge 1 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 mb-3.5">
                <ShieldCheck size={32} className="stroke-[2.2]" />
              </div>
              <h4 className="font-semibold text-sm sm:text-base text-charcoal-900 mb-1">
                100% Original Products
              </h4>
              <p className="text-xs text-gray-500 max-w-[180px]">
                Directly imported from authorized global brand distributors.
              </p>
            </div>

            {/* Badge 2 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 mb-3.5">
                <Truck size={32} className="stroke-[2.2]" />
              </div>
              <h4 className="font-semibold text-sm sm:text-base text-charcoal-900 mb-1">
                Fast Delivery
              </h4>
              <p className="text-xs text-gray-500 max-w-[180px]">
                24-48 hour delivery inside Dhaka & nationwide coverage in BD.
              </p>
            </div>

            {/* Badge 3 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 mb-3.5">
                <Clock size={32} className="stroke-[2.2]" />
              </div>
              <h4 className="font-semibold text-sm sm:text-base text-charcoal-900 mb-1">
                COD Available
              </h4>
              <p className="text-xs text-gray-500 max-w-[180px]">
                Inspect parcel and pay securely with Cash on Delivery at your door.
              </p>
            </div>

            {/* Badge 4 */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-brand-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-300 mb-3.5">
                <Sparkles size={32} className="stroke-[2.2]" />
              </div>
              <h4 className="font-semibold text-sm sm:text-base text-charcoal-900 mb-1">
                Skin Type Support
              </h4>
              <p className="text-xs text-gray-500 max-w-[180px]">
                Take our skin diagnostic quiz for tailored morning and night routines.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 4.5. PROMOTIONAL STRIP BANNER (Controlled by Admin Banners 'PROMO' & Admin CMS) */}
      {/* ========================================================================= */}
      {(activePromoBanner || skinQuizSection?.isActive !== false) && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className="relative rounded-3xl overflow-hidden shadow-soft-lg border border-cream-300/80 group cursor-pointer"
            onClick={() => navigate(activePromoBanner?.linkUrl || skinQuizSection?.linkUrl || '/skin-guide')}
          >
            <img
              src={
                activePromoBanner?.imageUrl ||
                skinQuizSection?.imageUrl ||
                mediaSlots['homepage.promo_banner']?.url ||
                'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?q=80&w=1600&auto=format&fit=crop'
              }
              alt={activePromoBanner?.title || skinQuizSection?.title || 'Summer Sun Protection SPF 50+'}
              className="w-full h-44 sm:h-64 lg:h-72 object-cover object-center group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900/85 via-charcoal-900/50 to-transparent flex items-center p-6 sm:p-12">
              <div className="max-w-md space-y-3 text-white">
                <span className="inline-flex items-center gap-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-amber-300 bg-amber-400/20 px-3 py-1 rounded-full border border-amber-300/30">
                  <Sparkles size={13} /> Exclusive Seasonal Promotion
                </span>
                <h3 className="font-serif text-xl sm:text-3xl lg:text-4xl font-bold leading-tight">
                  {activePromoBanner?.title || skinQuizSection?.title || 'Authentic Korean Sunscreens & Serums'}
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 line-clamp-2">
                  {activePromoBanner?.subtitle || skinQuizSection?.subtitle || 'Beat the heat with broad-spectrum SPF 50+ PA++++ lightweight formulations.'}
                </p>
                <div className="pt-2">
                  <span className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-800 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold shadow-md transition-colors">
                    <span>{activePromoBanner?.buttonText || skinQuizSection?.buttonText || 'Shop Protection Deals'}</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 5. CUSTOMER REVIEWS (Controlled by Admin CMS 'customer_reviews') */}
      {/* ========================================================================= */}
      {reviewsSection?.isActive !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center mb-10">
            <div className="flex-1 h-px bg-gray-200" />
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-charcoal-900 px-6 sm:px-10 text-center tracking-tight">
              {reviewsSection?.title || 'Customer Reviews'}
            </h2>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((rev: any, idx: number) => (
              <div
                key={rev.id || idx}
                className="bg-white rounded-2xl border border-cream-300/80 p-6 shadow-sm hover:shadow-card transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150'}
                      alt={rev.userName}
                      className="w-12 h-12 rounded-full object-cover border border-brand-100"
                    />
                    <div>
                      <div className="flex items-center text-amber-400 gap-0.5 mb-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} className="fill-current text-amber-400" />
                        ))}
                      </div>
                      <h4 className="text-sm font-bold text-charcoal-900">{rev.userName}</h4>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed italic mb-4">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified Purchase
                  </span>
                  <span>{rev.product?.name || 'Skincare Customer'}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setActiveReviewIdx(0)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeReviewIdx === 0 ? 'bg-brand-800 w-5' : 'bg-gray-300'
              }`}
              aria-label="Slide 1"
            />
            <button
              onClick={() => setActiveReviewIdx(1)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeReviewIdx === 1 ? 'bg-brand-800 w-5' : 'bg-gray-300'
              }`}
              aria-label="Slide 2"
            />
            <button
              onClick={() => setActiveReviewIdx(2)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                activeReviewIdx === 2 ? 'bg-brand-800 w-5' : 'bg-gray-300'
              }`}
              aria-label="Slide 3"
            />
          </div>
        </section>
      )}

      {/* ========================================================================= */}
      {/* 6. NEWSLETTER PROMO SECTION (Controlled by Admin CMS 'newsletter') */}
      {/* ========================================================================= */}
      {newsletterSection?.isActive !== false && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-brand-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
            <div className="relative z-10 max-w-2xl mx-auto text-center space-y-4">
              <span className="px-3 py-1 bg-white/10 text-brand-200 text-xs uppercase font-bold tracking-widest rounded-full">
                Join Our Skincare Club
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold">
                {newsletterSection?.title || 'Get 10% Off Your First Order in Bangladesh'}
              </h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                {newsletterSection?.subtitle || 'Subscribe for exclusive skincare routine guides, flash sales on CeraVe & The Ordinary, and dermatologist advice.'}
              </p>

              {newsletterSuccess ? (
                <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-sm font-semibold text-brand-200 flex items-center justify-center gap-2">
                  <CheckCircle2 size={18} /> Thank you! Use coupon code <span className="text-white font-mono uppercase bg-brand-800 px-2 py-0.5 rounded">WELCOME10</span> at checkout.
                </div>
              ) : (
                <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-3 pt-2">
                  <input
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address..."
                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-sm placeholder-gray-400 text-white focus:outline-none focus:bg-white/20"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white hover:bg-cream-200 text-brand-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    {newsletterSection?.buttonText || 'Subscribe'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
