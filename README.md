# 🌿 Skincare — Premium Bangladesh E-Commerce Platform

A production-quality, full-stack skincare e-commerce platform built for the Bangladesh market. Features a curated catalog of 100% authentic international skincare brands, an interactive diagnostic skin routine builder, Cash on Delivery (COD) & digital payment simulation (bKash, Nagad, SSLCommerz), Bangladesh geographic address selector, and a full-featured admin management portal.

---

## 🏗️ Architecture & Technology Stack

- **Monorepo**: npm workspaces (`shared`, `server`, `client`)
- **Frontend (`client/`)**:
  - React 18 + Vite + TypeScript
  - Styling: Vanilla Tailwind CSS (Custom `#0D5C46` deep skincare green, `#FBF9F5` warm cream, `Playfair Display` serif & `Plus Jakarta Sans` typography)
  - State Management: Zustand (`authStore`, `cartStore`, `wishlistStore`, `uiStore`)
  - Server Cache & Queries: TanStack React Query v5
  - Visualizations: Recharts
  - Icons: Lucide React
- **Backend (`server/`)**:
  - Node.js + Express + TypeScript (ESM)
  - Database: SQLite (Zero-friction local dev via Prisma ORM, seamlessly migratable to PostgreSQL)
  - Security: Helmet, CORS, cookie-parser, bcryptjs, JWT authentication in HTTP-only cookies, express-rate-limit
  - Validation: Zod schemas
- **Shared (`shared/`)**:
  - Unified TypeScript models & API contracts
  - Complete Bangladesh dataset: 8 Divisions, 64 Districts (EN/BN), Delivery fee calculator, BDT Currency formatter (`৳1,350`), and BD mobile phone validator/normalizer (`+8801...`).

---

## 📋 Prerequisites

Before running the application, ensure you have installed:
- **Node.js**: `v20.x` or higher (Recommended: LTS)
- **npm**: `v10.x` or higher

---

## ⚡ Quick Start Guide (Step-by-Step)

### 1. Navigate to Project
```bash
cd /path/to/Skincare
```

### 2. Install Dependencies
Install all packages across the root and monorepo workspaces (`shared`, `server`, `client`):
```bash
npm install
```

---

### 3. Configure Environment Variables

1. Copy the example `.env` files for root and server:
   ```bash
   # On Windows PowerShell:
   cp .env.example .env
   cp server/.env.example server/.env
   ```

2. The default `server/.env` is pre-configured for local development:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="skincare_bd_super_secret_jwt_key_2026_secure"
   JWT_EXPIRES_IN="7d"
   CLIENT_URL="http://localhost:5173"
   ```

---

### 4. Setup Database & Seed Initial Catalog

Run the Prisma database push and execute the comprehensive seed script (populates 16 authentic products, brands, categories, skin taxonomies, reviews, CMS content, coupons, and seed users):

```bash
# Push Prisma Schema to database (server/dev.db)
npm run db:push --workspace=server

# Seed Database
npm run db:seed --workspace=server
```

---

### 5. Run the Application

You can run both the Backend API and Frontend Client concurrently with a single command from the root folder:

```bash
npm run dev
```

Alternatively, you can run them in separate terminal windows:
```bash
# Terminal 1: Backend Server (Port 5000)
npm run dev --workspace=server

# Terminal 2: Frontend Client (Port 5173)
npm run dev --workspace=client
```

Open your browser and visit:
- 🌐 **Storefront**: [http://localhost:5173](http://localhost:5173)
- 📊 **Admin Portal**: [http://localhost:5173/admin](http://localhost:5173/admin)
- 🔌 **Backend Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🔑 Default Seed Credentials

### 🛡️ Administrator Account (Full Admin Access)
- **Email**: `admin@example.com`
- **Password**: `ChangeMe123!`
- **Access URL**: [http://localhost:5173/admin](http://localhost:5173/admin) or click the **Account** icon in the header.

### 👤 Customer Demo Account
- **Email**: `customer@example.com`
- **Password**: `Customer123!`

---

## 🧪 Testing & Verification

Run the built-in automated test suites:

```bash
# 1. Run Automated Unit & E2E Verification Tests
npm test

# 2. Run TypeScript Typechecking across all workspaces
npm run typecheck

# 3. Build Production Bundles for Client & Server
npm run build
```

---

## 🗺️ Key Routes & Features

### 🛍️ Storefront Routes
- `/` — **Homepage**: Faithful recreation of reference design (Hero banner, 3 Category cards, 4 Best Sellers in ৳ BDT, 4 Why Choose Us badges, Reviews carousel).
- `/shop` — **Catalog & Filter**: Faceted sidebar filtering by Category, Brand, Skin Type, Concern, Gender, Price Range, and Sorting.
- `/product/:slug` — **Product Details**: Image gallery, formulation tabs (Ingredients, Benefits, Usage), frequently bought bundle, verified reviews.
- `/skin-guide` — **Diagnostic Skin Quiz**: 4-step interactive diagnostic quiz generating customized Morning (AM) & Night (PM) skincare routines.
- `/cart` — **Shopping Cart**: Real-time Free Delivery threshold progress bar, coupon validator (`WELCOME10`, `SKINCARE500`).
- `/checkout` — **Checkout**: Bangladesh address selector (8 Divisions, 64 Districts), COD, bKash, Nagad, SSLCommerz.
- `/track-order` — **Order Tracking**: Visual milestone progress timeline lookup by Order Number + Phone number.
- `/account` — **Customer Account**: Order history, saved address book, skin profile.
- `/wishlist` — **Wishlist**: Saved items with 1-click move to cart.
- `/payment/mock-gateway` — **Payment Gateway Simulator**: Interactive sandbox simulation for bKash, Nagad, and SSLCommerz.

### ⚙️ Admin Portal Routes (`/admin`)
- `/admin` — **Dashboard**: Real-time revenue, orders count, low-stock alerts, Recharts sales curve.
- `/admin/products` — **Product CRUD**: Inventory stock management, SKU generation, pricing in ৳ BDT, image preview.
- `/admin/orders` — **Order Fulfillment**: Status pipeline transition (`PENDING` $\rightarrow$ `CONFIRMED` $\rightarrow$ `SHIPPED` $\rightarrow$ `DELIVERED`), courier tracking code assignment.
- `/admin/customers` — **Customer Directory**: Registered users, lifetime spend, skin profiles.
- `/admin/reviews` — **Review Moderation**: Approve, reject, and feature customer reviews.
- `/admin/coupons` — **Voucher Engine**: Create percentage, fixed discount, and free shipping codes.
- `/admin/cms` — **Homepage CMS**: Dynamic editor for hero banner titles and subtitles.

---

## 📁 Monorepo Folder Structure

```
Skincare/
├── package.json               # Root monorepo workspace configuration
├── .env.example               # Root environment template
│
├── shared/                    # Shared TypeScript library (@skincare/shared)
│   ├── src/
│   │   ├── bangladesh-data.ts # BD Divisions, 64 Districts, Shipping Rates, Phone normalizer
│   │   ├── types.ts           # Shared data contracts (Product, Order, User, Quiz, etc.)
│   │   └── index.ts
│   └── package.json
│
├── server/                    # Express Backend API (@skincare/server)
│   ├── prisma/
│   │   ├── schema.prisma      # Database Schema (20+ models)
│   │   └── seed.ts            # Seed script with 16 authentic products & taxonomy
│   ├── src/
│   │   ├── controllers/       # Auth, Product, Cart, Order, Admin, SkinGuide, Review
│   │   ├── middleware/        # JWT Auth guards, Error handling, Rate limiters
│   │   ├── payment/           # Payment Service & Providers (COD, bKash, Nagad, SSLCommerz)
│   │   ├── routes/            # Express route modules
│   │   ├── utils/             # Response formatters, JWT tokens
│   │   └── server.ts          # Server entry point (Port 5000)
│   ├── test/                  # Automated unit tests & E2E verification
│   └── package.json
│
└── client/                    # Vite + React Frontend Application (@skincare/client)
    ├── src/
    │   ├── components/        # Header, Footer, ProductCard, CartDrawer, AuthModal, SearchModal
    │   ├── pages/             # Home, Shop, ProductDetail, Cart, Checkout, OrderTrack, SkinGuide, Admin...
    │   ├── services/          # Axios API service layers
    │   ├── stores/            # Zustand global stores (auth, cart, wishlist, ui)
    │   ├── App.tsx            # Routes configuration & QueryClientProvider
    │   ├── index.css          # Tailwind CSS tokens & typography
    │   └── main.tsx           # Client entry point (Port 5173)
    ├── tailwind.config.js     # Exact brand color palette configuration
    └── package.json
```

---

## 📞 Support & Inquiries

For questions or assistance regarding the platform:
- **Email**: `info@skincarestars.com`
- **Hotline**: `+880 123 456 7890` (Dhaka, Bangladesh)
- **License**: MIT
