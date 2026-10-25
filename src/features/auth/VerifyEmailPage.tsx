import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../config/routes';
import { Button } from '../../components/ui/Button';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Missing email verification token in link.');
      return;
    }

    authService
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message || 'Verification token is invalid or has expired.');
      });
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;
    try {
      const res = await authService.resendVerification(resendEmail);
      setResendStatus(res.message);
    } catch {
      setResendStatus('If that email is registered, a new verification link has been sent.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <DemoBanner />

      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
          {status === 'loading' && (
            <div className="py-8 space-y-3">
              <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Verifying your email token...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Email Verified Successfully</h1>
              <p className="text-xs text-slate-600 leading-relaxed">{message}</p>
              <div className="pt-2">
                <Link to={ROUTES.LOGIN}>
                  <Button size="md" className="w-full">
                    Proceed to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">Verification Link Expired</h1>
              <p className="text-xs text-rose-700 leading-relaxed">{message}</p>

              {/* Resend Verification Form */}
              <div className="pt-4 border-t border-slate-100 text-left">
                <p className="text-xs font-semibold text-slate-800 mb-2">Request a new verification email:</p>
                <form onSubmit={handleResend} className="space-y-2">
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <Button type="submit" size="sm" variant="outline" className="w-full">
                    <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                    Resend Verification Link
                  </Button>
                </form>
                {resendStatus && (
                  <p className="text-[11px] text-emerald-700 mt-2 bg-emerald-50 p-2 rounded border border-emerald-200">
                    {resendStatus}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <Link to={ROUTES.LOGIN}>
                  <Button variant="ghost" size="sm" className="w-full text-slate-500">
                    Back to Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
