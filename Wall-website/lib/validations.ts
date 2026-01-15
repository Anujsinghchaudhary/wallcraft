import { z } from 'zod'

export const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
})

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const wallpaperSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  price: z.number().min(0, 'Price must be non-negative'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).optional(),
  previewUrl: z.string().url('Please enter a valid preview URL'),
  thumbnailUrl: z.string().url('Please enter a valid thumbnail URL'),
  fileUrl: z.string().min(1, 'File URL is required'),
  resolution: z.string().optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
})

export const checkoutSchema = z.object({
  wallpaperId: z.string().min(1, 'Wallpaper ID is required'),
  paymentMethod: z.enum(['RAZORPAY', 'CRYPTO_USDT']),
})

export type SignupInput = z.infer<typeof signupSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type WallpaperInput = z.infer<typeof wallpaperSchema>
export type CheckoutInput = z.infer<typeof checkoutSchema>
