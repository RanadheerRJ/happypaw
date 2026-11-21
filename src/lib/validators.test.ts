import { describe, expect, it } from 'vitest';
import {
  dogSchema,
  estimateDailyPortionG,
  loginSchema,
  normalizePhone,
  passwordSchema,
  phoneSchema,
  pincodeSchema,
  recommendedWeightBand,
  signupSchema,
  validateImageFile,
} from '@/lib/validators';

describe('phone validation', () => {
  it('normalises common Indian formats to +91', () => {
    expect(normalizePhone('98765 43210')).toBe('+919876543210');
    expect(normalizePhone('+91 98765-43210')).toBe('+919876543210');
    expect(normalizePhone('09876543210')).toBe('+919876543210');
    expect(normalizePhone('919876543210')).toBe('+919876543210');
  });

  it('accepts valid mobile numbers starting 6–9', () => {
    expect(phoneSchema.safeParse('9876543210').success).toBe(true);
    expect(phoneSchema.parse('9876543210')).toBe('+919876543210');
  });

  it('rejects invalid or landline-style numbers', () => {
    expect(phoneSchema.safeParse('1234567890').success).toBe(false);
    expect(phoneSchema.safeParse('98765').success).toBe(false);
    expect(phoneSchema.safeParse('+91987654321').success).toBe(false);
  });
});

describe('pincode validation', () => {
  it('requires exactly six digits', () => {
    expect(pincodeSchema.safeParse('500081').success).toBe(true);
    expect(pincodeSchema.safeParse('50008').success).toBe(false);
    expect(pincodeSchema.safeParse('5000811').success).toBe(false);
    expect(pincodeSchema.safeParse('ABCDEF').success).toBe(false);
  });
});

describe('password and signup', () => {
  it('requires length, a letter and a number', () => {
    expect(passwordSchema.safeParse('Demo@1234').success).toBe(true);
    expect(passwordSchema.safeParse('allletters').success).toBe(false);
    expect(passwordSchema.safeParse('12345678').success).toBe(false);
    expect(passwordSchema.safeParse('a1').success).toBe(false);
  });

  it('rejects mismatched passwords and missing consent', () => {
    const base = {
      fullName: 'Priya Reddy',
      email: 'priya@example.com',
      phone: '9876543210',
      password: 'Demo@1234',
      confirmPassword: 'Demo@1234',
      consent: true as const,
    };
    expect(signupSchema.safeParse(base).success).toBe(true);

    const mismatch = signupSchema.safeParse({ ...base, confirmPassword: 'Different1' });
    expect(mismatch.success).toBe(false);
    if (!mismatch.success) {
      expect(mismatch.error.issues[0]?.path).toEqual(['confirmPassword']);
    }

    expect(signupSchema.safeParse({ ...base, consent: false }).success).toBe(false);
  });

  it('validates the login email format', () => {
    expect(loginSchema.safeParse({ email: 'not-an-email', password: 'x' }).success).toBe(false);
    expect(loginSchema.safeParse({ email: 'a@b.co', password: 'x' }).success).toBe(true);
  });
});

describe('dog profile', () => {
  const valid = {
    name: 'Coco',
    breed: 'Indie',
    dob: '2021-06-14',
    weightKg: 18.4,
    bodyCondition: 'ideal',
    activityLevel: 'high',
    neutered: true,
    allergies: ['Chicken'],
    medicalNotes: '',
    currentFood: 'Kibble',
    picky: false,
  };

  it('accepts a valid profile and coerces weight from a string input', () => {
    expect(dogSchema.safeParse(valid).success).toBe(true);
    const parsed = dogSchema.parse({ ...valid, weightKg: '18.4' });
    expect(parsed.weightKg).toBeCloseTo(18.4);
  });

  it('rejects weights outside 0.5–90 kg', () => {
    expect(dogSchema.safeParse({ ...valid, weightKg: 0.2 }).success).toBe(false);
    expect(dogSchema.safeParse({ ...valid, weightKg: 91 }).success).toBe(false);
    expect(dogSchema.safeParse({ ...valid, weightKg: 0.5 }).success).toBe(true);
  });

  it('rejects future and implausibly old dates of birth', () => {
    const future = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
    expect(dogSchema.safeParse({ ...valid, dob: future }).success).toBe(false);
    expect(dogSchema.safeParse({ ...valid, dob: '1990-01-01' }).success).toBe(false);
  });
});

describe('derived helpers', () => {
  it('maps weight to a plan band', () => {
    expect(recommendedWeightBand(6)).toBe('small');
    expect(recommendedWeightBand(10)).toBe('small');
    expect(recommendedWeightBand(18)).toBe('medium');
    expect(recommendedWeightBand(25)).toBe('medium');
    expect(recommendedWeightBand(31)).toBe('large');
    expect(recommendedWeightBand(42)).toBe('special');
  });

  it('estimates a daily portion that increases with activity', () => {
    const low = estimateDailyPortionG(20, 'low');
    const moderate = estimateDailyPortionG(20, 'moderate');
    const high = estimateDailyPortionG(20, 'high');
    expect(low).toBeLessThan(moderate);
    expect(moderate).toBeLessThan(high);
    expect(moderate).toBe(440);
  });
});

describe('image upload validation', () => {
  const file = (type: string, size: number) => new File([new Uint8Array(size)], 'dog', { type });

  it('accepts jpg/png/webp under 5 MB', () => {
    expect(validateImageFile(file('image/jpeg', 1024))).toBeNull();
    expect(validateImageFile(file('image/webp', 1024))).toBeNull();
  });

  it('rejects unsupported types and oversized files', () => {
    expect(validateImageFile(file('application/pdf', 1024))).toMatch(/JPG|PNG|WebP/);
    expect(validateImageFile(file('image/png', 6 * 1024 * 1024))).toMatch(/5 MB/);
  });
});
