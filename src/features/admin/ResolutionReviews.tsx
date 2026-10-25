import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Complaint } from '../../types';
import { ROUTES } from '../../config/routes';
import { PriorityBadge } from '../../components/ui/Badge';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatRelativeTime } from '../../utils/formatting';
import { ExternalLink } from 'lucide-react';

export function ResolutionReviews() {
  const [reviews, setReviews] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await adminService.getResolutionReviews();
      setReviews(res);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve resolution review queue.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#29384D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
            Resolution Report Review Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Mandatory administrative inspection of corrective actions, photos, and evidence before citizen notification.
          </p>
        </div>
      </div>

      <div className="p-3.5 bg-purple-50/80 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 rounded-xl text-xs text-purple-900 dark:text-purple-200 leading-relaxed transition-colors">
        <strong>SRS FR-15 Principle:</strong> Department officers cannot approve their own reports. An approved report moves the
        complaint to <em>Resolved — Awaiting Citizen Feedback</em> and triggers the 7-day citizen objection window.
      </div>

      <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-2xs overflow-hidden transition-colors">
        {error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={fetchReviews} />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 dark:bg-[#121E33] border-b border-slate-200 dark:border-[#29384D] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="w-28 py-2.5 px-3">Tracking ID</th>
                  <th className="w-auto min-w-[200px] py-2.5 px-3">Title & Grievance</th>
                  <th className="w-32 py-2.5 px-3">Submitting Officer</th>
                  <th className="w-32 py-2.5 px-3">Department / Ward</th>
                  <th className="w-24 py-2.5 px-3">Priority</th>
                  <th className="w-28 py-2.5 px-3">Report Submitted</th>
                  <th className="w-24 py-2.5 px-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#29384D]">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={7} />)
                ) : reviews.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 px-4">
                      <EmptyState
                        title="No resolution reports awaiting review"
                        description="All submitted reports have been inspected and decided."
                      />
                    </td>
                  </tr>
                ) : (
                  reviews.map((c) => {
                    const latestReport = c.resolutionReports?.[c.resolutionReports.length - 1];

                    return (
                      <tr
                        key={c.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-[#1A2C47] transition-colors"
                      >
                        <td className="py-3 px-3 font-mono font-semibold text-slate-900 dark:text-slate-100 tabular-nums whitespace-nowrap">
                          {c.id}
                        </td>
                        <td className="py-3 px-3 min-w-0">
                          <Link
                            to={ROUTES.ADMIN_REVIEW_DETAIL(c.id)}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 hover:underline block truncate"
                            title={c.title}
                          >
                            {c.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={c.categoryName}>
                            {c.categoryName}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-slate-700 dark:text-slate-300 truncate" title={latestReport?.officerName || c.assignedOfficerName || 'Officer'}>
                          <p className="font-medium truncate">{latestReport?.officerName || c.assignedOfficerName || 'Officer'}</p>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate" title={`${c.departmentName} · ${c.wardZoneName}`}>
                          <p className="truncate">{c.departmentName}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{c.wardZoneName}</p>
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <PriorityBadge priority={c.priority} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                          {latestReport ? formatRelativeTime(latestReport.submittedAt) : 'Pending'}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Link
                            to={ROUTES.ADMIN_REVIEW_DETAIL(c.id)}
                            className="inline-flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400 hover:underline text-xs"
                            title={`Inspect resolution report for ${c.id}`}
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
