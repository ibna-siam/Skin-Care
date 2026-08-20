import { Router } from 'express';
import {
  getDashboardStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUpdateProductStock,
  adminBulkUpdateProducts,
  adminExportProducts,
  adminGetOrders,
  adminGetOrderDetail,
  adminUpdateOrderStatus,
  adminBulkUpdateOrderStatus,
  adminExportOrders,
  adminGetCustomers,
  adminGetCustomerDetail,
  adminExportCustomers,
  adminGetReviews,
  adminModerateReview,
  adminDeleteReview,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminGetCMSSections,
  adminUpdateCMSSection,
  adminGetBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminGetAutomations,
  adminToggleAutomation,
  adminRunAutomation,
  adminGetAutomationLogs,
  adminGetNotifications,
  adminSendBroadcastNotification,
} from '../controllers/admin.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// Protect all admin routes with authentication and role check
router.use(
  authenticate,
  requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER', 'ORDER_MANAGER', 'MARKETING_MANAGER', 'SUPPORT_STAFF')
);

// Admin Dashboard KPIs
router.get('/dashboard', getDashboardStats);

// Products CRUD & Inventory
router.get('/products', adminGetProducts);
router.get('/products/export/csv', adminExportProducts);
router.post('/products', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminCreateProduct);
router.put('/products/:id', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminUpdateProduct);
router.patch('/products/:id/stock', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminUpdateProductStock);
router.post('/products/bulk-status', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminBulkUpdateProducts);
router.delete('/products/:id', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminDeleteProduct);

// Orders
router.get('/orders', adminGetOrders);
router.get('/orders/export/csv', adminExportOrders);
router.get('/orders/:id', adminGetOrderDetail);
router.put('/orders/:id/status', requireRole('SUPER_ADMIN', 'ORDER_MANAGER'), adminUpdateOrderStatus);
router.post('/orders/bulk-status', requireRole('SUPER_ADMIN', 'ORDER_MANAGER'), adminBulkUpdateOrderStatus);

// Customers CRM
router.get('/customers', adminGetCustomers);
router.get('/customers/export/csv', adminExportCustomers);
router.get('/customers/:id', adminGetCustomerDetail);

// Reviews Moderation Hub
router.get('/reviews', adminGetReviews);
router.put('/reviews/:id/moderate', requireRole('SUPER_ADMIN', 'SUPPORT_STAFF', 'MARKETING_MANAGER'), adminModerateReview);
router.delete('/reviews/:id', requireRole('SUPER_ADMIN', 'SUPPORT_STAFF', 'MARKETING_MANAGER'), adminDeleteReview);

// Coupons & Discounts
router.get('/coupons', adminGetCoupons);
router.post('/coupons', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminCreateCoupon);
router.put('/coupons/:id', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminUpdateCoupon);
router.delete('/coupons/:id', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminDeleteCoupon);

// CMS & Homepage Sections
router.get('/cms', adminGetCMSSections);
router.put('/cms/sections/:sectionKey', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminUpdateCMSSection);

// Banners
router.get('/banners', adminGetBanners);
router.post('/banners', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminCreateBanner);
router.put('/banners/:id', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminUpdateBanner);
router.delete('/banners/:id', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminDeleteBanner);

// Background Automation Engine & Job Scheduler
router.get('/automations', adminGetAutomations);
router.patch('/automations/:id/toggle', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminToggleAutomation);
router.post('/automations/run', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminRunAutomation);
router.get('/automations/logs', adminGetAutomationLogs);

// Notification Center
router.get('/notifications', adminGetNotifications);
router.post('/notifications/broadcast', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminSendBroadcastNotification);

// Image Upload (Cloudinary / Fallback)
import multer from 'multer';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { sendSuccess, sendError } from '../utils/response.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

router.post('/upload', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400);
    }
    const folder = (req.body.folder as string) || 'skincare-products';
    const result = await uploadToCloudinary(req.file.buffer, folder);
    return sendSuccess(res, result, 'Image uploaded successfully');
  } catch (error) {
    next(error);
  }
});

export default router;
