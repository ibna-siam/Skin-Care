import { Router } from 'express';
import multer from 'multer';
import {
  adminGetMediaAssets,
  adminUploadMediaAsset,
  adminReplaceSlotImage,
  adminUpdateMediaAsset,
  adminDeleteMediaAsset,
  getPublicMediaSlots,
} from '../controllers/media.controller.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 }, // 8MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Public Endpoint for Storefront Media Slots (Zero-Lag Cached)
router.get('/slots', getPublicMediaSlots);

// Admin-Protected Media Management Routes
router.use(
  authenticate,
  requireRole('SUPER_ADMIN', 'ADMIN', 'PRODUCT_MANAGER', 'MARKETING_MANAGER')
);

router.get('/', adminGetMediaAssets);
router.post('/upload', upload.single('image'), adminUploadMediaAsset);
router.put('/slots/:slot', upload.single('image'), adminReplaceSlotImage);
router.put('/:id', adminUpdateMediaAsset);
router.delete('/:id', adminDeleteMediaAsset);

export default router;
