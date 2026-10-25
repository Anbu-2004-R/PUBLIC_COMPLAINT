import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { complaintsService } from '../../services/complaintsService';
import { adminService } from '../../services/adminService';
import { Complaint, ResolutionReportItem } from '../../types';
import { ROUTES } from '../../config/routes';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatFileSize } from '../../utils/formatting';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  ShieldCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export function ResolutionReviewDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Decision Modal
  const [decisionModal, setDecisionModal] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [decisionReason, setDecisionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await complaintsService.getComplaintById(id);
      setComplaint(res);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve resolution report.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDecisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !decisionModal) return;
    setModalError(null);

    const latestReport = complaint.resolutionReports?.[complaint.resolutionReports.length - 1];
    if (!latestReport) {
      setModalError('No resolution report found to review.');
      return;
    }

    if (decisionModal === 'REJECT' && !decisionReason.trim()) {
      setModalError('A mandatory justification reason must be entered when rejecting a resolution report (SRS FR-15).');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await adminService.reviewResolutionReport(
        complaint.id,
        latestReport.id,
        decisionModal === 'APPROVE' ? 'APPROVED' : 'REJECTED',
        decisionReason
      );

      setComplaint(updated);
      showToast({
        type: decisionModal === 'APPROVE' ? 'success' : 'info',
        title: decisionModal === 'APPROVE' ? 'Report Approved' : 'Report Rejected',
        message:
          decisionModal === 'APPROVE'
            ? 'Case moved to Resolved — Awaiting Citizen Feedback with 7-day objection countdown.'
            : 'Case returned to In Progress for further officer remediation.',
      });

      setDecisionModal(null);
      setDecisionReason('');
      navigate(ROUTES.ADMIN_REVIEWS);
    } catch (err: any) {
      setModalError(err.message || 'Failed to submit decision.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !complaint) {
    return <ErrorState message={error || 'Complaint not found.'} onRetry={loadData} />;
  }

  const reports = complaint.resolutionReports || [];
  const activeReport = reports[reports.length - 1];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <Link
        to={ROUTES.ADMIN_REVIEWS}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Review Queue
      </Link>

      {/* Case Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
            {complaint.id}
          </span>
          <StatusBadge status={complaint.status} />
          <PriorityBadge priority={complaint.priority} />
        </div>
        <h1 className="text-xl font-bold text-slate-900">{complaint.title}</h1>
        <p className="text-xs text-slate-500">
          Grievance filed by {complaint.citizenName} in {complaint.wardZoneName} ({complaint.departmentName})
        </p>
      </div>

      {/* Submitted Resolution Report (Under Inspection) */}
      {!activeReport ? (
        <div className="p-8 bg-white border border-slate-200 rounded-xl text-center text-xs text-slate-500">
          No report submitted for this complaint.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Officer Resolution Report</h2>
              <p className="text-xs text-slate-500">
                Submitted by {activeReport.officerName} on {formatDate(activeReport.submittedAt)}
              </p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-purple-50 text-purple-800 border border-purple-200">
              Pending Admin Review
            </span>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <p className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">Actions Taken</p>
              <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {activeReport.actionsTaken}
              </p>
            </div>

            <div>
              <p className="font-semibold uppercase tracking-wider text-slate-400 text-[10px]">Outcome Description</p>
              <p className="text-slate-800 mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {activeReport.outcomeDescription}
              </p>
            </div>

            <div className="flex items-center gap-4 text-slate-600">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Completion Date: <strong>{activeReport.completionDate}</strong>
              </span>
            </div>

            {/* Mandatory Evidence Attachments (Photos / Certificates) */}
            <div>
              <p className="font-semibold uppercase tracking-wider text-slate-400 text-[10px] mb-2">
                Attached Evidence Records ({activeReport.evidenceAttachments?.length || 0} files)
              </p>
              {activeReport.evidenceAttachments && activeReport.evidenceAttachments.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeReport.evidenceAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{att.filename}</p>
                          <p className="text-[10px] text-slate-400">{formatFileSize(att.fileSize)}</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-600 shrink-0">Attached</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-rose-600 font-semibold italic">
                  Warning: No evidence attachment found. Reports must not be approved without evidence (SRS FR-14).
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons: Approve vs Reject */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to={ROUTES.ADMIN_COMPLAINT_DETAIL(complaint.id)}>
              <Button variant="ghost" size="sm">
                View Full Grievance History
              </Button>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button
                variant="danger"
                size="md"
                onClick={() => {
                  setDecisionModal('REJECT');
                  setDecisionReason('');
                  setModalError(null);
                }}
                className="flex-1 sm:flex-initial"
              >
                <XCircle className="w-4 h-4 mr-1.5" />
                Reject Report with Reason
              </Button>

              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setDecisionModal('APPROVE');
                  setDecisionReason('Inspection evidence and actions verified and approved under civic standards.');
                  setModalError(null);
                }}
                className="flex-1 sm:flex-initial"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Approve Resolution Report
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Decision Confirmation Modal */}
      <Dialog
        isOpen={decisionModal !== null}
        onClose={() => setDecisionModal(null)}
        title={decisionModal === 'APPROVE' ? 'Approve Resolution Report' : 'Reject Resolution Report'}
      >
        <form onSubmit={handleDecisionSubmit} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-medium">
              {modalError}
            </div>
          )}

          {decisionModal === 'APPROVE' ? (
            <div className="p-3.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-950 space-y-1.5 leading-relaxed">
              <p className="font-bold">Workflow Consequence (SRS FR-15, FR-16):</p>
              <p>
                Approving this report moves the complaint to{' '}
                <strong>Resolved — Awaiting Citizen Feedback</strong>. The citizen is notified and a{' '}
                <strong>7-day objection window</strong> commences immediately. If no objection is lodged within 7 days,
                the system will close the case automatically.
              </p>
            </div>
          ) : (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-lg text-rose-950 space-y-1.5 leading-relaxed">
              <p className="font-bold">Workflow Consequence (SRS v1.1 Revision Notes):</p>
              <p>
                Rejecting returns the complaint to <strong>In Progress</strong> for the officer to perform additional
                remediation. <em>The citizen is NOT notified of report rejection</em>.
              </p>
            </div>
          )}

          <Textarea
            label={decisionModal === 'APPROVE' ? 'Approval Notes (Optional)' : 'Rejection Reason (Mandatory)'}
            required={decisionModal === 'REJECT'}
            rows={4}
            placeholder={
              decisionModal === 'APPROVE'
                ? 'Record confirmation of site verification...'
                : 'Explain what remediations are missing or why the evidence is inadequate...'
            }
            value={decisionReason}
            onChange={(e) => setDecisionReason(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setDecisionModal(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              variant={decisionModal === 'APPROVE' ? 'primary' : 'danger'}
              size="sm"
              type="submit"
              isLoading={isSubmitting}
            >
              {decisionModal === 'APPROVE' ? 'Confirm Approval' : 'Confirm Rejection'}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
