import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await authService.forgotPassword(email);
      setMessage(res.message);
      setIsSubmitted(true);
    } catch {
      setMessage('If your email is registered, you will receive password reset instructions shortly.');
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <DemoBanner />

      <div className="p-6">
        <Link
          to={ROUTES.LOGIN}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Sign In
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          {isSubmitted ? (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Check your inbox</h2>
              <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
              <div className="pt-3 flex flex-col gap-2">
                <Link to={`${ROUTES.RESET_PASSWORD}?token=demo-reset-token`}>
                  <Button size="sm" className="w-full">
                    Simulate Reset Link Click (Demo Mode)
                  </Button>
                </Link>
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" className="w-full text-slate-500">
                    Return to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mx-auto mb-4">
                <Mail className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-1">Forgot your password?</h1>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Enter your registered email address and we will dispatch a secure password reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <Input
                  label="Registered Email Address"
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <Button type="submit" size="md" className="w-full" isLoading={isLoading}>
                  Send Reset Instructions
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
