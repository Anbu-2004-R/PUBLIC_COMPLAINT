import React, { useEffect, useState, useCallback } from 'react';
import { adminService } from '../../services/adminService';
import { AuditLogItem } from '../../types';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDate } from '../../utils/formatting';
import { ScrollText, Search, ShieldCheck, Lock } from 'lucide-react';

export function AdminAuditLog() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [entityFilter, setEntityFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await adminService.getAuditLogs({ entityType: entityFilter || undefined });
      setLogs(list);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve audit logs.');
    } finally {
      setIsLoading(false);
    }
  }, [entityFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter((l) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      l.action.toLowerCase().includes(s) ||
      l.actorName.toLowerCase().includes(s) ||
      l.entityId.toLowerCase().includes(s) ||
      (l.reason && l.reason.toLowerCase().includes(s))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              <Lock className="w-3 h-3" />
              READ-ONLY LOG
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">System Audit Trail</h1>
          <p className="text-xs text-slate-500 mt-1">
            Tamper-evident record of complaint creation, status transitions, reassignments, reviews, and setting changes (SRS FR-25).
          </p>
        </div>
      </div>

      <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 leading-relaxed">
        <strong>Administrative Accountability (SRS Section 3.3 & FR-25):</strong> Important actions must be recorded with
        actor, timestamp, justification reason, and before-and-after values. Ordinary users and officers cannot modify
        or delete audit history. Administrators can review records but cannot silently rewrite them.
      </div>

      {/* Filter and Search */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by actor, action name, complaint ID, or reason..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[38px]"
          />
        </div>

        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="text-xs px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 min-h-[38px] bg-white text-slate-700 sm:w-48"
        >
          <option value="">All Entities</option>
          <option value="Complaint">Complaint</option>
          <option value="ResolutionReport">Resolution Report</option>
          <option value="User">User</option>
          <option value="Feedback">Feedback</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-2xs overflow-hidden">
        {error ? (
          <div className="p-8">
            <ErrorState message={error} onRetry={fetchLogs} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Action Event</th>
                  <th className="py-3 px-4">Entity</th>
                  <th className="py-3 px-4">Reason / Justification</th>
                  <th className="py-3 px-4">State Delta (Before → After)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-xs text-slate-400">
                      No audit records found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap tabular-nums">
                        {formatDate(log.timestamp)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-900 block">{log.actorName}</span>
                        <span className="text-[10px] text-slate-400">{log.actorRole}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="font-mono text-[11px] font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                        <span className="font-medium">{log.entityType}</span>
                        <span className="font-mono text-[11px] text-slate-500 block">{log.entityId}</span>
                      </td>
                      <td className="py-3.5 px-4 max-w-xs text-slate-600">
                        {log.reason || <span className="text-slate-400 italic">None provided</span>}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm text-[11px] font-mono">
                        {log.beforeValue && (
                          <p className="text-rose-700 line-through truncate">{log.beforeValue}</p>
                        )}
                        {log.afterValue && (
                          <p className="text-emerald-700 font-semibold truncate">{log.afterValue}</p>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
