import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { ROUTES } from '../../config/routes';
import { CivicPulseLogo } from '../../components/ui/CivicPulseLogo';
import { DemoBanner } from '../../components/layout/DemoBanner';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { ENV } from '../../config/env';
import { DEMO_USERS } from '../../mocks/mockData';
import { UserRole } from '../../types';
import {
  Users,
  HardHat,
  ShieldCheck,
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileCheck2,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Check,
  FileText,
  Building2,
  Activity,
} from 'lucide-react';

export function LoginPage() {
  const { user, login, loginAsDemoUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get('redirect');
  const queryEmail = searchParams.get('email');

  // Role selection state (Citizen, Officer, Admin)
  const [selectedRole, setSelectedRole] = useState<UserRole>('CITIZEN');
  const [email, setEmail] = useState(() => queryEmail || 'citizen@civicpulse.org');
  const [password, setPassword] = useState(() => (queryEmail ? '' : 'DemoPass123!'));
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // If email param changes or was passed via redirect
  useEffect(() => {
    if (queryEmail) {
      setEmail(queryEmail);
      setPassword('');
      setSelectedRole('CITIZEN');
    }
  }, [queryEmail]);

  // If already authenticated, redirect immediately to their respective workspace
  useEffect(() => {
    if (user) {
      if (redirectPath) {
        navigate(redirectPath, { replace: true });
      } else if (user.role === 'CITIZEN') {
        navigate(ROUTES.CITIZEN_DASHBOARD, { replace: true });
      } else if (user.role === 'OFFICER') {
        navigate(ROUTES.OFFICER_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      }
    }
  }, [user, redirectPath, navigate]);

  // When selected role changes, update default placeholder credentials for smooth testing
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMessage(null);
    if (role === 'CITIZEN') {
      setEmail('citizen@civicpulse.org');
      setPassword('DemoPass123!');
    } else if (role === 'OFFICER') {
      setEmail('officer.pwd@civicpulse.org');
      setPassword('DemoPass123!');
    } else {
      setEmail('admin@civicpulse.org');
      setPassword('DemoPass123!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const loggedUser = await login(email, password, selectedRole);
      if (redirectPath) {
        navigate(redirectPath);
      } else if (loggedUser.role === 'CITIZEN') {
        navigate(ROUTES.CITIZEN_DASHBOARD);
      } else if (loggedUser.role === 'OFFICER') {
        navigate(ROUTES.OFFICER_DASHBOARD);
      } else {
        navigate(ROUTES.ADMIN_DASHBOARD);
      }
    } catch (err: any) {
      setErrorMessage(
        err.message || 'Invalid email or password. Please verify your credentials or reset your password.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoQuickFill = (demoUser: (typeof DEMO_USERS)[0]) => {
    setSelectedRole(demoUser.role);
    setEmail(demoUser.email);
    setPassword('DemoPass123!');
    loginAsDemoUser(demoUser);
    if (redirectPath) {
      navigate(redirectPath);
    } else if (demoUser.role === 'CITIZEN') {
      navigate(ROUTES.CITIZEN_DASHBOARD);
    } else if (demoUser.role === 'OFFICER') {
      navigate(ROUTES.OFFICER_DASHBOARD);
    } else {
      navigate(ROUTES.ADMIN_DASHBOARD);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#0B1220] font-sans transition-colors">
      <DemoBanner />

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-42px)]">
        {/* Left Hero & Brand Column (Desktop: 7 cols) */}
        <section
          aria-label="CivicPulse Platform Overview"
          className="lg:col-span-7 bg-[#0B1220] text-white p-6 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden"
        >
          {/* Subtle Ambient Decorative Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#14B8A6]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#123047]/40 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand & Tagline Header */}
          <div className="relative z-10 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CivicPulseLogo size="lg" variant="light" showTagline={false} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#152238] border border-[#29384D] text-slate-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                <span>Municipal Grievance Portal</span>
              </div>
            </div>

            <div className="max-w-xl space-y-2.5 pt-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-display leading-[1.15]">
                Your City. <br className="hidden sm:inline" />
                <span className="text-[#2DD4BF]">Your Voice.</span> Real Action.
              </h1>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                CivicPulse is the centralized municipal accountability platform. Every public complaint is
                assigned a tamper-resistant tracking ID, routed directly to eligible department engineers, and
                audited before closure.
              </p>
            </div>
          </div>

          {/* Application Overview: Transparent Governance */}
          <div className="relative z-10 my-6 max-w-xl w-full">
            <div className="bg-[#152238]/90 backdrop-blur-md rounded-2xl border border-[#29384D] p-5 sm:p-6 shadow-xl space-y-4">
              {/* Card Header: Heading & Subtitle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-[#29384D] gap-2">
                <div>
                  <div className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#2DD4BF] animate-pulse" />
                    <h3 className="text-base sm:text-lg font-bold text-white font-display tracking-tight">
                      Transparent Governance
                    </h3>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                    One platform. Every complaint. Accountable action.
                  </p>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-teal-500/15 text-[#2DD4BF] border border-teal-500/30 font-semibold text-xs shrink-0 self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#2DD4BF]" />
                  Citizen Accountability
                </span>
              </div>

              {/* 4 Feature Sections in a Balanced 2x2 Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* 1. Easy Grievance Reporting */}
                <div className="bg-[#0B1220]/75 rounded-xl border border-[#29384D] p-3.5 flex items-start gap-3 transition-colors hover:border-teal-500/40">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/30 text-[#2DD4BF] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      Easy Grievance Reporting
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Citizens can submit public complaints with location details and supporting evidence.
                    </p>
                  </div>
                </div>

                {/* 2. Smart Department Assignment */}
                <div className="bg-[#0B1220]/75 rounded-xl border border-[#29384D] p-3.5 flex items-start gap-3 transition-colors hover:border-teal-500/40">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      Smart Department Assignment
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Complaints are routed to the appropriate department and eligible officer.
                    </p>
                  </div>
                </div>

                {/* 3. Complaint Tracking */}
                <div className="bg-[#0B1220]/75 rounded-xl border border-[#29384D] p-3.5 flex items-start gap-3 transition-colors hover:border-teal-500/40">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      Complaint Tracking
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Users can follow complaint status, progress updates, and decisions.
                    </p>
                  </div>
                </div>

                {/* 4. Transparent Resolution */}
                <div className="bg-[#0B1220]/75 rounded-xl border border-[#29384D] p-3.5 flex items-start gap-3 transition-colors hover:border-teal-500/40">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-white leading-snug">
                      Transparent Resolution
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed mt-1">
                      Officers submit resolution reports, and administrators review them before the citizen feedback or objection stage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3 Core Trust Pillars */}
          <div className="relative z-10 pt-4 border-t border-[#29384D] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <FileCheck2 className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                <span>Audited Case Tracking</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Tamper-evident logs record every status update and field action.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Clock className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                <span>Enforced Response Targets</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Strict response standards with automated departmental escalations.
              </p>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <ShieldCheck className="w-4 h-4 text-[#2DD4BF] shrink-0" />
                <span>Citizen Verification</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Independent administrative review plus 7-day citizen objection window.
              </p>
            </div>
          </div>
        </section>

        {/* Right Authentication & Role Selection Column (Desktop: 5 cols) */}
        <section
          aria-label="Account Login and Role Selection"
          className="lg:col-span-5 bg-[#F8FAFC] dark:bg-[#0B1220] p-6 sm:p-10 lg:p-12 flex flex-col justify-center items-center relative transition-colors"
        >
          {/* Top Right Controls (Theme Toggle) */}
          <div className="absolute top-4 right-4 z-20">
            <ThemeToggle size="sm" />
          </div>

          <div className="w-full max-w-md space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                Access Portal
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F1F5F9] font-display">
                Sign In to CivicPulse
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Select your designated role to enter the appropriate workspace.
              </p>
            </div>

            {/* Role Selection Cards (3 Roles) */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Select Access Role <span className="text-rose-600 dark:text-rose-400">*</span>
              </label>

              <div className="grid grid-cols-3 gap-2">
                {/* 1. Citizen Role Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('CITIZEN')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedRole === 'CITIZEN'
                      ? 'bg-white dark:bg-[#152238] border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white/80 dark:bg-[#152238]/60 border-slate-200 dark:border-[#29384D] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {selectedRole === 'CITIZEN' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-500 text-[#0B1220] flex items-center justify-center font-bold">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9]">Citizen</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Report grievances
                    </p>
                  </div>
                </button>

                {/* 2. Department Officer Role Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('OFFICER')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedRole === 'OFFICER'
                      ? 'bg-white dark:bg-[#152238] border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white/80 dark:bg-[#152238]/60 border-slate-200 dark:border-[#29384D] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {selectedRole === 'OFFICER' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-500 text-[#0B1220] flex items-center justify-center font-bold">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center mb-1.5">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9]">Officer</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Field investigation
                    </p>
                  </div>
                </button>

                {/* 3. Administrator Role Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('ADMIN')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    selectedRole === 'ADMIN'
                      ? 'bg-white dark:bg-[#152238] border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                      : 'bg-white/80 dark:bg-[#152238]/60 border-slate-200 dark:border-[#29384D] hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {selectedRole === 'ADMIN' && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-teal-500 text-[#0B1220] flex items-center justify-center font-bold">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                  <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center mb-1.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9]">Admin</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      Triage & audits
                    </p>
                  </div>
                </button>
              </div>
            </div>

            {/* Error Feedback */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2 text-xs text-rose-800 dark:text-rose-300 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Authentication Form Card */}
            <div className="bg-white dark:bg-[#152238] rounded-2xl border border-slate-200 dark:border-[#29384D] shadow-xs p-5 sm:p-6 space-y-3.5 transition-colors">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-[#29384D] text-xs">
                <span className="text-slate-500 dark:text-slate-400">
                  Workspace:{' '}
                  <strong className="text-slate-900 dark:text-slate-100 font-semibold">
                    {selectedRole === 'CITIZEN'
                      ? 'Citizen Grievance Desk'
                      : selectedRole === 'OFFICER'
                      ? 'Officer Field Console'
                      : 'Municipal Oversight Console'}
                  </strong>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E2E4A] text-slate-700 dark:text-slate-300">
                  {selectedRole}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Email Field */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Official Email <span className="text-rose-600 dark:text-rose-400">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        selectedRole === 'CITIZEN'
                          ? 'citizen@civicpulse.org'
                          : selectedRole === 'OFFICER'
                          ? 'officer.pwd@civicpulse.org'
                          : 'admin@civicpulse.org'
                      }
                      className="w-full rounded-xl border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#121E33] pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[38px]"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Password <span className="text-rose-600 dark:text-rose-400">*</span>
                    </label>
                    <Link
                      to={ROUTES.FORGOT_PASSWORD}
                      className="text-xs text-teal-600 hover:text-teal-700 dark:text-teal-400 font-medium hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#121E33] pl-10 pr-10 py-2 text-sm text-slate-900 dark:text-[#F1F5F9] transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[38px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded border-slate-300 dark:border-[#29384D] text-teal-600 focus:ring-teal-500 w-4 h-4"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                {/* Submit Action */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-1.5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B1220] text-white hover:bg-[#123047] active:bg-[#070D18] dark:bg-teal-500 dark:text-[#0B1220] dark:hover:bg-teal-400 font-semibold text-sm transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : (
                    <>
                      <span>
                        Sign In as{' '}
                        {selectedRole === 'CITIZEN'
                          ? 'Citizen'
                          : selectedRole === 'OFFICER'
                          ? 'Department Officer'
                          : 'Administrator'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Citizen Registration Link */}
              <div className="pt-3 border-t border-slate-100 dark:border-[#29384D] text-center text-xs text-slate-500 dark:text-slate-400">
                New citizen complainant?{' '}
                <Link
                  to={ROUTES.REGISTER}
                  className="font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 hover:underline"
                >
                  Create citizen account
                </Link>
              </div>
            </div>

            {/* Quick Demo Logins Section in Demo Mode */}
            {ENV.IS_DEMO && (
              <div className="bg-white/70 dark:bg-[#152238]/60 rounded-2xl border border-slate-200/80 dark:border-[#29384D] p-3.5 space-y-2 transition-colors">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-teal-500" />
                    Instant Demo Login Shortcuts
                  </p>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">1-click switch</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleDemoQuickFill(DEMO_USERS[0])}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-[#29384D] bg-white dark:bg-[#121E33] hover:border-teal-500 hover:bg-teal-50/20 text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-[10px] uppercase font-bold text-teal-600 dark:text-teal-400">Citizen</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9] group-hover:text-teal-500 truncate">
                      Priya Sharma
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">citizen@civicpulse.org</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoQuickFill(DEMO_USERS[2])}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-[#29384D] bg-white dark:bg-[#121E33] hover:border-teal-500 hover:bg-teal-50/20 text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-[10px] uppercase font-bold text-indigo-700 dark:text-indigo-400">PWD Officer</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9] group-hover:text-teal-500 truncate">
                      Er. Rajesh Kumar
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Roads Division</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDemoQuickFill(DEMO_USERS[5])}
                    className="p-2.5 rounded-xl border border-slate-200 dark:border-[#29384D] bg-white dark:bg-[#121E33] hover:border-teal-500 hover:bg-teal-50/20 text-left transition-colors cursor-pointer group"
                  >
                    <p className="text-[10px] uppercase font-bold text-purple-700 dark:text-purple-400">Admin</p>
                    <p className="text-xs font-semibold text-slate-900 dark:text-[#F1F5F9] group-hover:text-teal-500 truncate">
                      Kavitha R.
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">Municipal Oversight</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
