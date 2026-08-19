import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().refine((val) => !val || /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(val.replace(/[\s-]/g, '')), {
    message: 'Invalid Bangladeshi phone number (e.g. 01712345678)',
  }),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  preferredSkinType: z.string().optional(),
});

export const loginSchema = z.object({
  identifier: z.string().min(1, 'Email or Phone is required'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  preferredSkinType: z.string().optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});
