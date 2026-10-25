import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar } from '../../components/layout/Navbar';
import { PublicFooter } from '../../components/layout/PublicFooter';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { Button } from '../../components/ui/Button';
import { ROUTES } from '../../config/routes';
import { CATEGORIES } from '../../config/referenceData';
import { useAuth } from '../../app/AuthContext';
import {
  FileCheck2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  HelpCircle,
  Building,
  ArrowRight,
  Search,
  MessageSquare,
  Lock,
} from 'lucide-react';

export function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmitComplaint = () => {
    if (!user) {
      navigate(`${ROUTES.LOGIN}?redirect=${encodeURIComponent(ROUTES.CITIZEN_NEW_COMPLAINT)}`);
    } else {
      navigate(ROUTES.CITIZEN_NEW_COMPLAINT);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <DemoBanner />
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-20 sm:py-28 px-6 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
          <div className="max-w-5xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Civic Case Management & Public Accountability System</span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
              Report civic problems. Track official actions. Hold departments accountable.
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              CivicPulse streamlines the submission and resolution of neighborhood infrastructure and sanitation
              grievances. Every report is audited, assigned to eligible officers, and verified before closure.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={handleSubmitComplaint} className="w-full sm:w-auto px-8 text-sm">
                Submit a Complaint
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Link to={ROUTES.LOGIN} className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="w-full sm:w-auto px-6 text-sm bg-white">
                  Sign In to Track Existing Cases
                </Button>
              </Link>
            </div>

            <p className="text-xs text-slate-500 pt-2">
              Registration required to ensure legitimate reporting and private updates. No public browsing of private records.
            </p>
          </div>
        </section>

        {/* 3-Step Process Section */}
        <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Structured Workflow</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">How Complaints Are Processed</h3>
            <p className="text-sm text-slate-600">
              From submission to closure, every step follows strict response targets and independent review.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm mb-5">
                01
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Submit & Auto-Route</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log your grievance with category, exact ward, landmark, and optional photo evidence. The system generates
                a unique Tracking ID and automatically routes it to an eligible department engineer based on active workload.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm mb-5">
                02
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Investigation & Field Work</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                The assigned officer acknowledges the case within response target hours, posts citizen-visible progress updates,
                and executes remediation. Officers submit completion evidence before review.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-xs relative">
              <div className="w-10 h-10 rounded-lg bg-slate-900 text-white font-bold flex items-center justify-center text-sm mb-5">
                03
              </div>
              <h4 className="text-base font-semibold text-slate-900 mb-2">Administrator Review & 7-Day Window</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                An administrator reviews the officer's resolution report and photographs. Upon approval, citizens receive a
                7-day window to inspect the site and submit a formal objection or satisfaction feedback rating.
              </p>
            </div>
          </div>
        </section>

        {/* Key Features Section */}
        <section id="features" className="py-20 px-6 bg-slate-100/60 border-y border-slate-200">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Core Architecture</h2>
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Built for Civic Accountability</h3>
              <p className="text-sm text-slate-600">
                Eliminating bureaucratic black holes through verified audit trails and measurable response targets.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <FileCheck2 className="w-6 h-6 text-slate-800 mb-3" />
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Guaranteed Tracking IDs</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every saved report receives a tamper-resistant tracking ID with full status history and timeline logs.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <Clock className="w-6 h-6 text-slate-800 mb-3" />
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Response Target Clocks</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Strict response standards based on priority. Critical hazards are monitored 24/7 with immediate escalations.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <ShieldCheck className="w-6 h-6 text-slate-800 mb-3" />
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Mandatory Report Review</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Officers cannot close their own complaints. Every resolution must be inspected and approved by an administrator.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <Lock className="w-6 h-6 text-slate-800 mb-3" />
                <h4 className="text-sm font-semibold text-slate-900 mb-1">Privacy & Role Security</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Citizen complaints are confidential. Officers only access assigned cases; duplicate warnings never leak identities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Public-Service Categories Overview */}
        <section id="categories" className="py-20 px-6 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Service Coverage</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Supported Grievance Categories</h3>
            <p className="text-sm text-slate-600">
              Complaints are dispatched to specialized municipal divisions across 10 official categories.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {CATEGORIES.map((cat, idx) => (
              <div key={cat.id} className="p-5 bg-white border border-slate-200 rounded-xl hover:border-slate-300 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-400">0{idx + 1}</span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                    {cat.defaultPriority} Priority
                  </span>
                </div>
                <h4 className="text-sm font-semibold text-slate-900 mb-1">{cat.name}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{cat.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust & Privacy Notice */}
        <section id="accountability" className="py-16 px-6 bg-slate-900 text-white">
          <div className="max-w-5xl mx-auto text-center space-y-4">
            <h3 className="text-2xl sm:text-3xl font-bold">Privacy & Citizen Protection by Design</h3>
            <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Your contact information is strictly used for official notification regarding your specific grievance.
              Complaints are never publicly indexed or accessible to third parties. Officers only see the information necessary to resolve your issue.
            </p>
            <div className="pt-2 flex items-center justify-center gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Verified Email Verification
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Encrypted File Storage
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Tamper-Evident Audit Logs
              </span>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16 space-y-2">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Common Questions</h2>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h3>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Can I track a complaint without logging in?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No. To protect citizen privacy and prevent unauthorized surveillance of civic disputes, complaints are
                private by default. You must sign in to view status updates and timeline records.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">What happens if an officer does not resolve my problem?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                When an officer submits a resolution report, an Administrator must first review and approve the supporting
                evidence. Once approved, you have 7 calendar days to inspect the site and file a formal objection. An objection
                immediately reopens the case.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">Is giving a low star rating the same as an objection?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                No. Star feedback (1-5 stars) is statistical feedback. A formal objection is a specific legal action that reopens
                the complaint for investigation. If the problem is not fixed, use the "Submit Formal Objection" button.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900 mb-2">What files can I upload as evidence?</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                You can upload JPG, PNG, and PDF files up to 10 MB each, with a maximum of 5 files per complaint.
              </p>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
