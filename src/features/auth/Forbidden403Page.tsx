import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { Button } from '../../components/ui/Button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../app/AuthContext';

export function Forbidden403Page() {
  const { user } = useAuth();

  const homeRoute = !user
    ? ROUTES.LOGIN
    : user.role === 'CITIZEN'
    ? ROUTES.CITIZEN_DASHBOARD
    : user.role === 'OFFICER'
    ? ROUTES.OFFICER_DASHBOARD
    : ROUTES.ADMIN_DASHBOARD;

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <h1 className="text-xl font-bold text-slate-900">403 — Access Denied</h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          You do not possess the required role permissions to view or perform operations on this resource.
          Access controls are strictly enforced at the backend boundary.
        </p>

        <div className="pt-2">
          <Link to={homeRoute}>
            <Button size="md" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Return to Authorized Workspace
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
