import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { ShieldCheck, Mail, Phone, HelpCircle } from 'lucide-react';

import { CivicPulseLogo } from '../ui/CivicPulseLogo';

export function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Neutrality Note */}
          <div className="md:col-span-1 space-y-3">
            <CivicPulseLogo size="sm" linkToHome={true} />
            <p className="text-xs text-slate-500 leading-relaxed">
              CivicPulse is an independent, accountable case-management platform connecting public citizens, department
              engineers, and municipal oversight administrators.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-[#0D9488]" />
              <span>Transparent civic grievance tracking</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Platform Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to={ROUTES.HOME} className="hover:text-slate-900 transition-colors">
                  Overview & Purpose
                </Link>
              </li>
              <li>
                <Link to={ROUTES.LOGIN} className="hover:text-slate-900 transition-colors">
                  Citizen & Staff Sign In
                </Link>
              </li>
              <li>
                <Link to={ROUTES.REGISTER} className="hover:text-slate-900 transition-colors">
                  Citizen Account Registration
                </Link>
              </li>
              <li>
                <a href="#categories" className="hover:text-slate-900 transition-colors">
                  10 Service Categories
                </a>
              </li>
            </ul>
          </div>

          {/* Compliance & Workflow */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Governance & Standards</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-slate-500">SRS v1.1 Specification Baseline</span>
              </li>
              <li>
                <span className="text-slate-500">7-Day Mandatory Citizen Objection Window</span>
              </li>
              <li>
                <span className="text-slate-500">Evidence-Backed Resolution Reports</span>
              </li>
              <li>
                <span className="text-slate-500">Immutable Audit Logging</span>
              </li>
            </ul>
          </div>

          {/* Contact & Support Placeholder */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Grievance Cell Helpdesk</h4>
            <div className="space-y-2 text-xs text-slate-500">
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>support@civicpulse.org</span>
              </p>
              <p className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>1800-425-0010 (Toll-Free Mon-Fri)</span>
              </p>
              <p className="flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                <span>Working Hours: 09:00 - 18:00 IST</span>
              </p>
            </div>
          </div>
        </div>

        {/* Disclaimer per Prompt Section 3 */}
        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            This software is an educational prototype and civic case-management demonstration system. It is not an
            official government portal.
          </p>
          <p>© {new Date().getFullYear()} CivicPulse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
