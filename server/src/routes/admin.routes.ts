import { Router } from 'express';
import {
  getDashboardStats,
  adminGetProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminGetCustomers,
  adminGetReviews,
  adminModerateReview,
  adminGetCoupons,
  adminCreateCoupon,
  adminUpdateCMSSection,
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

// Products CRUD
router.get('/products', adminGetProducts);
router.post('/products', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminCreateProduct);
router.put('/products/:id', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminUpdateProduct);
router.delete('/products/:id', requireRole('SUPER_ADMIN', 'PRODUCT_MANAGER'), adminDeleteProduct);

// Orders
router.get('/orders', adminGetOrders);
router.put('/orders/:id/status', requireRole('SUPER_ADMIN', 'ORDER_MANAGER'), adminUpdateOrderStatus);

// Customers
router.get('/customers', adminGetCustomers);

// Reviews
router.get('/reviews', adminGetReviews);
router.put('/reviews/:id/moderate', requireRole('SUPER_ADMIN', 'SUPPORT_STAFF', 'MARKETING_MANAGER'), adminModerateReview);

// Coupons
router.get('/coupons', adminGetCoupons);
router.post('/coupons', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminCreateCoupon);

// CMS
router.put('/cms/sections/:sectionKey', requireRole('SUPER_ADMIN', 'MARKETING_MANAGER'), adminUpdateCMSSection);

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
