import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ROUTES } from '../../config/routes';
import { authService } from '../../services/authService';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { ENV } from '../../config/env';
import { Eye, EyeOff, CheckCircle2, ArrowLeft, Mail, AlertCircle } from 'lucide-react';
import { CivicPulseLogo } from '../../components/ui/CivicPulseLogo';

const registerSchema = z
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
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'You must accept the terms of service and privacy notice',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

import { useAuth } from '../../app/AuthContext';

export function RegisterPage() {
  const { logout } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      phone: '+91',
    },
  });

  const passwordValue = watch('password', '');

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    try {
      // Clear any prior active session so user can log in with new credentials cleanly
      await logout();

      await authService.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      setRegisteredEmail(data.email);
      setIsSubmitted(true);
    } catch (err: any) {
      setServerError(err.message || 'Registration failed. Please check your details and try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
        <DemoBanner />
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Mail className="w-7 h-7" />
            </div>

            <h2 className="text-xl font-bold text-slate-900">Check your email</h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              We have sent a verification link to <strong className="text-slate-900">{registeredEmail}</strong>.
              Click the link inside to activate your account and submit complaints.
            </p>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-500 text-left space-y-1">
              <p className="font-semibold text-slate-700">SRS FR-01 Notice:</p>
              <p>Email verification proves ownership of the email inbox. No administrator approval step is required.</p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link to={`${ROUTES.VERIFY_EMAIL}?token=demo-verification-token`}>
                <Button size="md" className="w-full">
                  Simulate Email Link Click (Demo Mode)
                </Button>
              </Link>
              <Link to={`${ROUTES.LOGIN}?email=${encodeURIComponent(registeredEmail)}`}>
                <Button variant="ghost" size="sm" className="w-full text-slate-500">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <DemoBanner />

      <div className="p-6">
        <Link
          to={ROUTES.HOME}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to CivicPulse
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
          <div className="text-center mb-8 flex flex-col items-center">
            <CivicPulseLogo size="md" linkToHome={true} />
            <h1 className="text-lg font-semibold text-[#10192E] mt-3">Citizen Account Registration</h1>
            <p className="text-xs text-slate-500 mt-1">Register to submit grievances and receive official progress notifications</p>
          </div>

          {serverError && (
            <div className="mb-6 p-3.5 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2.5 text-xs text-rose-800">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              required
              placeholder="e.g. Priya Sharma"
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Email Address"
                type="email"
                required
                placeholder="name@example.com"
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Mobile Phone"
                type="tel"
                required
                placeholder="+91 98765 43210"
                hint="10-digit mobile number with +91"
                error={errors.phone?.message}
                {...register('phone')}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 pr-10 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-600">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Confirm Password <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    {...register('confirmPassword')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2 pr-10 text-sm text-slate-900 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[40px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Password Hint */}
            <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
              Must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special symbol.
            </div>

            {/* Terms and Privacy Notice Acceptance */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  {...register('acceptTerms')}
                  className="rounded border-slate-300 text-slate-900 focus:ring-slate-900 mt-0.5"
                />
                <span>
                  I accept the{' '}
                  <span className="font-semibold text-slate-900">Terms of Service</span> and acknowledge that my
                  contact details will only be used for official complaint handling under the CivicPulse Privacy Policy.
                </span>
              </label>
              {errors.acceptTerms && (
                <p className="text-xs text-rose-600 mt-1">{errors.acceptTerms.message}</p>
              )}
            </div>

            <Button type="submit" size="md" className="w-full mt-4" isLoading={isSubmitting}>
              Create Citizen Account
            </Button>
          </form>

          <div className="mt-6 text-center text-xs text-slate-500 border-t border-slate-100 pt-5">
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="font-semibold text-slate-900 hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
