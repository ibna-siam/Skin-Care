import { Router } from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';
import adminRoutes from './admin.routes.js';
import mediaRoutes from './media.routes.js';
import paymentRoutes from './payment.routes.js';
import { getSitemapXml, getRobotsTxt } from '../controllers/seo.controller.js';

const router = Router();

// SEO Search Engine Discovery Endpoints
router.get('/sitemap.xml', getSitemapXml);
router.get('/robots.txt', getRobotsTxt);

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/media', mediaRoutes);
router.use('/payment', paymentRoutes);
router.use('/payments', paymentRoutes);
router.use('/', cartRoutes);
router.use('/', orderRoutes);
router.use('/admin', adminRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), service: 'Skincare Bangladesh API' });
});

export default router;
