import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  serverUrl: process.env.SERVER_URL || 'http://localhost:5000',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_skincare_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  isProduction: process.env.NODE_ENV === 'production',
  sslCommerz: {
    storeId: process.env.SSLCOMMERZ_STORE_ID || 'testbox',
    storePassword: process.env.SSLCOMMERZ_STORE_PASSWORD || 'qwerty',
    isSandbox: process.env.SSLCOMMERZ_IS_SANDBOX !== 'false',
  },
  bkash: {
    baseUrl: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
    appKey: process.env.BKASH_APP_KEY || '',
    appSecret: process.env.BKASH_APP_SECRET || '',
    username: process.env.BKASH_USERNAME || '',
    password: process.env.BKASH_PASSWORD || '',
  },
  nagad: {
    baseUrl: process.env.NAGAD_BASE_URL || 'http://sandbox.mynagad.com:10080',
    merchantId: process.env.NAGAD_MERCHANT_ID || '',
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    apiKey: process.env.CLOUDINARY_API_KEY || '',
    apiSecret: process.env.CLOUDINARY_API_SECRET || '',
    url: process.env.CLOUDINARY_URL || '',
  }
};
