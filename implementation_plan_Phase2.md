# Implementation Plan - Phase 2: Admin Design System & Enterprise Application Shell

Transform the admin interface into a modern, enterprise-quality e-commerce command center shell inspired by modern operational systems (Shopify Admin, Linear, Stripe Dashboard, Vercel Dashboard) with responsive design, theme support, breadcrumbs, search palette, and collapsible navigation hierarchy.

## Proposed Changes

### Client Architecture & Design System

#### [NEW] [adminThemeStore.ts](file:///d:/Project/Skincare/client/src/stores/adminThemeStore.ts)
- Manage admin theme preference (`light`, `dark`, `system`).
- Sync with document class list and `localStorage`.

#### [NEW] [AdminSidebar.tsx](file:///d:/Project/Skincare/client/src/components/admin/AdminSidebar.tsx)
- Complete enterprise navigation structure grouped into:
  - **Overview** (Dashboard)
  - **Catalog** (Products, Categories, Brands, Inventory)
  - **Orders** (All Orders, Pending, Processing, Shipped, Delivered, Returns)
  - **Customers** (All Customers, Segments, Reviews)
  - **Marketing** (Coupons, Campaigns, Automations, Notifications)
  - **Content** (Homepage, Banners, Skin Guide, Newsletter)
  - **Analytics** (Sales, Products, Customers, Marketing)
  - **Operations** (Delivery, Payments, Inventory Alerts)
  - **System** (Users & Roles, Settings, Activity Logs)
- Collapsible section groups with expand/collapse persistence.
- Role-based visibility filtering based on `user.role`.
- Notification / alert count badges on relevant tabs (e.g., Pending Orders, Low Stock).
- Mobile responsive drawer with smooth backdrop transitions.

#### [NEW] [AdminTopbar.tsx](file:///d:/Project/Skincare/client/src/components/admin/AdminTopbar.tsx)
- Dynamic breadcrumb generation matching current route hierarchy.
- Page title & context badge.
- Global Search button with shortcut indicator (`Ctrl + K` / `⌘K`).
- Quick Actions dropdown menu (`+ Add Product`, `+ Create Coupon`, `+ Update Homepage`, `+ Send Notification`, `+ View Low Stock`).
- Notification bell with unread badge counter.
- Theme switcher dropdown (Light / Dark / System).
- Admin profile pill with role badge (`SUPER_ADMIN`, `PRODUCT_MANAGER`, etc.) and dropdown menu with Sign Out.

#### [NEW] [AdminCommandPalette.tsx](file:///d:/Project/Skincare/client/src/components/admin/AdminCommandPalette.tsx)
- Keyboard shortcut `Ctrl+K` (or `Cmd+K`) global command center.
- Instant navigation search across catalog, orders, customers, pages, automations, and quick actions.
- Filter by category (`Pages`, `Actions`, `Navigation`).

#### [NEW] [AdminQuickActionsModal.tsx](file:///d:/Project/Skincare/client/src/components/admin/AdminQuickActionsModal.tsx)
- Modal triggers for fast operations without losing context.

#### [MODIFY] [AdminLayout.tsx](file:///d:/Project/Skincare/client/src/pages/admin/AdminLayout.tsx)
- Integrate `AdminSidebar`, `AdminTopbar`, `AdminCommandPalette`, and dynamic container.
- Apply light/dark enterprise color tokens (`bg-slate-900 / bg-slate-50`, crisp border lines, high-contrast typography).

#### [MODIFY] [App.tsx](file:///d:/Project/Skincare/client/src/App.tsx)
- Register admin sub-routes cleanly (Inventory, Categories, Brands, Segments, Automations, Analytics, Settings, Activity Logs) to ensure smooth navigation with fallback loading states.

## Verification Plan

### Automated Verification
- Run `npm run typecheck` across all workspaces to verify zero TypeScript errors.
- Run `npm run build --workspace=client` to ensure Vite bundle splits properly with no missing exports.

### Manual & Visual Verification
- Verify `Ctrl+K` opens and closes the command palette smoothly.
- Test sidebar collapsing/expanding across all navigation groups.
- Test mobile responsiveness (viewport widths: 375px, 768px, 1024px, 1440px).
- Verify dark/light mode toggle switches classes cleanly without affecting storefront styling.
- Verify role indicator and logout flow.
