import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { ROUTES } from '../../config/routes';

import { CivicPulseLogo } from '../ui/CivicPulseLogo';

export function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handlePrimaryAction = () => {
    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CITIZEN_NEW_COMPLAINT)}`);
    } else if (user.role === 'CITIZEN') {
      navigate(ROUTES.CITIZEN_NEW_COMPLAINT);
    } else if (user.role === 'OFFICER') {
      navigate(ROUTES.OFFICER_DASHBOARD);
    } else {
      navigate(ROUTES.ADMIN_DASHBOARD);
    }
  };

  const dashboardPath = user
    ? user.role === 'CITIZEN'
      ? ROUTES.CITIZEN_DASHBOARD
      : user.role === 'OFFICER'
      ? ROUTES.OFFICER_DASHBOARD
      : ROUTES.ADMIN_DASHBOARD
    : ROUTES.LOGIN;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-3.5">
        {/* Zone 1: Brand Logo */}
        <CivicPulseLogo size="sm" linkToHome={true} />

        {/* Zone 2: 4-5 clean single-line text nav links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <a href="#how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            How It Works
          </a>
          <a href="#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            System Features
          </a>
          <a href="#categories" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Grievance Categories
          </a>
          <a href="#accountability" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Accountability
          </a>
          <a href="#faq" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            FAQ
          </a>
        </nav>

        {/* Zone 3: Primary action button + secondary sign-in/dashboard link */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              to={dashboardPath}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Go to Workspace ({user.role})
            </Link>
          ) : (
            <Link
              to={ROUTES.LOGIN}
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors px-2 py-1 whitespace-nowrap shrink-0"
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            onClick={handlePrimaryAction}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 shadow-xs cursor-pointer"
          >
            Submit Complaint
          </button>
        </div>
      </div>
    </header>
  );
}
