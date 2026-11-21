import { z } from 'zod';

/**
 * All form validation lives here so the same rules run in every portal.
 * Mirror the important ones as DB constraints (see supabase/migrations).
 */

export const PHONE_REGEX = /^\+91[6-9]\d{9}$/;
export const PINCODE_REGEX = /^\d{6}$/;

/** +91 98765 43210 / 9876543210 / +919876543210 → "+919876543210" */
export function normalizePhone(input: string): string {
  const digits = input.replace(/[^\d+]/g, '');
  if (digits.startsWith('+91')) return digits;
  if (digits.startsWith('91') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 11) return `+91${digits.slice(1)}`;
  if (digits.length === 10) return `+91${digits}`;
  return digits;
}

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .email('Enter a valid email address')
  .max(160, 'That email is too long');

export const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Enter your mobile number')
  .transform(normalizePhone)
  .refine((value) => PHONE_REGEX.test(value), 'Enter a valid Indian mobile number (+91 6–9…)');

export const pincodeSchema = z
  .string()
  .trim()
  .min(1, 'Enter your 6-digit pincode')
  .regex(PINCODE_REGEX, 'Pincode must be exactly 6 digits');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Please enter at least 2 characters')
  .max(60, 'Keep it under 60 characters');

export const passwordSchema = z
  .string()
  .min(8, 'Use at least 8 characters')
  .max(72, 'Use 72 characters or fewer')
  .regex(/[A-Za-z]/, 'Include at least one letter')
  .regex(/\d/, 'Include at least one number');

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Enter your password'),
});

export const signupSchema = z
  .object({
    fullName: nameSchema,
    email: emailSchema,
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Re-enter your password'),
    consent: z
      .boolean()
      .refine((value) => value === true, 'Please accept the terms and privacy policy to continue'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: z.union([phoneSchema, z.literal('')]).optional(),
  topic: z.enum(['general', 'subscription', 'delivery', 'vet', 'partnership']),
  message: z
    .string()
    .trim()
    .min(10, 'Tell us a little more (at least 10 characters)')
    .max(1200, 'Keep it under 1,200 characters'),
});

export const waitlistSchema = z.object({
  email: emailSchema,
  pincode: pincodeSchema,
});

export const pincodeCheckSchema = z.object({ pincode: pincodeSchema });

export const bodyConditions = ['underweight', 'ideal', 'overweight'] as const;
export const activityLevels = ['low', 'moderate', 'high'] as const;

export const allergyOptions = [
  'Chicken',
  'Beef',
  'Lamb',
  'Fish',
  'Dairy',
  'Wheat / gluten',
  'Soy',
  'Eggs',
  'None known',
] as const;

const dobSchema = z
  .string()
  .min(1, "Enter your dog's date of birth")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), 'Enter a valid date')
  .refine((value) => new Date(value) <= new Date(), 'Date of birth cannot be in the future')
  .refine(
    (value) => new Date(value) >= new Date(Date.now() - 25 * 365.25 * 86_400_000),
    "That date is over 25 years ago — please check it",
  );

export const dogSchema = z.object({
  name: nameSchema,
  photoUrl: z.string().optional(),
  breed: z.string().trim().max(60, 'Keep the breed under 60 characters').optional().default(''),
  dob: dobSchema,
  weightKg: z.coerce
    .number({ invalid_type_error: 'Enter a weight in kg' })
    .min(0.5, 'Weight must be at least 0.5 kg')
    .max(90, 'Weight must be 90 kg or less'),
  bodyCondition: z.enum(bodyConditions, { errorMap: () => ({ message: 'Pick a body condition' }) }),
  activityLevel: z.enum(activityLevels, { errorMap: () => ({ message: 'Pick an activity level' }) }),
  neutered: z.boolean(),
  allergies: z.array(z.string()).default([]),
  medicalNotes: z.string().trim().max(500, 'Keep notes under 500 characters').optional().default(''),
  currentFood: z.string().trim().max(120, 'Keep this under 120 characters').optional().default(''),
  picky: z.boolean().default(false),
});

export type DogFormValues = z.infer<typeof dogSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type LoginFormValues = z.infer<typeof loginSchema>;
export type ContactFormValues = z.infer<typeof contactSchema>;
export type WaitlistFormValues = z.infer<typeof waitlistSchema>;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    return 'Upload a JPG, PNG or WebP image';
  }
  if (file.size > MAX_IMAGE_BYTES) return 'Image must be 5 MB or smaller';
  return null;
}

/** Weight band recommendation used by the dog wizard and plan picker. */
export function recommendedWeightBand(weightKg: number): 'small' | 'medium' | 'large' | 'special' {
  if (weightKg <= 10) return 'small';
  if (weightKg <= 25) return 'medium';
  if (weightKg <= 40) return 'large';
  return 'special';
}

/** Rough daily portion estimate (2% of body weight, split into two meals). */
export function estimateDailyPortionG(weightKg: number, activity: 'low' | 'moderate' | 'high'): number {
  const factor = activity === 'low' ? 0.018 : activity === 'high' ? 0.026 : 0.022;
  return Math.round((weightKg * factor * 1000) / 10) * 10;
}

export function fieldError(message?: string): string | undefined {
  return message;
}
