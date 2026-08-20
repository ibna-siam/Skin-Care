import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowLeft, Sparkles, AlertCircle } from 'lucide-react';

interface SectionInfo {
  title: string;
  description: string;
  phase: string;
  quickLink?: { text: string; to: string };
}

const SECTION_MAP: Record<string, SectionInfo> = {
  '/admin/inventory': {
    title: 'Inventory & Stock Command Center',
    description: 'Real-time multi-warehouse inventory thresholds, out-of-stock prevention, and batch stock adjustments.',
    phase: 'Phase 5: Product & Inventory Command Center',
    quickLink: { text: 'Manage Catalog Products', to: '/admin/products' },
  },
  '/admin/categories': {
    title: 'Category Hierarchy Management',
    description: 'Configure product categories, parent-child relations, and storefront visibility order.',
    phase: 'Phase 5: Product & Inventory Management',
    quickLink: { text: 'Manage Products', to: '/admin/products' },
  },
  '/admin/brands': {
    title: 'Brand Partner Management',
    description: 'Manage featured skincare brands, country origins, brand logos, and authorized reseller badges.',
    phase: 'Phase 5: Product & Inventory Management',
    quickLink: { text: 'Manage Products', to: '/admin/products' },
  },
  '/admin/customers/segments': {
    title: 'Customer RFM Segmentation Engine',
    description: 'Dynamic customer rules (VIP, Frequent Buyers, Inactive, Cart Abandoners) driving automated marketing.',
    phase: 'Phase 6: Customer CRM & Segmentation',
    quickLink: { text: 'View All Customers', to: '/admin/customers' },
  },
  '/admin/automations': {
    title: 'Enterprise Automation Engine & Builder',
    description: 'Persistent trigger-condition-action background workflows: Abandoned Cart, Review Requests, Back-in-stock, and Price drop.',
    phase: 'Phase 9-19: Automation Engine',
    quickLink: { text: 'View Overview Dashboard', to: '/admin' },
  },
  '/admin/campaigns': {
    title: 'Marketing Campaigns & Broadcasts',
    description: 'Scheduled promotional campaigns, seasonal sales banners, and targeted coupon drops.',
    phase: 'Phase 7 & 18: Marketing Automation',
    quickLink: { text: 'Manage Coupons', to: '/admin/coupons' },
  },
  '/admin/notifications': {
    title: 'Admin Notification & Operations Center',
    description: 'Real-time alerts for low stock items, critical failed payments, and customer support escalation.',
    phase: 'Phase 8: Notification Center',
    quickLink: { text: 'View Orders', to: '/admin/orders' },
  },
  '/admin/banners': {
    title: 'Banners & Hero Media Manager',
    description: 'Upload and configure promotional carousel slides, middle banners, and flash sale ribbons.',
    phase: 'Phase 5: Content Management',
    quickLink: { text: 'Manage Homepage CMS', to: '/admin/cms' },
  },
  '/admin/skin-guide': {
    title: 'Skin Quiz & Routine Builder Manager',
    description: 'Curate skin quiz questions, answer weights, and algorithmic product recommendations for Bangladeshi skin concerns.',
    phase: 'Phase 5: Content Management',
    quickLink: { text: 'View Live Skin Guide', to: '/skin-guide' },
  },
  '/admin/newsletter': {
    title: 'Newsletter Subscribers & Audiences',
    description: 'Export subscriber list, segment by skin concern, and sync with email broadcast providers.',
    phase: 'Phase 6: CRM & Marketing',
    quickLink: { text: 'View Customers', to: '/admin/customers' },
  },
  '/admin/analytics/sales': {
    title: 'Sales & Revenue Analytics',
    description: 'Comprehensive financial reporting, gross margins, payment method breakdown, and average order value trends.',
    phase: 'Phase 7: Analytics Upgrade',
    quickLink: { text: 'View Dashboard Stats', to: '/admin' },
  },
  '/admin/analytics/products': {
    title: 'Product Performance & Conversion Analytics',
    description: 'Product view counts, add-to-cart rate, inventory velocity, and return metrics.',
    phase: 'Phase 7: Analytics Upgrade',
    quickLink: { text: 'View Products', to: '/admin/products' },
  },
  '/admin/analytics/customers': {
    title: 'Customer Insights & Retention',
    description: 'Cohort analysis, repeat purchase rates, customer lifetime value (LTV), and churn indicators.',
    phase: 'Phase 7: Analytics Upgrade',
    quickLink: { text: 'View Customers', to: '/admin/customers' },
  },
  '/admin/analytics/marketing': {
    title: 'Marketing ROI & Attribution',
    description: 'Coupon redemption rates, campaign conversion tracking, and automation-recovered revenue.',
    phase: 'Phase 7: Analytics Upgrade',
    quickLink: { text: 'Manage Coupons', to: '/admin/coupons' },
  },
  '/admin/operations/delivery': {
    title: 'Delivery & Shipping Rate Configuration',
    description: 'Configure Dhaka (৳80), Outside Dhaka (৳130), Express (৳150) delivery zones and courier integration settings.',
    phase: 'Phase 4: Operations & Fulfillment',
    quickLink: { text: 'View Orders', to: '/admin/orders' },
  },
  '/admin/operations/payments': {
    title: 'Payment Gateway Operations',
    description: 'Monitor bKash, Nagad, SSLCommerz, and Cash on Delivery transaction statuses and reconciliation.',
    phase: 'Phase 4: Operations & Fulfillment',
    quickLink: { text: 'View Orders', to: '/admin/orders' },
  },
  '/admin/operations/alerts': {
    title: 'Inventory & Operations Alerts',
    description: 'Automated warnings for depleted stock, unfulfilled high-priority orders, and stuck shipments.',
    phase: 'Phase 8: Notification & Alerts',
    quickLink: { text: 'View Products', to: '/admin/products' },
  },
  '/admin/system/users': {
    title: 'Users & Role-Based Access Control',
    description: 'Manage administrator accounts and granular permissions for Super Admins, Product Managers, Order Managers, and Support Staff.',
    phase: 'Phase 20: System Administration',
    quickLink: { text: 'View Dashboard', to: '/admin' },
  },
  '/admin/settings': {
    title: 'Store Settings & Configurations',
    description: 'Store contact details, currency formatting, tax rates, checkout rules, and system API configurations.',
    phase: 'Phase 20: System Administration',
    quickLink: { text: 'View Dashboard', to: '/admin' },
  },
  '/admin/system/activity-logs': {
    title: 'System Activity & Audit Logs',
    description: 'Immutable trail of administrative changes: price edits, order status updates, permission grants, and coupon deployments.',
    phase: 'Phase 20: System Administration',
    quickLink: { text: 'View Dashboard', to: '/admin' },
  },
};

export const AdminPlaceholderSection: React.FC = () => {
  const location = useLocation();
  const info = SECTION_MAP[location.pathname] || {
    title: 'Enterprise Management Module',
    description: 'This operations module is scheduled for phased rollout.',
    phase: 'Phased Upgrade Sequence',
    quickLink: { text: 'Return to Dashboard', to: '/admin' },
  };

  return (
    <div className="bg-slate-950/70 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto my-8 space-y-6 shadow-xl">
      <div className="w-14 h-14 bg-emerald-950/80 border border-emerald-800 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
        <Sparkles size={26} />
      </div>

      <div className="space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[11px] font-mono text-emerald-400">
          <AlertCircle size={12} />
          <span>{info.phase}</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-100">{info.title}</h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
          {info.description}
        </p>
      </div>

      <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
        {info.quickLink && (
          <Link
            to={info.quickLink.to}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            {info.quickLink.text}
          </Link>
        )}
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs font-medium border border-slate-800 transition-colors"
        >
          <ArrowLeft size={14} /> Back to Dashboard
        </Link>
      </div>
    </div>
  );
};
