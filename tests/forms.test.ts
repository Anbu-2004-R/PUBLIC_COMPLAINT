import { describe, it, expect } from 'vitest';
import * as z from 'zod';

const registerValidationSchema = z
  .object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Please enter a valid email address'),
    phone: z
      .string()
      .min(10, 'Mobile number must be at least 10 digits')
      .refine(
        (val) => {
          const cleaned = val.replace(/[\s-]/g, '');
          return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
        },
        { message: 'Please enter a valid 10-digit mobile number' }
      ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    confirmPassword: z.string(),
    acceptTerms: z.literal(true),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

const complaintSubmissionSchema = z.object({
  categoryId: z.string().min(1, 'Please select a grievance category'),
  title: z.string().min(5, 'Title must be at least 5 characters').max(120),
  description: z.string().min(20, 'Please provide a detailed description of at least 20 characters'),
  wardZoneId: z.string().min(1, 'Please select the affected ward / zone'),
  exactLocation: z.string().min(5, 'Please provide an exact landmark, street, or house address'),
});

describe('Form Validation Schemas (SRS FR-01, FR-05)', () => {
  it('validates correct citizen registration data', () => {
    const validData = {
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+919876543210',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      acceptTerms: true,
    };

    const parsed = registerValidationSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('validates citizen registration data with spaced phone numbers (+91 8098369020)', () => {
    const validDataWithSpace = {
      fullName: 'Anbuselvan',
      email: 'anbuselvanswarna@gmail.com',
      phone: '+91 8098369020',
      password: 'SecurePass123!',
      confirmPassword: 'SecurePass123!',
      acceptTerms: true,
    };

    const parsed = registerValidationSchema.safeParse(validDataWithSpace);
    expect(parsed.success).toBe(true);
  });

  it('fails registration when password lacks uppercase, number, or special character', () => {
    const weakPasswordData = {
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+919876543210',
      password: 'password', // weak
      confirmPassword: 'password',
      acceptTerms: true,
    };

    const parsed = registerValidationSchema.safeParse(weakPasswordData);
    expect(parsed.success).toBe(false);
  });

  it('fails registration when passwords do not match', () => {
    const mismatchedData = {
      fullName: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phone: '+919876543210',
      password: 'SecurePass123!',
      confirmPassword: 'DifferentPass123!',
      acceptTerms: true,
    };

    const parsed = registerValidationSchema.safeParse(mismatchedData);
    expect(parsed.success).toBe(false);
  });

  it('validates required fields for complaint submission', () => {
    const validComplaint = {
      categoryId: 'cat-roads',
      title: 'Deep pothole on Ring Road',
      description: 'Asphalt has collapsed forming a 2-foot trench across the main bus bay lane.',
      wardZoneId: 'w-1',
      exactLocation: 'Opposite Metro Gate 2',
    };

    expect(complaintSubmissionSchema.safeParse(validComplaint).success).toBe(true);

    // Short title fails
    expect(
      complaintSubmissionSchema.safeParse({ ...validComplaint, title: 'bad' }).success
    ).toBe(false);

    // Short description (<20 chars) fails
    expect(
      complaintSubmissionSchema.safeParse({ ...validComplaint, description: 'short text' }).success
    ).toBe(false);
  });
});
