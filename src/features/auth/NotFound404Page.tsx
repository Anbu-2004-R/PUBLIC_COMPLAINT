import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { Button } from '../../components/ui/Button';
import { HelpCircle, ArrowLeft } from 'lucide-react';

export function NotFound404Page() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
          <HelpCircle className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-slate-900">404 — Page Not Found</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          The complaint or administration page you requested does not exist or has been relocated.
        </p>

        <div className="pt-2">
          <Link to={ROUTES.HOME}>
            <Button size="md" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
