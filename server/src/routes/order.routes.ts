import { Router } from 'express';
import { createOrder, trackOrder, getCustomerOrders, getOrderDetails } from '../controllers/order.controller.js';
import { validateCoupon } from '../controllers/coupon.controller.js';
import { verifyPaymentCallback } from '../controllers/payment.controller.js';
import { submitReview, getFeaturedReviews, getProductReviews } from '../controllers/review.controller.js';
import { getQuizQuestions, submitQuizAndGetRoutine } from '../controllers/skinGuide.controller.js';
import { getHomepageSections, subscribeNewsletter, getPublicStoreSettings, getPublicBanners } from '../controllers/cms.controller.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = Router();

// Orders
router.post('/orders', optionalAuth, createOrder);
router.get('/orders/track', trackOrder);
router.get('/orders/my-orders', authenticate, getCustomerOrders);
router.get('/orders/:id', optionalAuth, getOrderDetails);

// Coupons
router.post('/coupons/validate', validateCoupon);

// Payment callback / sandbox verify
router.post('/payments/verify', verifyPaymentCallback);

// Reviews
router.post('/reviews', authenticate, submitReview);
router.get('/reviews/featured', getFeaturedReviews);
router.get('/reviews/product/:productId', getProductReviews);

// Skin Guide & Quiz
router.get('/skin-guide/questions', getQuizQuestions);
router.post('/skin-guide/recommendations', submitQuizAndGetRoutine);

// CMS, Store Settings, Banners & Newsletter
router.get('/cms/homepage', getHomepageSections);
router.get('/banners', getPublicBanners);
router.get('/settings/public', getPublicStoreSettings);
router.post('/newsletter/subscribe', subscribeNewsletter);

export default router;
