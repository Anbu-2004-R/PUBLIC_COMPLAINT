import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { ROUTES } from '../../config/routes';
import { NotificationDropdown } from './NotificationDropdown';
import { DemoBanner } from './DemoBanner';
import { ThemeToggle } from '../ui/ThemeToggle';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Clock,
  ClipboardCheck,
  Users,
  ShieldCheck,
  Building2,
  MapPin,
  GitFork,
  BarChart3,
  ScrollText,
  Settings,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';

import { CivicPulseLogo } from '../ui/CivicPulseLogo';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  if (!user) return null;

  // Role-specific navigation definitions
  const citizenNav: NavItem[] = [
    { label: 'Citizen Dashboard', path: ROUTES.CITIZEN_DASHBOARD, icon: LayoutDashboard },
    { label: 'My Complaints', path: ROUTES.CITIZEN_COMPLAINTS, icon: FileText },
    { label: 'Submit Complaint', path: ROUTES.CITIZEN_NEW_COMPLAINT, icon: PlusCircle },
    { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell },
    { label: 'My Profile', path: ROUTES.PROFILE, icon: UserIcon },
  ];

  const officerNav: NavItem[] = [
    { label: 'Officer Dashboard', path: ROUTES.OFFICER_DASHBOARD, icon: LayoutDashboard },
    { label: 'Assigned Complaints', path: ROUTES.OFFICER_COMPLAINTS, icon: FileText },
    { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell },
    { label: 'My Profile', path: ROUTES.PROFILE, icon: UserIcon },
  ];

  const adminNav: NavItem[] = [
    { label: 'Admin Overview', path: ROUTES.ADMIN_DASHBOARD, icon: LayoutDashboard },
    { label: 'All Complaints', path: ROUTES.ADMIN_COMPLAINTS, icon: FileText },
    { label: 'Unassigned Queue', path: ROUTES.ADMIN_UNASSIGNED, icon: Clock },
    { label: 'Resolution Reviews', path: ROUTES.ADMIN_REVIEWS, icon: ClipboardCheck },
    { label: 'Citizen Accounts', path: ROUTES.ADMIN_USERS, icon: Users },
    { label: 'Department Officers', path: ROUTES.ADMIN_OFFICERS, icon: ShieldCheck },
    { label: 'Departments', path: ROUTES.ADMIN_DEPARTMENTS, icon: Building2 },
    { label: 'Wards & Zones', path: ROUTES.ADMIN_ZONES, icon: MapPin },
    { label: 'Routing Mappings', path: ROUTES.ADMIN_MAPPINGS, icon: GitFork },
    { label: 'System Analytics', path: ROUTES.ADMIN_ANALYTICS, icon: BarChart3 },
    { label: 'Audit Trail', path: ROUTES.ADMIN_AUDIT, icon: ScrollText },
    { label: 'Settings', path: ROUTES.ADMIN_SETTINGS, icon: Settings },
    { label: 'Notifications', path: ROUTES.NOTIFICATIONS, icon: Bell },
    { label: 'My Profile', path: ROUTES.PROFILE, icon: UserIcon },
  ];

  const navItems = user.role === 'CITIZEN' ? citizenNav : user.role === 'OFFICER' ? officerNav : adminNav;

  const handleLogout = async () => {
    await logout();
    navigate(ROUTES.LOGIN);
  };

  const roleBadge = {
    CITIZEN: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-700/60',
    OFFICER: 'bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/60',
    ADMIN: 'bg-purple-50 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-700/60',
  }[user.role];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B1220] flex flex-col font-sans transition-colors">
      <DemoBanner />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar (256px) */}
        <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-[#121E33] border-r border-slate-200 dark:border-[#29384D] shrink-0 transition-colors">
          <div className="p-4 border-b border-slate-100 dark:border-[#29384D] flex items-center justify-between">
            <CivicPulseLogo size="sm" linkToHome={true} />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${roleBadge}`}>
              {user.role}
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.path === location.pathname ||
                (item.path !== ROUTES.CITIZEN_DASHBOARD &&
                  item.path !== ROUTES.OFFICER_DASHBOARD &&
                  item.path !== ROUTES.ADMIN_DASHBOARD &&
                  location.pathname.startsWith(item.path));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#0B1220] text-white shadow-xs dark:bg-teal-500/15 dark:text-teal-300 dark:border dark:border-teal-500/30'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-[#1A2C47]'
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-teal-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-[#29384D] bg-slate-50/50 dark:bg-[#0E1726]/60">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-[#0B1220] dark:bg-teal-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {user.fullName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:text-rose-300 dark:hover:bg-rose-950/30 rounded-lg transition-colors border border-slate-200 dark:border-[#29384D] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Mobile Drawer Backdrop and Aside */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileDrawerOpen(false)}
              aria-hidden="true"
            />
            <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-[#121E33] shadow-xl flex flex-col z-50 animate-in slide-in-from-left">
              <div className="p-4 border-b border-slate-100 dark:border-[#29384D] flex items-center justify-between">
                <CivicPulseLogo size="sm" linkToHome={true} />
                <button
                  type="button"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileDrawerOpen(false)}
                      className={`flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#0B1220] text-white dark:bg-teal-500/20 dark:text-teal-300'
                          : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1A2C47]'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
              <div className="p-4 border-t border-slate-100 dark:border-[#29384D] bg-slate-50 dark:bg-[#0E1726]/60">
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">{user.fullName}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mb-3">{user.email}</p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Bar with Contextual Breadcrumbs and Theme Toggle */}
          <header className="sticky top-0 z-30 bg-white dark:bg-[#121E33] border-b border-slate-200 dark:border-[#29384D] px-4 sm:px-8 py-3 flex items-center justify-between gap-4 transition-colors">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(true)}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A2C47] min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
                aria-label="Open navigation drawer"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                <Link to={ROUTES.HOME} className="hover:text-slate-800 dark:hover:text-slate-200 font-medium">
                  CivicPulse
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                  {user.role.toLowerCase()} Workspace
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Theme Toggle Button */}
              <ThemeToggle size="md" />

              <NotificationDropdown />

              <Link
                to={ROUTES.PROFILE}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1A2C47] transition-colors"
                title="View user profile"
              >
                <div className="w-7 h-7 rounded-full bg-[#0B1220] dark:bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                  {user.fullName.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 leading-tight">{user.fullName}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-none">{user.role}</p>
                </div>
              </Link>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-7xl w-full mx-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}
