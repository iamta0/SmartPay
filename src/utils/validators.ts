// src/utils/validators.ts
import { z } from 'zod';

export const signupSchema = z.object({
  email:       z.string().email('Enter a valid email address.'),
  password:    z.string().min(8, 'Password must be at least 8 characters.'),
  displayName: z.string().min(2, 'Name must be at least 2 characters.').max(50),
  username:    z
    .string()
    .min(3, 'Username must be at least 3 characters.')
    .max(20, 'Username must be 20 characters or fewer.')
    .regex(/^[a-z0-9_]+$/, 'Use lowercase letters, numbers, and underscores only.'),
});

export const loginSchema = z.object({
  email:    z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

export const transferSchema = z.object({
  recipientEmail: z.string().email('Enter a valid recipient email.'),
  // amount passed in smallest unit (kobo/cents) — must be > 0
  amount:         z.number().int().positive('Amount must be greater than zero.'),
  note:           z.string().max(100, 'Note cannot exceed 100 characters.').optional(),
  currency:       z.enum(['NGN', 'USD', 'GBP', 'EUR']),
});

export type SignupInput   = z.infer<typeof signupSchema>;
export type LoginInput    = z.infer<typeof loginSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
