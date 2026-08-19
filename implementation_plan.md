# Skincare E-Commerce Platform - Full Implementation Plan

A comprehensive, production-grade skincare e-commerce platform built for the Bangladesh market (BDT ৳), adhering strictly to the visual identity of the provided design reference and the specifications outlined in `PRD.md`.

---

## User Review Required

> [!IMPORTANT]
> **Database Configuration**: We will configure Prisma with PostgreSQL. For zero-friction development and instant verification without requiring an external PostgreSQL server immediately running on your local machine, we will include a SQLite/PostgreSQL switchable configuration via `DATABASE_URL` so you can test seamlessly right away while remaining 100% PostgreSQL production-ready.
> 
> **Payment Gateways**: Cash on Delivery (COD) will be fully functional end-to-end. bKash, Nagad, and SSLCommerz will be built with dedicated modular payment gateway adapter interfaces that support both a sandbox simulation mode and live API configurations.

---

## Proposed Architecture & Directory Structure

We will set up a clean, scalable monorepo structure:

```text
Skincare/
├── client/                     # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── assets/             # Brand logos, lifestyle skincare photography, UI icons
│   │   ├── components/         # Reusable UI & atomic design system (shadcn/ui + custom)
│   │   │   ├── common/         # Button, Input, Modal, Drawer, Badge, RatingStars, etc.
│   │   │   ├── layout/         # Header, MobileNav, Footer, AdminSidebar, Layout
│   │   │   ├── product/        # ProductCard, ProductGrid, ProductGallery, QuickView
│   │   │   ├── cart/           # CartDrawer, CartItem, DeliveryProgressBar
│   │   │   ├── checkout/       # AddressForm, PaymentSelector, OrderSummary
│   │   │   └── review/         # ReviewCard, ReviewCarousel, ReviewModal
│   │   ├── features/           # Feature-specific modules (skin-guide, routine, search)
│   │   ├── hooks/              # useCart, useWishlist, useAuth, useDebounce, useMediaQuery
│   │   ├── pages/              # Storefront & Admin pages
│   │   │   ├── Home.tsx        # Faithful recreation of reference design
│   │   │   ├── Shop.tsx        # Filters, sorting, search, grid/list
│   │   │   ├── ProductDetail.tsx# Gallery, specs, routine, reviews, recommendations
│   │   │   ├── CartPage.tsx    # Full cart & coupon calculation
│   │   │   ├── CheckoutPage.tsx# BD-localized address & payment flow
│   │   │   ├── OrderTrackPage.tsx# Live order tracking by ID + phone
│   │   │   ├── AccountPage.tsx # Orders, addresses, wishlist, skin profile
│   │   │   ├── SkinGuidePage.tsx# Interactive diagnostic quiz & routine builder
│   │   │   └── admin/          # Admin Dashboard, Products, Orders, Inventory, CMS, etc.
│   │   ├── services/           # Axios API services (products, auth, cart, orders, admin)
│   │   ├── stores/             # Zustand stores (cartStore, wishlistStore, authStore, uiStore)
│   │   ├── types/              # Client-side TypeScript contracts
│   │   ├── utils/              # BDT currency formatting (৳), BD phone validation, helpers
│   │   ├── App.tsx             # Route definitions & React Query / Auth provider
│   │   └── main.tsx
│   ├── tailwind.config.js      # Tailored palette (Forest deep green #0D5C46, warm cream #FAF8F5)
│   └── package.json
│
├── server/                     # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/             # Environment variables, database client, constants
│   │   ├── controllers/        # Auth, Product, Cart, Order, Payment, Review, Admin controllers
│   │   ├── middleware/         # Auth verify, role guard, error handler, rate limiter, validation
│   │   ├── routes/             # REST endpoints (/api/auth, /api/products, /api/orders, etc.)
│   │   ├── services/           # Business logic (pricing, inventory safety, coupons, routine builder)
│   │   ├── payment/            # Payment gateway adapters (COD, bKash, Nagad, SSLCommerz)
│   │   ├── validators/         # Zod schemas for request validation
│   │   ├── utils/              # JWT, password hashing, BDT calculation helpers
│   │   └── app.ts & server.ts
│   ├── prisma/
│   │   ├── schema.prisma       # Comprehensive relational schema (30+ models)
│   │   └── seed.ts             # Realistic 25+ products, BD divisions/districts, demo admin, reviews
│   └── package.json
│
├── shared/                     # Shared TypeScript interfaces, enums, BD geographic data
│   └── src/
│       ├── types.ts
│       └── bangladesh-data.ts  # 8 Divisions, 64 Districts, delivery zone fees
│
├── .env.example
└── package.json                # Root orchestration scripts (dev, build, seed, test)
```

---

## Phase-by-Phase Execution Plan

### Phase 1: Project Foundation & Database Architecture
- Initialize root monorepo, `client`, `server`, and `shared` packages.
- Configure TypeScript strict mode, ESLint, Prettier, Tailwind CSS with the design palette, and Vite.
- Create full Prisma schema with comprehensive models:
  - `User`, `Role` (SUPER_ADMIN, PRODUCT_MANAGER, ORDER_MANAGER, MARKETING_MANAGER, SUPPORT_STAFF, CUSTOMER)
  - `Address` (with Division, District, Area, Phone)
  - `Product`, `ProductImage`, `ProductVariant`, `Brand`, `Category`, `SkinType`, `SkinConcern`
  - `Cart`, `CartItem`, `Wishlist`, `WishlistItem`
  - `Order`, `OrderItem`, `Payment`, `Shipment`
  - `Coupon`, `CouponUsage`
  - `Review`, `ReviewImage`
  - `HomepageSection`, `Banner`, `NewsletterSubscriber`, `Notification`
  - `SkinQuizQuestion`, `SkinQuizAnswer`, `SkinRoutine`
- Build rich database seed script with authentic skincare products (CeraVe, The Ordinary, Minimalist, COSRX, La Roche-Posay, Cetaphil, WOW Skin Science), brand assets, categories, reviews, Bangladesh locations, and demo admin account (`admin@example.com` / `ChangeMe123!`).

### Phase 2: REST API & Authentication Engine
- Express setup with Helmet, CORS, rate limiting, and cookie-parser.
- Authentication: Secure JWT in HTTP-only cookies, bcryptjs password hashing, registration, login, logout, current user verification (`/api/auth/me`).
- Product & Catalog API:
  - Advanced search and filtering (category, brand, skin type, concern, price range, rating, gender, sorting, pagination).
  - Search suggestions & autocompletion endpoint `/api/search/suggestions`.
- Cart & Wishlist API: Server-side validation, guest-to-user sync on login.
- Coupon API: Server-side code validation, expiration check, min order, usage limits.
- Order & Payment API: Server-side price recalculation, stock reservation/decrementing, order timeline status machine.
- Review & Skin Guide API: Verified purchase review submissions, diagnostic quiz evaluation.
- Admin APIs: Complete CRUD operations for products, categories, orders, customers, reviews, and CMS content.

### Phase 3: Design System & Storefront Re-creation (Matching Uploaded Image)
- Configure typography (`Playfair Display` serif headings + `Inter`/`Plus Jakarta Sans` body).
- Implement the design palette:
  - Primary Brand Green: `#0D5C46` / `#134E48`
  - Background: `#FBF9F5` / Warm Cream
  - Card Surfaces: `#FFFFFF`
  - Charcoal Text: `#1E293B`
  - Accent Gold: `#F59E0B`
- Build the exact Homepage matching the reference layout:
  1. Sticky Navigation Header with Logo, Navigation Links, Contact, Search popup, Account, Wishlist, and Cart Counter.
  2. Hero Section: "Original Skincare for Real Skin" with lifestyle photography and `[Shop Men]` / `[Shop Women]` CTAs.
  3. Category Discovery Cards: Men Skincare, Women Skincare, Skin Type Guide with custom photography and explore buttons.
  4. Best Sellers: Product cards with star ratings, BDT prices, hover effects, and `[Add to Cart]`.
  5. Why Choose Us: 4 trust badges (100% Original Products, Fast Delivery, COD Available, Skin Type Support).
  6. Customer Reviews: Verified purchase testimonials in an interactive carousel with star ratings and reviewer photos.
  7. Newsletter Subscription & Bangladesh-tailored Footer.

### Phase 4: Product Catalog, Shop & Search
- Full `/shop` page with desktop sidebar and mobile filter drawer.
- Live multi-select filters for Category, Brand, Skin Type, Concern, Gender, Price slider, and Rating.
- Instant debounced search bar with category suggestions, popular keywords, and thumbnail previews.
- Dedicated Product Detail Page (`/product/:slug`):
  - High-res image gallery with interactive thumbnail selector and zoom.
  - Authentic badge, live stock status, BDT pricing with discount calculation.
  - Tabbed information (Description, Benefits, Full Ingredients list, How to Use, Suitable For).
  - Frequently Bought Together combo builder with 1-click add all to cart.
  - Related products & Customer reviews with verified review submission modal.

### Phase 5: Cart, Wishlist, Checkout & Bangladesh Localization
- Cart system with drawer + full page, quantity controls, dynamic free delivery progress bar (`Add ৳X more for FREE delivery`).
- Wishlist with optimistic updates and move-to-cart functionality.
- Conversion-optimized Checkout (`/checkout`):
  - Customer contact info & Bangladesh phone validation.
  - Bangladesh geographic selector (Divisions: Dhaka, Chittagong, Sylhet, etc., Districts, Areas).
  - Dynamic delivery charge calculation (Inside Dhaka ৳60 / Outside Dhaka ৳120 / Express ৳150).
  - Backend-validated Coupon application.
  - Payment options: Cash on Delivery (COD), bKash / Nagad / SSLCommerz sandbox simulation.
  - Order success screen with printable receipt view and instant tracking link.

### Phase 6: Order Tracking & Customer Account
- Track Order page (`/track-order`): Query by Order ID + Phone number showing real-time visual milestone timeline.
- Customer Account Hub (`/account`):
  - Overview dashboard with order stats.
  - Order history with item breakdowns and invoice generation.
  - Address book with add/edit/default selectors.
  - Saved wishlist items.
  - Customer reviews & skin quiz profile recommendations.

### Phase 7: Skin Guide & Diagnostic Quiz
- `/skin-guide` interactive tool:
  - Step-by-step diagnostic questionnaire (Skin Type, Main Concerns, Sensitivity, Routine Preferences).
  - Rule-based recommendation algorithm delivering tailored Morning (AM) and Night (PM) skincare routines.
  - One-click bundle purchase option.

### Phase 8: Admin Dashboard & CMS
- Dedicated `/admin` interface with sidebar and KPI metrics:
  - Analytics cards: Total Revenue, Total Orders, Active Customers, Low Stock alerts.
  - Recharts: Revenue over time, Orders chart, Top-selling products, Category distribution.
  - Product Manager: Form with image preview, SKU, inventory, pricing, tags, categories, and SEO fields.
  - Order Manager: Status transitions (`Pending` -> `Confirmed` -> `Processing` -> `Packed` -> `Shipped` -> `Out for Delivery` -> `Delivered`), tracking number assignment, invoice view.
  - Inventory Manager: Low-stock monitor, stock adjustment logs.
  - Review Moderation: Approve, reject, feature, or delete reviews.
  - Coupon Manager: Create and manage percentage/fixed/free delivery promo codes.
  - Homepage CMS: Live toggle and edit hero text, banners, and featured collections.

### Phase 9: Quality Assurance, Testing & Build Verification
- Unit & integration tests for authentication, order calculations, coupon validation, and inventory deduction.
- Full TypeScript type-checking across frontend, backend, and shared packages.
- Cross-device responsive design verification (375px mobile, 768px tablet, 1440px desktop).
- Performance audit, image optimization, SEO meta tags, and accessibility checks.

---

## Verification Plan

### Automated Verification
- Backend API tests: Auth flows, Product queries, Cart operations, Coupon validation, Order creation.
- Frontend TypeScript check: `npm run typecheck` (or `tsc --noEmit`).
- Production build test: `npm run build` for both client and server.

### Manual Verification Flows
1. **Storefront Visual Integrity**: Verify that the homepage accurately reflects the provided reference design (colors, typography, hero layout, category cards, best sellers, trust badges, review carousel, footer).
2. **Catalog & Filtering Flow**: Browse `/shop`, apply multiple filters (e.g. Oily Skin + Acne concern + CeraVe brand), sort by price, verify correct filtered response from backend.
3. **Cart & Coupon Flow**: Add products to cart, view free shipping progress, apply valid and invalid coupons, verify totals and BDT formatting.
4. **Checkout Flow**: Complete COD order with Bangladesh address (Dhaka division), verify stock reduction in database, inspect order creation and timeline status.
5. **Order Tracking Flow**: Query the order on `/track-order` using Order ID and phone number, confirm visual progress timeline.
6. **Skin Quiz Flow**: Complete the 4-step skin guide quiz and verify customized AM/PM routine suggestions.
7. **Admin Portal Flow**: Log in with `admin@example.com`, inspect KPIs on dashboard, create/edit a product, update order status, moderate customer reviews, and edit homepage CMS banner.
