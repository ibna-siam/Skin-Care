import { Router } from 'express';
import {
  verifyPaymentCallback,
  sslCommerzSuccess,
  sslCommerzFail,
  sslCommerzCancel,
  sslCommerzIPN,
  bkashCallback,
} from '../controllers/payment.controller.js';

const router = Router();

// Generic Verification
router.post('/verify', verifyPaymentCallback);

// SSLCOMMERZ Gateway Callbacks & IPN Webhooks (Both POST and GET to handle form redirects & browser queries)
router.post('/sslcommerz/success', sslCommerzSuccess);
router.get('/sslcommerz/success', sslCommerzSuccess);

router.post('/sslcommerz/fail', sslCommerzFail);
router.get('/sslcommerz/fail', sslCommerzFail);

router.post('/sslcommerz/cancel', sslCommerzCancel);
router.get('/sslcommerz/cancel', sslCommerzCancel);

router.post('/sslcommerz/ipn', sslCommerzIPN);
router.get('/sslcommerz/ipn', sslCommerzIPN);

// bKash Tokenized Checkout Callbacks
router.all('/bkash/callback', bkashCallback);

export default router;
