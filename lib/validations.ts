import { z } from 'zod'

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name required'),
  email: z.string().email('Invalid email'),
  password: z
    .string()
    .min(8, 'Minimum 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase')
    .regex(/[0-9]/, 'Must contain number'),
})

export const companySchema = z.object({
  name: z.string().min(2, 'Company name required'),
  category: z.string().min(1, 'Category required'),
  district: z.string().min(1, 'District required'),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  description: z.string().optional(),
})

export const reviewSchema = z.object({
  companyId: z.string(),
  paymentId: z.string(),
  rating: z.number().min(1).max(5),
  category: z.enum([
    'Staff Attitude',
    'Speed of Service',
    'Problem Resolution',
    'Facility Condition',
    'Overall Experience',
  ]),
  comment: z.string().min(50, 'Comment must be at least 50 characters'),
})

export const mtnPaymentSchema = z.object({
  phone: z
    .string()
    .regex(/^07[89]\d{7}$/, 'Must be MTN number starting with 078 or 079'),
  companyId: z.string(),
  companyName: z.string(),
})

export const flagSchema = z.object({
  reviewId: z.string(),
  reason: z.enum([
    'Fake review',
    'Spam',
    'Inappropriate content',
    'Wrong company',
    'Other',
  ]),
})
