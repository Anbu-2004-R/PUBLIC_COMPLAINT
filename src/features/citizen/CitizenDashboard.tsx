import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { complaintsService } from '../../services/complaintsService';
import { notificationService } from '../../services/notificationService';
import { Complaint, NotificationItem } from '../../types';
import { ROUTES } from '../../config/routes';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatRelativeTime } from '../../utils/formatting';
import {
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
  ExternalLink,
  Bell,
} from 'lucide-react';

export function CitizenDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [res, notifs] = await Promise.all([
        complaintsService.getMyComplaints({ size: 5 }),
        notificationService.getNotifications(),
      ]);
      setComplaints(res.items);
      setNotifications(notifs.slice(0, 3));
    } catch (err: any) {
      setError(err.message || 'Unable to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
          <Skeleton className="h-9 w-44" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 w-full rounded-xl" />
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadData} />;
  }

  // Calculate metrics
  const totalSubmitted = complaints.length;
  const inProgress = complaints.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ACKNOWLEDGED' || c.status === 'ASSIGNED'
  ).length;
  const actionRequired = complaints.filter((c) => c.status === 'AWAITING_CITIZEN_INFO').length;
  const awaitingFeedback = complaints.filter((c) => c.status === 'RESOLVED_AWAITING_FEEDBACK').length;

  return (
    <div className="space-y-5">
      {/* Welcome & Primary CTA on single row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#29384D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
            Welcome, {user?.fullName}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Citizen Grievance Workspace · Track status updates, engineer field logs, and site resolution reviews.
          </p>
        </div>
        <Link to={ROUTES.CITIZEN_NEW_COMPLAINT} className="shrink-0">
          <Button size="md" className="w-full sm:w-auto shadow-sm">
            <PlusCircle className="w-4 h-4 mr-1.5 text-teal-400" />
            File Grievance
          </Button>
        </Link>
      </div>

      {/* Metrics Row: Compact & Balanced */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Total Grievances</span>
            <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-[#1E2E4A] flex items-center justify-center text-slate-600 dark:text-slate-300">
              <FileText className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-[#0B1220] dark:text-[#F1F5F9] tabular-nums font-display">
            {totalSubmitted}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Registered in CivicPulse</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              In Progress
            </span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-indigo-950 dark:text-indigo-200 tabular-nums font-display">
            {inProgress}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Active field remediation</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Action Required
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-950 dark:text-amber-200 tabular-nums font-display">
            {actionRequired}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Clarification requested</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-teal-600 dark:text-teal-400 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              7-Day Verification
            </span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/50 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-teal-950 dark:text-teal-200 tabular-nums font-display">
            {awaitingFeedback}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Objection window open</span>
        </div>
      </div>

      {/* Action Required Banner (if any) */}
      {actionRequired > 0 && (
        <div className="p-3.5 bg-amber-50/90 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-amber-900 dark:text-amber-200">
              <strong className="font-semibold">Action Requested:</strong> Department officers have requested
              additional details or photos on {actionRequired} case.
            </p>
          </div>
          <Link to={ROUTES.CITIZEN_COMPLAINTS} className="shrink-0">
            <Button size="sm" variant="outline" className="text-xs py-1 h-7 bg-white dark:bg-[#152238]">
              View Cases
            </Button>
          </Link>
        </div>
      )}

      {/* Recently Updated Complaints Table (Fixed Layout, Zero Outer Overflow) */}
      <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-2xs overflow-hidden transition-colors">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[#29384D] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">Recently Updated Complaints</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Live tracking of field inspections, officer updates, and closure reviews
            </p>
          </div>
          <Link
            to={ROUTES.CITIZEN_COMPLAINTS}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1"
          >
            <span>View all ({totalSubmitted})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No complaints submitted yet"
              description="Report an infrastructure fault, water problem, or sanitation issue in your ward."
              actionLabel="Submit your first complaint"
              onAction={() => window.location.assign(ROUTES.CITIZEN_NEW_COMPLAINT)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 dark:bg-[#121E33] border-b border-slate-200 dark:border-[#29384D] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="w-28 py-2.5 px-3">Tracking ID</th>
                  <th className="w-auto min-w-[200px] py-2.5 px-3">Title & Category</th>
                  <th className="w-32 py-2.5 px-3">Ward / Zone</th>
                  <th className="w-24 py-2.5 px-3">Priority</th>
                  <th className="w-36 py-2.5 px-3">Status</th>
                  <th className="w-28 py-2.5 px-3">Latest Update</th>
                  <th className="w-20 py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#29384D]">
                {complaints.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-[#1A2C47] transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                      {item.id}
                    </td>
                    <td className="py-3 px-3 min-w-0">
                      <p
                        className="font-semibold text-slate-900 dark:text-slate-100 truncate"
                        title={item.title}
                      >
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={item.categoryName}>
                        {item.categoryName}
                      </p>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate" title={item.wardZoneName}>
                      {item.wardZoneName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <PriorityBadge priority={item.priority} size="sm" />
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                      {formatRelativeTime(item.updatedAt)}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <Link
                        to={ROUTES.CITIZEN_COMPLAINT_DETAIL(item.id)}
                        className="inline-flex items-center gap-1 font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 text-xs cursor-pointer"
                        title={`Open grievance details for ${item.id}`}
                      >
                        <span>Open</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Notifications Strip */}
      {notifications.length > 0 && (
        <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl p-4 shadow-2xs transition-colors">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold text-slate-900 dark:text-[#F1F5F9] uppercase tracking-wider flex items-center gap-2">
              <Bell className="w-3.5 h-3.5 text-teal-500" />
              Recent Field Alerts & Updates
            </h2>
            <Link
              to={ROUTES.NOTIFICATIONS}
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 hover:underline"
            >
              All Notifications
            </Link>
          </div>
          <div className="space-y-2">
            {notifications.map((n) => (
              <div
                key={n.id}
                className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-[#121E33] border border-slate-100 dark:border-[#29384D] text-xs"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{n.title}</p>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5 line-clamp-1">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 shrink-0 whitespace-nowrap">
                  {formatRelativeTime(n.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
