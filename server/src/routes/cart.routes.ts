import { Router } from 'express';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from '../controllers/cart.controller.js';
import { getWishlist, toggleWishlist } from '../controllers/wishlist.controller.js';
import { optionalAuth, authenticate } from '../middleware/auth.js';

const router = Router();

// Cart routes
router.get('/cart', optionalAuth, getCart);
router.post('/cart', optionalAuth, addToCart);
router.post('/cart/clear', optionalAuth, clearCart);
router.delete('/cart/clear', optionalAuth, clearCart);
router.put('/cart/items/:id', optionalAuth, updateCartItem);
router.delete('/cart/items/:id', optionalAuth, removeCartItem);

// Wishlist routes
router.get('/wishlist', authenticate, getWishlist);
router.post('/wishlist/toggle', authenticate, toggleWishlist);

export default router;
