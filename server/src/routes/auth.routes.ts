import { Router } from 'express';
import {
  register,
  login,
  adminLogin,
  forgotPassword,
  resetPassword,
  googleAuth,
  changePassword,
  logout,
  getMe,
  updateProfile,
  addAddress,
  deleteAddress,
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

// Public Customer Auth
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/google', authLimiter, googleAuth);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// Dedicated Admin Auth
router.post('/admin-login', authLimiter, adminLogin);

// Authenticated Session Actions
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfile);
router.post('/change-password', authenticate, changePassword);
router.post('/addresses', authenticate, addAddress);
router.delete('/addresses/:id', authenticate, deleteAddress);

export default router;

