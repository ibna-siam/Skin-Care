import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().min(2, 'Customer name is required'),
  customerPhone: z.string().refine((val) => /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(val.replace(/[\s-]/g, '')), {
    message: 'Valid Bangladeshi phone number is required (e.g. 01712345678)',
  }),
  customerEmail: z.string().email('Valid email is required'),
  division: z.string().min(1, 'Division is required'),
  district: z.string().min(1, 'District is required'),
  area: z.string().min(1, 'Area is required'),
  fullAddress: z.string().min(5, 'Full street address is required'),
  postalCode: z.string().optional().nullable(),
  deliveryMethod: z.enum(['STANDARD', 'EXPRESS']).default('STANDARD'),
  paymentMethod: z.enum(['COD', 'BKASH', 'NAGAD', 'SSLCOMMERZ', 'CARD']).default('COD'),
  couponCode: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  items: z.array(z.object({
    productId: z.string().min(1),
    quantity: z.number().int().min(1),
  })).min(1, 'Order must contain at least one product'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'FAILED',
    'RETURNED',
    'REFUNDED',
  ]),
  note: z.string().optional(),
  trackingNumber: z.string().optional(),
  courierName: z.string().optional(),
  estimatedDelivery: z.string().optional(),
});
