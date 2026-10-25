import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { Complaint, User } from '../../types';
import { ROUTES } from '../../config/routes';
import { PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Pagination } from '../../components/ui/Pagination';
import { useToast } from '../../components/ui/Toast';
import { formatRelativeTime } from '../../utils/formatting';
import { ShieldAlert, UserCheck, ArrowLeft, Clock } from 'lucide-react';

export function UnassignedQueue() {
  const { showToast } = useToast();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Assign Officer Modal
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [assignmentReason, setAssignmentReason] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [queueRes, officerList] = await Promise.all([
        adminService.getUnassignedQueue({ page: currentPage, size: 10 }),
        adminService.getOfficers(),
      ]);
      setComplaints(queueRes.items);
      setTotalItems(queueRes.totalItems);
      setTotalPages(queueRes.totalPages);
      setOfficers(officerList);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve unassigned queue.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenAssignModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setSelectedOfficerId('');
    setAssignmentReason(`Manual assignment from Administrator Unassigned Queue for ${complaint.departmentName || 'department'}.`);
    setAssignError(null);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint || !selectedOfficerId) return;

    if (!assignmentReason.trim()) {
      setAssignError('A justification reason is required for manual assignment.');
      return;
    }

    setIsAssigning(true);
    try {
      await adminService.assignOfficer(selectedComplaint.id, selectedOfficerId, assignmentReason);
      showToast({
        type: 'success',
        title: 'Officer Assigned',
        message: `Case ${selectedComplaint.id} assigned. Original response deadlines preserved.`,
      });
      setSelectedComplaint(null);
      fetchData();
    } catch (err: any) {
      setAssignError(err.message || 'Failed to assign officer.');
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-[#29384D]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to={ROUTES.ADMIN_DASHBOARD}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Admin Overview</span>
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-[#F1F5F9] font-display flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-amber-500" />
            Unassigned Complaint Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Grievances where automated routing found no active officer or department was unspecified.
          </p>
        </div>
      </div>

      {/* Main Table View */}
      <div className="bg-white dark:bg-[#152238] border border-slate-200 dark:border-[#29384D] rounded-xl shadow-2xs overflow-hidden transition-colors">
        {error ? (
          <div className="p-6">
            <ErrorState message={error} onRetry={fetchData} />
          </div>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left text-xs table-fixed">
              <thead className="bg-slate-50 dark:bg-[#121E33] border-b border-slate-200 dark:border-[#29384D] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold text-[11px]">
                <tr>
                  <th className="w-28 py-2.5 px-3">Tracking ID</th>
                  <th className="w-auto min-w-[200px] py-2.5 px-3">Title & Description</th>
                  <th className="w-32 py-2.5 px-3">Category & Ward</th>
                  <th className="w-24 py-2.5 px-3">Priority</th>
                  <th className="w-28 py-2.5 px-3">Time in Queue</th>
                  <th className="w-32 py-2.5 px-3 text-right">Assign Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#29384D]">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                ) : complaints.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 px-4">
                      <EmptyState
                        title="Unassigned queue is clear"
                        description="All complaints have been successfully routed to eligible department engineers."
                      />
                    </td>
                  </tr>
                ) : (
                  complaints.map((item) => (
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
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={item.description}>
                          {item.description}
                        </p>
                      </td>
                      <td className="py-3 px-3 text-slate-700 dark:text-slate-300 min-w-0">
                        <p className="font-medium truncate" title={item.categoryName}>{item.categoryName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate" title={item.wardZoneName}>{item.wardZoneName}</p>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <PriorityBadge priority={item.priority} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-slate-500 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        {formatRelativeTime(item.submittedAt)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <Button size="sm" variant="primary" onClick={() => handleOpenAssignModal(item)}>
                          <UserCheck className="w-3.5 h-3.5 mr-1" />
                          Assign
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={10}
          onPageChange={(p) => setCurrentPage(p)}
        />
      </div>

      {/* Assign Officer Dialog */}
      <Dialog
        isOpen={selectedComplaint !== null}
        onClose={() => setSelectedComplaint(null)}
        title={`Assign Officer to Case ${selectedComplaint?.id}`}
        description="Select an available officer and record the administrative justification reason."
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          {assignError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-lg text-rose-800 dark:text-rose-300">
              {assignError}
            </div>
          )}

          <div className="p-3 bg-slate-50 dark:bg-[#121E33] border border-slate-200 dark:border-[#29384D] rounded-lg space-y-1">
            <p className="font-semibold text-slate-900 dark:text-[#F1F5F9]">{selectedComplaint?.title}</p>
            <p className="text-slate-500 dark:text-slate-400">
              {selectedComplaint?.categoryName} · {selectedComplaint?.wardZoneName}
            </p>
          </div>

          <Select
            label="Designate Field Officer"
            required
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
          >
            <option value="">Select Department Officer...</option>
            {officers.map((off) => (
              <option key={off.id} value={off.id}>
                {off.fullName} ({off.departmentName || 'Dept'} - Emp: {off.employeeId})
              </option>
            ))}
          </Select>

          <Textarea
            label="Administrative Justification"
            required
            rows={3}
            value={assignmentReason}
            onChange={(e) => setAssignmentReason(e.target.value)}
            placeholder="Record mandatory rationale for manual assignment..."
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setSelectedComplaint(null)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" isLoading={isAssigning} disabled={!selectedOfficerId}>
              Confirm Assignment
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
