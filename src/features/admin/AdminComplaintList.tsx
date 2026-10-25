import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService, AdminComplaintFilterParams } from '../../services/adminService';
import { Complaint } from '../../types';
import { ROUTES } from '../../config/routes';
import { DEPARTMENTS, WARDS_ZONES } from '../../config/referenceData';
import { STATUS_DEFINITIONS, PRIORITY_DEFINITIONS } from '../../config/workflow';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { isComplaintOverdue } from '../../utils/formatting';
import { Search, ExternalLink, Download } from 'lucide-react';

export function AdminComplaintList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [wardZoneId, setWardZoneId] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComplaints = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: AdminComplaintFilterParams = {
        search: search.trim() || undefined,
        status: status || undefined,
        priority: priority || undefined,
        departmentId: departmentId || undefined,
        wardZoneId: wardZoneId || undefined,
        page: currentPage,
        size: pageSize,
      };
      const res = await adminService.getComplaints(params);
      setComplaints(res.items);
      setTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch complaints registry.');
    } finally {
      setIsLoading(false);
    }
  }, [search, status, priority, departmentId, wardZoneId, currentPage, pageSize]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setDepartmentId('');
    setWardZoneId('');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#29384D]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] font-display">
            System-Wide Complaint Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Global view across all departments, officers, zones, and resolution cycles.
          </p>
        </div>

        {/* Export buttons per Section 10: disabled with "Export not yet connected" */}
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" disabled title="Backend export endpoint pending connection">
            <Download className="w-3.5 h-3.5 mr-1" />
            PDF Export (Pending)
          </Button>
          <Button variant="outline" size="sm" disabled title="Backend export endpoint pending connection">
            <Download className="w-3.5 h-3.5 mr-1" />
            XLSX Export (Pending)
          </Button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-3.5 bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-2xs transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-2.5">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search by ID or grievance title..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#121E33] text-slate-900 dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[36px]"
              />
            </div>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#121E33] text-slate-700 dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[36px]"
            >
              <option value="">All Statuses</option>
              {Object.entries(STATUS_DEFINITIONS).map(([code, meta]) => (
                <option key={code} value={code}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#121E33] text-slate-700 dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[36px]"
            >
              <option value="">All Priorities</option>
              {Object.entries(PRIORITY_DEFINITIONS).map(([code, meta]) => (
                <option key={code} value={code}>
                  {meta.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={departmentId}
              onChange={(e) => {
                setDepartmentId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#121E33] text-slate-700 dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[36px]"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={wardZoneId}
              onChange={(e) => {
                setWardZoneId(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full text-xs px-3 py-2 border border-slate-300 dark:border-[#29384D] bg-white dark:bg-[#121E33] text-slate-700 dark:text-[#F1F5F9] rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[36px]"
            >
              <option value="">All Wards & Zones</option>
              {WARDS_ZONES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" size="sm" variant="outline" onClick={handleResetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Complaints Table (Contained, Fixed Layout, Balanced Columns) */}
      <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-2xs overflow-hidden transition-colors">
        {error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={fetchComplaints} />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 dark:bg-[#121E33] border-b border-slate-200 dark:border-[#29384D] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="w-28 py-2.5 px-3">Tracking ID</th>
                  <th className="w-auto min-w-[200px] py-2.5 px-3">Title & Category</th>
                  <th className="w-28 py-2.5 px-3">Ward / Zone</th>
                  <th className="w-28 py-2.5 px-3">Department</th>
                  <th className="w-24 py-2.5 px-3">Priority</th>
                  <th className="w-36 py-2.5 px-3">Status</th>
                  <th className="w-28 py-2.5 px-3">Officer</th>
                  <th className="w-24 py-2.5 px-3">SLA Status</th>
                  <th className="w-20 py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#29384D]">
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={9} />)
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-10 px-4">
                      <EmptyState
                        title="No complaints matched your filter criteria"
                        description="Try broadening your search keywords or resetting department and status filters."
                        actionLabel="Clear all filters"
                        onAction={handleResetFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  complaints.map((item) => {
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
                            to={ROUTES.ADMIN_COMPLAINT_DETAIL(item.id)}
                            className="font-semibold text-slate-900 dark:text-slate-100 hover:text-teal-600 dark:hover:text-teal-400 hover:underline block truncate"
                            title={item.title}
                          >
                            {item.title}
                          </Link>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={item.categoryName}>
                            {item.categoryName}
                          </p>
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate" title={item.wardZoneName}>
                          {item.wardZoneName}
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate" title={item.departmentName || 'Pending'}>
                          {item.departmentName || 'Unassigned'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <PriorityBadge priority={item.priority} size="sm" />
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <StatusBadge status={item.status} size="sm" />
                        </td>
                        <td className="py-3 px-3 text-slate-600 dark:text-slate-300 truncate" title={item.assignedOfficerName || 'None'}>
                          {item.assignedOfficerName || '—'}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          <OverdueBadge isOverdue={overdue} />
                          {!overdue && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">On Track</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <Link
                            to={ROUTES.ADMIN_COMPLAINT_DETAIL(item.id)}
                            className="inline-flex items-center gap-1 font-semibold text-teal-600 dark:text-teal-400 hover:underline text-xs"
                            title={`Inspect complaint ${item.id}`}
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

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>
    </div>
  );
}
