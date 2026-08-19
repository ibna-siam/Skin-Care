import { Router } from 'express';
import { register, login, logout, getMe, updateProfile, addAddress, deleteAddress } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/addresses', authenticate, addAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;
