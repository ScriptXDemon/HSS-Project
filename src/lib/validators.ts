import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number').optional(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const memberApplySchema = z
  .object({
    fullName: z.string().min(2, 'Full name is required'),
    fatherName: z.string().min(2, "Father's name is required"),
    dob: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
    gender: z.enum(['Male', 'Female', 'Other']),
    bloodGroup: z.string().optional(),
    aadharNumber: z
      .string()
      .regex(/^\d{12}$/, 'Aadhar must be 12 digits')
      .optional()
      .or(z.literal('')),
    address: z.string().min(5, 'Address is required'),
    district: z.string().min(2, 'District is required'),
    state: z.string().min(2, 'State is required'),
    pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
    occupation: z.string().optional(),
    phone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number'),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Must contain at least one special character'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .superRefine((value, ctx) => {
    if (value.password !== value.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message: 'Passwords do not match',
      });
    }
  });

export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .optional()
    .or(z.literal('')),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const donationSchema = z.object({
  donorName: z.string().min(2, 'Name is required'),
  donorEmail: z.string().email().optional().or(z.literal('')),
  donorPhone: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number')
    .optional()
    .or(z.literal('')),
  amount: z.number().min(1, 'Amount must be at least INR 1'),
  isAnonymous: z.boolean().default(false),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
});

export const eventSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  slug: z
    .string()
    .min(3, 'Slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens'),
  description: z.string().min(10, 'Description is required'),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  endDate: z.string().optional(),
  venue: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const siteContentSchema = z.object({
  title: z.string().optional(),
  body: z.string().min(1, 'Content body is required'),
});

export const importantLinkSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  url: z.string().url('Invalid URL'),
  icon: z.string().optional(),
  sortOrder: z.number().default(0),
  isActive: z.boolean().default(true),
});
