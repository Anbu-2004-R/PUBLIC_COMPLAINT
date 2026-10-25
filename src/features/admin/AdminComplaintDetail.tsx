import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { complaintsService } from '../../services/complaintsService';
import { Complaint, User, ComplaintPriority } from '../../types';
import { ROUTES } from '../../config/routes';
import { CATEGORIES } from '../../config/referenceData';
import { PRIORITY_DEFINITIONS, PriorityMeta } from '../../config/workflow';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { ConfirmationDialog } from '../../components/ui/ConfirmationDialog';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatRelativeTime, formatFileSize, isComplaintOverdue } from '../../utils/formatting';
import {
  ArrowLeft,
  UserCheck,
  Edit2,
  AlertTriangle,
  ClipboardCheck,
  CheckCircle,
  FileText,
  Eye,
  EyeOff,
  Clock,
  RotateCcw,
  Check,
} from 'lucide-react';

export function AdminComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [officers, setOfficers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<'REASSIGN' | 'CORRECTION' | 'ESCALATE' | 'WITHDRAWAL_DECISION' | null>(null);
  const [selectedOfficerId, setSelectedOfficerId] = useState('');
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newPriority, setNewPriority] = useState<ComplaintPriority>('HIGH');
  const [actionReason, setActionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [res, offList] = await Promise.all([
        complaintsService.getComplaintById(id),
        adminService.getOfficers(),
      ]);
      setComplaint(res);
      setOfficers(offList);
      setNewCategoryId(res.categoryId);
      setNewPriority(res.priority);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve complaint record.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle Reassign
  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !selectedOfficerId) return;
    if (!actionReason.trim()) {
      setModalError('A justification reason is required for reassignment.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await adminService.assignOfficer(complaint.id, selectedOfficerId, actionReason);
      setComplaint(updated);
      showToast({ type: 'success', title: 'Officer Reassigned', message: 'Original response deadlines preserved.' });
      setActiveModal(null);
      setActionReason('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to reassign officer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Routing Correction
  const handleCorrection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    if (!actionReason.trim()) {
      setModalError('A justification reason is required when correcting routing or priority.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await adminService.correctRouting(complaint.id, {
        newCategoryId: newCategoryId !== complaint.categoryId ? newCategoryId : undefined,
        newPriority: newPriority !== complaint.priority ? newPriority : undefined,
        reason: actionReason,
      });
      setComplaint(updated);
      showToast({ type: 'success', title: 'Correction Recorded', message: 'Routing and priority updated.' });
      setActiveModal(null);
      setActionReason('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to apply correction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Escalation
  const handleEscalate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    if (!actionReason.trim()) {
      setModalError('A reason is required to escalate a complaint.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await adminService.escalateComplaint(complaint.id, actionReason);
      setComplaint(updated);
      showToast({ type: 'success', title: 'Complaint Escalated', message: 'Status changed to Escalated with Critical priority.' });
      setActiveModal(null);
      setActionReason('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to escalate complaint.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !complaint) {
    return <ErrorState message={error || 'Complaint record not found.'} onRetry={loadData} />;
  }

  const isOverdue = isComplaintOverdue(complaint.actionDeadline, complaint.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Link
        to={ROUTES.ADMIN_COMPLAINTS}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to System Registry
      </Link>

      {/* Main Administrative Action Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
              <OverdueBadge isOverdue={isOverdue} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{complaint.title}</h1>
          </div>

          {/* Administrative Control Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {complaint.status === 'RESOLUTION_REPORT_SUBMITTED' && (
              <Link to={ROUTES.ADMIN_REVIEW_DETAIL(complaint.id)}>
                <Button size="sm" variant="primary">
                  <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                  Review Resolution Report
                </Button>
              </Link>
            )}

            <Button size="sm" variant="outline" onClick={() => setActiveModal('REASSIGN')}>
              <UserCheck className="w-3.5 h-3.5 mr-1.5" />
              Reassign Officer
            </Button>

            <Button size="sm" variant="outline" onClick={() => setActiveModal('CORRECTION')}>
              <Edit2 className="w-3.5 h-3.5 mr-1.5" />
              Correct Routing
            </Button>

            {complaint.status !== 'ESCALATED' && complaint.status !== 'CLOSED' && (
              <Button size="sm" variant="danger" onClick={() => setActiveModal('ESCALATE')}>
                <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                Escalate Case
              </Button>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Complainant</span>
            <span className="text-slate-800 font-medium mt-0.5 block truncate">
              {complaint.citizenName} ({complaint.citizenEmail})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Assigned Staff</span>
            <span className="text-slate-800 font-medium mt-0.5 block">
              {complaint.assignedOfficerName || 'Unassigned'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Department / Ward</span>
            <span className="text-slate-800 font-medium mt-0.5 block truncate">
              {complaint.departmentName} · {complaint.wardZoneName}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Action Target</span>
            <span className="text-slate-800 font-medium mt-0.5 block tabular-nums">{formatDate(complaint.actionDeadline)}</span>
          </div>
        </div>
      </div>

      {/* Grid: Complaint Details & Full Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Narrative & Citizen Evidence */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Grievance Narrative</h2>
            <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {complaint.description}
            </p>

            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">Complainant Attachments:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {complaint.attachments.map((att) => (
                    <div key={att.id} className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs">
                      <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-800 truncate">{att.filename}</p>
                        <p className="text-[10px] text-slate-400">{formatFileSize(att.fileSize)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Complete Progress Journal (Both Citizen-Visible and Internal Notes visible to Admin) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Complete Investigation Journal</h2>
            {!complaint.progressUpdates || complaint.progressUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No notes recorded by assigned staff yet.</p>
            ) : (
              <div className="space-y-3">
                {complaint.progressUpdates.map((item) => {
                  const isInternal = item.visibility === 'INTERNAL_NOTE';

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        isInternal ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-800">{item.officerName}</span>
                        <div className="flex items-center gap-1.5">
                          {isInternal ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                              <EyeOff className="w-3 h-3" /> Internal Officer Note
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                              <Eye className="w-3 h-3" /> Citizen-Visible
                            </span>
                          )}
                          <span className="text-slate-400">{formatDate(item.timestamp)}</span>
                        </div>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{item.note}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Full Status History Timeline */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Complete Status Audit History</h2>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {complaint.history?.map((hist, idx) => (
                <div key={hist.id} className="relative flex items-start gap-3 pl-1 text-xs">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px] z-10 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <p className="font-bold text-slate-900">{hist.newStatus}</p>
                    {hist.reason && <p className="text-slate-700 text-[11px] mt-1 leading-snug">{hist.reason}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatDate(hist.changedAt)} · {hist.changedByName} ({hist.changedByRole})
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Reassign Officer */}
      <Dialog
        isOpen={activeModal === 'REASSIGN'}
        onClose={() => setActiveModal(null)}
        title="Reassign Responsible Officer"
        description="Select an available officer. Reassignment preserves existing response deadlines."
      >
        <form onSubmit={handleReassign} className="space-y-4 text-xs">
          {modalError && <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">{modalError}</div>}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
            <strong>SRS Section 10.8 Notice:</strong> Reassigning this complaint will preserve the original response target
            deadline ({formatDate(complaint.actionDeadline)}) to ensure prompt public accountability.
          </div>

          <Select
            label="Target Department Officer"
            required
            value={selectedOfficerId}
            onChange={(e) => setSelectedOfficerId(e.target.value)}
          >
            <option value="">Select Department Officer</option>
            {officers.map((off) => (
              <option key={off.id} value={off.id}>
                {off.fullName} — {off.departmentName || 'Engineer'} ({off.availabilityStatus})
              </option>
            ))}
          </Select>

          <Textarea
            label="Reassignment Justification (Mandatory)"
            required
            rows={3}
            placeholder="Explain why this case is being reassigned..."
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Confirm Reassignment
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Correct Routing & Priority */}
      <Dialog
        isOpen={activeModal === 'CORRECTION'}
        onClose={() => setActiveModal(null)}
        title="Correct Routing and Priority"
        description="Modify grievance category or urgency classification. A justification reason is mandatory."
      >
        <form onSubmit={handleCorrection} className="space-y-4 text-xs">
          {modalError && <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">{modalError}</div>}

          <Select
            label="Category"
            value={newCategoryId}
            onChange={(e) => setNewCategoryId(e.target.value)}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="Priority Classification"
            value={newPriority}
            onChange={(e) => setNewPriority(e.target.value as ComplaintPriority)}
          >
            {(Object.entries(PRIORITY_DEFINITIONS) as [string, PriorityMeta][]).map(([code, meta]) => (
              <option key={code} value={code}>
                {meta.label} — {meta.description}
              </option>
            ))}
          </Select>

          <Textarea
            label="Correction Reason (Mandatory)"
            required
            rows={3}
            placeholder="State the technical reason for this correction..."
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Apply Correction
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal: Escalate */}
      <Dialog
        isOpen={activeModal === 'ESCALATE'}
        onClose={() => setActiveModal(null)}
        title="Escalate Complaint"
        description="Escalating marks this case with Critical urgency and 24/7 supervisor tracking."
      >
        <form onSubmit={handleEscalate} className="space-y-4 text-xs">
          {modalError && <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">{modalError}</div>}

          <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-900 leading-relaxed">
            <strong>Consequence:</strong> Status will change to <strong>Escalated</strong> and priority will become{' '}
            <strong>Critical</strong>. Responsible department head and duty engineers will receive immediate alerts.
          </div>

          <Textarea
            label="Escalation Justification"
            required
            rows={3}
            placeholder="Document why supervisor intervention is required (e.g. repeated public hazard, missed deadlines)..."
            value={actionReason}
            onChange={(e) => setActionReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" type="submit" isLoading={isSubmitting}>
              Confirm Escalation
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
