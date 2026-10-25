import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { complaintsService } from '../../services/complaintsService';
import { Complaint } from '../../types';
import { ROUTES } from '../../config/routes';
import { StatusBadge, PriorityBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { formatDate, formatRelativeTime, formatFileSize, getDeadlineCountdown } from '../../utils/formatting';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building2,
  Clock,
  ShieldCheck,
  AlertCircle,
  FileText,
  Star,
  CheckCircle2,
  MessageSquare,
  HelpCircle,
  XCircle,
  RotateCcw,
  Edit3,
} from 'lucide-react';

export function CitizenComplaintDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal action states
  const [activeModal, setActiveModal] = useState<
    'REPLY_INFO' | 'OBJECTION' | 'FEEDBACK' | 'REOPEN' | 'WITHDRAWAL' | 'CORRECTION' | null
  >(null);
  const [actionReason, setActionReason] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const loadComplaint = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await complaintsService.getComplaintById(id);
      setComplaint(res);
    } catch (err: any) {
      setError(err.message || 'Unable to retrieve complaint record.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadComplaint();
  }, [loadComplaint]);

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setModalError(null);
    setIsSubmittingAction(true);

    try {
      if (activeModal === 'REPLY_INFO') {
        const updated = await complaintsService.replyToInfoRequest(complaint.id, actionReason);
        setComplaint(updated);
        showToast({ type: 'success', title: 'Information Sent', message: 'Your reply has been dispatched to the investigating officer.' });
      } else if (activeModal === 'OBJECTION') {
        const updated = await complaintsService.submitObjection(complaint.id, actionReason);
        setComplaint(updated);
        showToast({ type: 'success', title: 'Objection Logged', message: 'Complaint status has returned to Reopened.' });
      } else if (activeModal === 'FEEDBACK') {
        const updated = await complaintsService.submitFeedback(complaint.id, feedbackRating, actionReason);
        setComplaint(updated);
        showToast({ type: 'success', title: 'Feedback Recorded', message: 'Thank you for rating municipal resolution quality.' });
      } else if (activeModal === 'REOPEN') {
        const updated = await complaintsService.requestReopening(complaint.id, actionReason);
        setComplaint(updated);
        showToast({ type: 'success', title: 'Reopening Requested', message: 'Sent for Administrator review.' });
      } else if (activeModal === 'WITHDRAWAL') {
        const updated = await complaintsService.requestWithdrawal(complaint.id, actionReason);
        setComplaint(updated);
        showToast({ type: 'success', title: 'Withdrawal Requested', message: 'Withdrawal review initiated.' });
      } else if (activeModal === 'CORRECTION') {
        showToast({ type: 'info', title: 'Correction Logged', message: 'Clarification notes attached to complaint history.' });
      }

      setActiveModal(null);
      setActionReason('');
    } catch (err: any) {
      setModalError(err.message || 'Failed to process action. Please try again.');
    } finally {
      setIsSubmittingAction(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-6 w-36" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !complaint) {
    return <ErrorState message={error || 'Complaint not found.'} onRetry={loadComplaint} />;
  }

  // Filter progress updates: Citizen-visible ONLY (internal notes strictly omitted per Section 8 & 9)
  const citizenVisibleUpdates = complaint.progressUpdates?.filter((p) => p.visibility === 'CITIZEN_VISIBLE') || [];

  // Filter approved resolution report (only shown if status is RESOLVED_AWAITING_FEEDBACK or CLOSED)
  const approvedReport = complaint.resolutionReports?.find((r) => r.reviewStatus === 'APPROVED');

  // Check 7-day objection window countdown
  const isObjectionWindowActive =
    complaint.status === 'RESOLVED_AWAITING_FEEDBACK' &&
    complaint.objectionWindowEnd &&
    new Date(complaint.objectionWindowEnd).getTime() > Date.now();

  const deadline = getDeadlineCountdown(complaint.actionDeadline, complaint.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Back Link */}
      <Link
        to={ROUTES.CITIZEN_COMPLAINTS}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Complaint Registry
      </Link>

      {/* Main Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="font-mono font-bold text-sm bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                {complaint.id}
              </span>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1 className="text-xl font-bold text-slate-900 leading-snug">{complaint.title}</h1>
          </div>

          {/* Action Trigger Buttons for current status */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {complaint.status === 'AWAITING_CITIZEN_INFO' && (
              <Button size="sm" onClick={() => setActiveModal('REPLY_INFO')}>
                <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                Reply with Information
              </Button>
            )}

            {isObjectionWindowActive && (
              <>
                <Button size="sm" variant="danger" onClick={() => setActiveModal('OBJECTION')}>
                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                  Submit Formal Objection
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setActiveModal('FEEDBACK')}>
                  <Star className="w-3.5 h-3.5 mr-1.5" />
                  Rate Resolution
                </Button>
              </>
            )}

            {complaint.status === 'CLOSED' && (
              <>
                <Button size="sm" variant="outline" onClick={() => setActiveModal('REOPEN')}>
                  <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                  Request Reopening
                </Button>
                {!complaint.feedback && (
                  <Button size="sm" variant="secondary" onClick={() => setActiveModal('FEEDBACK')}>
                    <Star className="w-3.5 h-3.5 mr-1.5" />
                    Submit Feedback
                  </Button>
                )}
              </>
            )}

            {complaint.status !== 'CLOSED' &&
              complaint.status !== 'WITHDRAWN' &&
              complaint.status !== 'WITHDRAWAL_REQUEST_PENDING' && (
                <Button size="sm" variant="ghost" onClick={() => setActiveModal('WITHDRAWAL')}>
                  Request Withdrawal
                </Button>
              )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Category</span>
            <span className="text-slate-800 font-medium mt-0.5 block">{complaint.categoryName}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Location</span>
            <span className="text-slate-800 font-medium mt-0.5 block truncate" title={complaint.exactLocation}>
              {complaint.wardZoneName} · {complaint.exactLocation}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Department</span>
            <span className="text-slate-800 font-medium mt-0.5 block">{complaint.departmentName || 'Pending'}</span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Submitted</span>
            <span className="text-slate-800 font-medium mt-0.5 block tabular-nums">{formatDate(complaint.submittedAt)}</span>
          </div>
        </div>
      </div>

      {/* Active Objection Window Banner */}
      {isObjectionWindowActive && (
        <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-xs">
            <h2 className="font-bold text-teal-900 uppercase tracking-wide">
              7-Day Citizen Review & Objection Window Active
            </h2>
            <p className="text-teal-800 mt-1 leading-relaxed">
              The Administrator verified the officer's remediation work and approved the resolution report. You have until{' '}
              <strong className="underline">{formatDate(complaint.objectionWindowEnd)}</strong> to verify the site. If the
              problem persists, click <strong>"Submit Formal Objection"</strong> to reopen this complaint.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Description & Approved Resolution Report */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Detailed Description */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Grievance Description</h2>
            <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {complaint.description}
            </p>

            {/* Complainant Uploaded Attachments */}
            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">Initial Evidence Files:</p>
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

          {/* Approved Resolution Report (SRS FR-15, FR-16) */}
          {approvedReport && (
            <div className="bg-white border border-teal-200 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-teal-100">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-teal-600" />
                  <h2 className="text-sm font-bold text-slate-900">Official Approved Resolution Report</h2>
                </div>
                <span className="text-[11px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                  Approved by Admin
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Actions Executed</p>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{approvedReport.actionsTaken}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Final Outcome</p>
                  <p className="text-slate-800 mt-0.5 leading-relaxed">{approvedReport.outcomeDescription}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2 text-[11px]">
                  <div>
                    <span className="text-slate-400 block">Remediated By:</span>
                    <span className="font-semibold text-slate-800">{approvedReport.officerName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Completion Date:</span>
                    <span className="font-semibold text-slate-800">{approvedReport.completionDate}</span>
                  </div>
                </div>

                {/* Evidence Attachments */}
                {approvedReport.evidenceAttachments && approvedReport.evidenceAttachments.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold text-slate-500 mb-2">Approved Evidence & Inspection Records:</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {approvedReport.evidenceAttachments.map((att) => (
                        <div key={att.id} className="p-2 border border-slate-200 rounded bg-slate-50 flex items-center gap-2 text-xs">
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
            </div>
          )}

          {/* Citizen Feedback Display (if given) */}
          {complaint.feedback && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Your Feedback Rating</h2>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < complaint.feedback!.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                    }`}
                  />
                ))}
                <span className="text-xs font-bold text-slate-800 ml-2">{complaint.feedback.rating} / 5 Stars</span>
              </div>
              {complaint.feedback.comment && (
                <p className="text-xs text-slate-600 italic bg-slate-50 p-2.5 rounded border border-slate-100">
                  "{complaint.feedback.comment}"
                </p>
              )}
            </div>
          )}

          {/* Citizen-Visible Progress Updates */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Officer Progress Updates</h2>
            {citizenVisibleUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No field progress updates posted yet.</p>
            ) : (
              <div className="space-y-3">
                {citizenVisibleUpdates.map((item) => (
                  <div key={item.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-400 text-[11px]">
                      <span className="font-semibold text-slate-700">{item.officerName} (Investigating Officer)</span>
                      <span>{formatDate(item.timestamp)}</span>
                    </div>
                    <p className="text-slate-800 leading-relaxed">{item.note}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Timeline & Official Assignment */}
        <div className="space-y-6">
          {/* Assigned Engineer Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Responsible Engineer</h2>
            {complaint.assignedOfficerName ? (
              <div className="space-y-2 text-xs">
                <p className="font-bold text-slate-900 text-sm">{complaint.assignedOfficerName}</p>
                <p className="text-slate-500">{complaint.departmentName}</p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span>Assigned: {formatDate(complaint.assignedAt)}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded border border-amber-200">
                Pending assignment in Administrator queue.
              </p>
            )}
          </div>

          {/* Status Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Status History Timeline</h2>
            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {complaint.history?.map((hist, idx) => (
                <div key={hist.id} className="relative flex items-start gap-3 pl-1 text-xs">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px] z-10 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-900">{hist.newStatus}</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{formatRelativeTime(hist.changedAt)}</span>
                    </div>
                    {hist.reason && <p className="text-slate-600 text-[11px] mt-1 leading-snug">{hist.reason}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">By: {hist.changedByName} ({hist.changedByRole})</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Action Modals */}
      <Dialog
        isOpen={activeModal !== null}
        onClose={() => setActiveModal(null)}
        title={
          activeModal === 'REPLY_INFO'
            ? 'Reply to Officer Information Request'
            : activeModal === 'OBJECTION'
            ? 'Submit Formal Objection'
            : activeModal === 'FEEDBACK'
            ? 'Citizen Satisfaction Feedback'
            : activeModal === 'REOPEN'
            ? 'Request Complaint Reopening'
            : activeModal === 'WITHDRAWAL'
            ? 'Request Complaint Withdrawal'
            : 'Request Information Correction'
        }
      >
        <form onSubmit={handleActionSubmit} className="space-y-4 text-xs">
          {modalError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800">
              {modalError}
            </div>
          )}

          {activeModal === 'OBJECTION' && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
              <strong>Notice:</strong> Submitting a formal objection indicates that the reported infrastructure problem has
              not been resolved as claimed in the resolution report. This action reopens the case for renewed municipal investigation.
            </div>
          )}

          {activeModal === 'FEEDBACK' ? (
            <div className="space-y-3">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Overall Service Rating (1 to 5 Stars)
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackRating(star)}
                      className="p-1 cursor-pointer"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= feedbackRating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-slate-900 ml-2">{feedbackRating} Stars</span>
                </div>
              </div>

              <Textarea
                label="Optional Feedback Comments"
                placeholder="Share your thoughts on speed, responsiveness, and repair quality..."
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
              />
            </div>
          ) : (
            <Textarea
              label={
                activeModal === 'REPLY_INFO'
                  ? 'Your Detailed Response'
                  : activeModal === 'OBJECTION'
                  ? 'Reason for Formal Objection'
                  : activeModal === 'REOPEN'
                  ? 'Justification for Late Reopening'
                  : activeModal === 'WITHDRAWAL'
                  ? 'Reason for Withdrawal'
                  : 'Correction Description'
              }
              required
              rows={4}
              placeholder={
                activeModal === 'REPLY_INFO'
                  ? 'Provide the requested landmark, door number, or clarification...'
                  : activeModal === 'OBJECTION'
                  ? 'Explain why the resolution is inadequate or incomplete...'
                  : 'State the justification clearly for administrative review...'
              }
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
            />
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmittingAction}>
              Cancel
            </Button>
            <Button
              variant={activeModal === 'OBJECTION' ? 'danger' : 'primary'}
              size="sm"
              type="submit"
              isLoading={isSubmittingAction}
            >
              Submit Action
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
