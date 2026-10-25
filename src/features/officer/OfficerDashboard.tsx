import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../app/AuthContext';
import { officerService } from '../../services/officerService';
import { Complaint } from '../../types';
import { ROUTES } from '../../config/routes';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, isComplaintOverdue } from '../../utils/formatting';
import {
  Briefcase,
  Clock,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';

export function OfficerDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await officerService.getAssignedComplaints({ size: 10 });
      setComplaints(res.items);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve assigned complaints.');
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
            <Skeleton className="h-7 w-60" />
            <Skeleton className="h-4 w-72" />
          </div>
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
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

  // Calculate officer workload metrics
  const totalAssigned = complaints.length;
  const pendingAck = complaints.filter((c) => c.status === 'ASSIGNED').length;
  const inProgress = complaints.filter(
    (c) => c.status === 'IN_PROGRESS' || c.status === 'ACKNOWLEDGED' || c.status === 'REOPENED'
  ).length;
  const awaitingReview = complaints.filter((c) => c.status === 'RESOLUTION_REPORT_SUBMITTED').length;
  const overdueCount = complaints.filter((c) => isComplaintOverdue(c.actionDeadline, c.status)).length;

  return (
    <div className="space-y-5">
      {/* Officer Header: Single Row with Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#29384D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
            Officer Investigation Console
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {user?.fullName} · {user?.departmentName || 'Department Engineer'} · Emp ID: {user?.employeeId || 'N/A'}
          </p>
        </div>
        <Link to={ROUTES.OFFICER_COMPLAINTS} className="shrink-0">
          <Button size="md" variant="outline" className="w-full sm:w-auto shadow-xs">
            View All Cases ({totalAssigned})
          </Button>
        </Link>
      </div>

      {/* Metrics Bar: Compact & Grid Balanced */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="p-3.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>Total Assigned</span>
            <Briefcase className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-[#F1F5F9] tabular-nums font-display">
            {totalAssigned}
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Active caseload</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#152238] border border-amber-200 dark:border-amber-800/60 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>Pending Ack</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-900 dark:text-amber-300 tabular-nums font-display">
            {pendingAck}
          </p>
          <span className="text-[10px] text-amber-700 dark:text-amber-400">Immediate action needed</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#152238] border border-indigo-200 dark:border-indigo-800/60 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>In Progress</span>
            <CheckCircle className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-900 dark:text-indigo-300 tabular-nums font-display">
            {inProgress}
          </p>
          <span className="text-[10px] text-indigo-700 dark:text-indigo-400">Under remediation</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#152238] border border-purple-200 dark:border-purple-800/60 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-purple-700 dark:text-purple-400 mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>Awaiting Review</span>
            <ClipboardCheck className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-purple-900 dark:text-purple-300 tabular-nums font-display">
            {awaitingReview}
          </p>
          <span className="text-[10px] text-purple-700 dark:text-purple-400">Admin review pending</span>
        </div>

        <div className="p-3.5 bg-white dark:bg-[#152238] border border-rose-200 dark:border-rose-800/60 rounded-xl shadow-xs transition-colors">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-1 text-[11px] font-semibold uppercase tracking-wider">
            <span>Overdue Target</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-900 dark:text-rose-300 tabular-nums font-display">
            {overdueCount}
          </p>
          <span className="text-[10px] text-rose-700 dark:text-rose-400">Deadline elapsed</span>
        </div>
      </div>

      {/* Active Investigations Table: Contained & Fixed Width */}
      <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-2xs overflow-hidden transition-colors">
        <div className="px-4 py-3 border-b border-slate-100 dark:border-[#29384D] flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-[#F1F5F9]">Priority Assigned Cases</h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Acknowledge assignments, post field updates, and submit resolution reports
            </p>
          </div>
          <Link
            to={ROUTES.OFFICER_COMPLAINTS}
            className="text-xs font-semibold text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 flex items-center gap-1"
          >
            <span>Manage queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {complaints.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No complaints currently assigned"
              description="New grievances in your eligible wards and department will appear here automatically."
            />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 dark:bg-[#121E33] border-b border-slate-200 dark:border-[#29384D] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="w-28 py-2.5 px-3">Tracking ID</th>
                  <th className="w-auto min-w-[220px] py-2.5 px-3">Title & Location</th>
                  <th className="w-24 py-2.5 px-3">Priority</th>
                  <th className="w-36 py-2.5 px-3">Status</th>
                  <th className="w-36 py-2.5 px-3">Target Deadlines</th>
                  <th className="w-24 py-2.5 px-3 text-right">Investigation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#29384D]">
                {complaints.map((item) => {
                  const overdue = isComplaintOverdue(item.actionDeadline, item.status);

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-[#1A2C47] transition-colors"
                    >
                      <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                        {item.id}
                      </td>
                      <td className="py-3 px-3 min-w-0">
                        <Link
                          to={ROUTES.OFFICER_COMPLAINT_DETAIL(item.id)}
                          className="font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 hover:underline block truncate"
                          title={item.title}
                        >
                          {item.title}
                        </Link>
                        <p
                          className="text-[11px] text-slate-500 dark:text-slate-400 truncate"
                          title={`${item.wardZoneName} · ${item.exactLocation}`}
                        >
                          {item.wardZoneName} · {item.exactLocation}
                        </p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={item.priority} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <OverdueBadge isOverdue={overdue} />
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                            Ack: {item.acknowledgedAt ? 'Done' : formatDate(item.ackDeadline)}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Link
                          to={ROUTES.OFFICER_COMPLAINT_DETAIL(item.id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-white bg-[#0B1220] hover:bg-[#123047] dark:bg-teal-500 dark:text-[#0B1220] dark:hover:bg-teal-400 rounded-md transition-colors"
                          title={`Open case ${item.id}`}
                        >
                          <span>Open</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
