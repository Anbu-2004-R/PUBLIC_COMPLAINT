import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { officerService } from '../../services/officerService';
import { complaintsService } from '../../services/complaintsService';
import { Complaint, EvidenceAttachment } from '../../types';
import { ROUTES } from '../../config/routes';
import { StatusBadge, PriorityBadge, OverdueBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Dialog } from '../../components/ui/Dialog';
import { Textarea } from '../../components/ui/Textarea';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/ErrorState';
import { useToast } from '../../components/ui/Toast';
import { validateFileList } from '../../utils/fileValidation';
import { formatDate, formatRelativeTime, formatFileSize, isComplaintOverdue } from '../../utils/formatting';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  ClipboardCheck,
  AlertTriangle,
  Upload,
  X,
  FileText,
  Eye,
  EyeOff,
  User,
  ShieldAlert,
} from 'lucide-react';

export function OfficerInvestigationDetail() {
  const { id } = useParams<{ id: string }>();
  const { showToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [activeModal, setActiveModal] = useState<'PROGRESS' | 'INFO_REQUEST' | 'RESOLUTION' | null>(null);

  // Progress Update Form State
  const [progressNote, setProgressNote] = useState('');
  const [progressVisibility, setProgressVisibility] = useState<'CITIZEN_VISIBLE' | 'INTERNAL_NOTE'>('INTERNAL_NOTE');

  // Citizen Info Request Form State
  const [infoRequestMsg, setInfoRequestMsg] = useState('');

  // Resolution Report Form State (SRS FR-14)
  const [actionsTaken, setActionsTaken] = useState('');
  const [outcomeDescription, setOutcomeDescription] = useState('');
  const [completionDate, setCompletionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [evidenceAttachments, setEvidenceAttachments] = useState<EvidenceAttachment[]>([]);
  const [resolutionUploadError, setResolutionUploadError] = useState<string | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

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

  // Acknowledge Action
  const handleAcknowledge = async () => {
    if (!complaint) return;
    setIsSubmitting(true);
    try {
      const updated = await officerService.acknowledgeComplaint(complaint.id);
      setComplaint(updated);
      showToast({
        type: 'success',
        title: 'Complaint Acknowledged',
        message: `Case ${complaint.id} acknowledged within response targets. Status updated to Acknowledged.`,
      });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Failed to Acknowledge', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Progress Update
  const handleProgressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !progressNote.trim()) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await officerService.addProgressUpdate(complaint.id, progressNote, progressVisibility);
      setComplaint(updated);
      showToast({ type: 'success', title: 'Progress Logged', message: 'Investigation notes updated successfully.' });
      setActiveModal(null);
      setProgressNote('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to record progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Request for Info
  const handleInfoRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !infoRequestMsg.trim()) return;
    setIsSubmitting(true);
    setActionError(null);
    try {
      const updated = await officerService.requestCitizenInfo(complaint.id, infoRequestMsg);
      setComplaint(updated);
      showToast({
        type: 'success',
        title: 'Information Request Sent',
        message: 'Citizen has been notified to provide required details.',
      });
      setActiveModal(null);
      setInfoRequestMsg('');
    } catch (err: any) {
      setActionError(err.message || 'Failed to send request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Resolution Evidence Uploads
  const handleEvidenceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResolutionUploadError(null);
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const validation = validateFileList(files, evidenceAttachments.length);
    if (!validation.valid) {
      setResolutionUploadError(validation.errors.join(' '));
      return;
    }

    const newFiles: EvidenceAttachment[] = files.map((file) => ({
      id: 'att-res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Officer',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '#',
    }));

    setEvidenceAttachments((prev) => [...prev, ...newFiles]);
    e.target.value = '';
  };

  // Submit Resolution Report per SRS FR-14
  const handleResolutionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setResolutionUploadError(null);

    if (evidenceAttachments.length === 0) {
      setResolutionUploadError('At least one evidence attachment is required before submitting a resolution report.');
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await officerService.submitResolutionReport({
        complaintId: complaint.id,
        actionsTaken,
        outcomeDescription,
        completionDate,
        evidenceAttachments,
      });
      setComplaint(updated);
      showToast({
        type: 'success',
        title: 'Resolution Report Submitted',
        message: 'Report and evidence forwarded to Administrator review queue.',
      });
      setActiveModal(null);
    } catch (err: any) {
      setResolutionUploadError(err.message || 'Failed to submit resolution report.');
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
    return <ErrorState message={error || 'Complaint record not found.'} onRetry={loadComplaint} />;
  }

  const isOverdue = isComplaintOverdue(complaint.actionDeadline, complaint.status);
  const latestRejectedReport = complaint.resolutionReports?.find((r) => r.reviewStatus === 'REJECTED');

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <Link
        to={ROUTES.OFFICER_COMPLAINTS}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Caseload
      </Link>

      {/* Main Inspection Header */}
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

          {/* Action Trigger Buttons for Officers */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {complaint.status === 'ASSIGNED' && (
              <Button size="sm" onClick={handleAcknowledge} isLoading={isSubmitting}>
                <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                Acknowledge Assignment
              </Button>
            )}

            {(complaint.status === 'ACKNOWLEDGED' ||
              complaint.status === 'IN_PROGRESS' ||
              complaint.status === 'REOPENED' ||
              complaint.status === 'RESOLUTION_REPORT_REJECTED') && (
              <>
                <Button size="sm" variant="secondary" onClick={() => setActiveModal('PROGRESS')}>
                  Record Progress Update
                </Button>
                <Button size="sm" variant="outline" onClick={() => setActiveModal('INFO_REQUEST')}>
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                  Request Citizen Info
                </Button>
                <Button size="sm" variant="primary" onClick={() => setActiveModal('RESOLUTION')}>
                  <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />
                  Submit Resolution Report
                </Button>
              </>
            )}

            {complaint.status === 'RESOLUTION_REPORT_SUBMITTED' && (
              <div className="text-xs text-purple-700 bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-200 font-medium">
                Resolution report submitted. Awaiting Administrator decision.
              </div>
            )}
          </div>
        </div>

        {/* Metadata Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Location</span>
            <span className="text-slate-800 font-medium mt-0.5 block truncate">
              {complaint.wardZoneName} · {complaint.exactLocation}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Complainant</span>
            <span className="text-slate-800 font-medium mt-0.5 block">
              {complaint.citizenName} ({complaint.citizenPhone})
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Ack Deadline</span>
            <span className="text-slate-800 font-medium mt-0.5 block tabular-nums">
              {complaint.acknowledgedAt ? 'Acknowledged' : formatDate(complaint.ackDeadline)}
            </span>
          </div>
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] block">Action Target</span>
            <span className="text-slate-800 font-medium mt-0.5 block tabular-nums">{formatDate(complaint.actionDeadline)}</span>
          </div>
        </div>
      </div>

      {/* Rejection Alert Banner if report was rejected by Admin (SRS v1.1 Revision Note) */}
      {latestRejectedReport && complaint.status === 'IN_PROGRESS' && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-900">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div>
            <h2 className="font-bold uppercase tracking-wider text-rose-800">
              Resolution Report Returned by Administrator
            </h2>
            <p className="mt-1 leading-relaxed">
              Reason: <strong>"{latestRejectedReport.adminDecision?.reason}"</strong>.
            </p>
            <p className="text-[11px] text-rose-700 mt-1">
              Complaint has been returned to In Progress status. Please complete the requested field remediation and submit a revised report.
            </p>
          </div>
        </div>
      )}

      {/* Grid: Complaint Details & Investigation Log */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Grievance Description & Citizen Attachments */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Grievance Narrative</h2>
            <p className="text-xs text-slate-800 whitespace-pre-line leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {complaint.description}
            </p>

            {complaint.attachments && complaint.attachments.length > 0 && (
              <div className="pt-2">
                <p className="text-[11px] font-semibold text-slate-500 mb-2">Complainant Evidence Files:</p>
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

          {/* Citizen Info Requests & Responses */}
          {complaint.infoRequests && complaint.infoRequests.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Information Requests</h2>
              <div className="space-y-3">
                {complaint.infoRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2">
                    <div>
                      <p className="text-slate-500 text-[11px]">Requested: {formatDate(req.requestedAt)}</p>
                      <p className="font-semibold text-slate-900 mt-0.5">"{req.message}"</p>
                    </div>
                    {req.response ? (
                      <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded text-emerald-950">
                        <span className="font-bold block text-[10px] uppercase tracking-wider text-emerald-800">
                          Citizen Response ({formatDate(req.respondedAt)}):
                        </span>
                        <p className="mt-0.5 leading-relaxed">{req.response}</p>
                      </div>
                    ) : (
                      <p className="text-amber-700 italic text-[11px]">Awaiting citizen reply...</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Investigation Updates (Both Citizen-Visible & Internal Notes) */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Investigation Progress Journal</h2>
            {!complaint.progressUpdates || complaint.progressUpdates.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No notes logged yet. Use "Record Progress Update" above.</p>
            ) : (
              <div className="space-y-3">
                {complaint.progressUpdates.map((item) => {
                  const isInternal = item.visibility === 'INTERNAL_NOTE';

                  return (
                    <div
                      key={item.id}
                      className={`p-3 rounded-lg border text-xs space-y-1 ${
                        isInternal ? 'bg-amber-50/50 border-amber-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">{item.officerName}</span>
                        <span className="flex items-center gap-1.5">
                          {isInternal ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                              <EyeOff className="w-3 h-3" /> Internal Note
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded">
                              <Eye className="w-3 h-3" /> Citizen-Visible
                            </span>
                          )}
                          <span className="text-slate-400">{formatDate(item.timestamp)}</span>
                        </span>
                      </div>
                      <p className="text-slate-800 leading-relaxed">{item.note}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Status Timeline & Officer Restrictions Notice */}
        <div className="space-y-6">
          {/* Officer Permissions & Constraints Notice */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-600">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-slate-500" />
              Role Boundary Rules (SRS Section 3.2):
            </p>
            <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed">
              <li>Officers cannot approve their own resolution reports.</li>
              <li>Officers cannot close or delete complaints.</li>
              <li>Every report must include at least 1 evidence attachment before review.</li>
            </ul>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Status History</h2>
            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {complaint.history?.map((hist, idx) => (
                <div key={hist.id} className="relative flex items-start gap-3 pl-1 text-xs">
                  <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px] z-10 font-bold">
                    {idx + 1}
                  </div>
                  <div className="flex-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <p className="font-bold text-slate-900">{hist.newStatus}</p>
                    {hist.reason && <p className="text-slate-600 text-[11px] mt-0.5">{hist.reason}</p>}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {formatRelativeTime(hist.changedAt)} · {hist.changedByName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal 1: Progress Update */}
      <Dialog isOpen={activeModal === 'PROGRESS'} onClose={() => setActiveModal(null)} title="Record Investigation Progress">
        <form onSubmit={handleProgressSubmit} className="space-y-4 text-xs">
          {actionError && <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">{actionError}</div>}

          <Textarea
            label="Investigation Progress Note"
            required
            rows={4}
            placeholder="Document site inspection findings, contractor work orders, asphalt mix batch numbers, or equipment deployed..."
            value={progressNote}
            onChange={(e) => setProgressNote(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block font-semibold uppercase tracking-wider text-slate-700">Note Visibility</label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`p-3 border rounded-lg flex items-start gap-2 cursor-pointer transition-colors ${
                  progressVisibility === 'INTERNAL_NOTE' ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={progressVisibility === 'INTERNAL_NOTE'}
                  onChange={() => setProgressVisibility('INTERNAL_NOTE')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold block text-slate-900">Internal Note</span>
                  <span className="text-[11px] text-slate-500">Only visible to department staff and administrator</span>
                </div>
              </label>

              <label
                className={`p-3 border rounded-lg flex items-start gap-2 cursor-pointer transition-colors ${
                  progressVisibility === 'CITIZEN_VISIBLE' ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-slate-200'
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  checked={progressVisibility === 'CITIZEN_VISIBLE'}
                  onChange={() => setProgressVisibility('CITIZEN_VISIBLE')}
                  className="mt-0.5"
                />
                <div>
                  <span className="font-bold block text-slate-900">Citizen-Visible</span>
                  <span className="text-[11px] text-slate-500">Posted to complainant timeline with in-app notification</span>
                </div>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Save Progress Note
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 2: Request Citizen Info */}
      <Dialog isOpen={activeModal === 'INFO_REQUEST'} onClose={() => setActiveModal(null)} title="Request Information from Citizen">
        <form onSubmit={handleInfoRequestSubmit} className="space-y-4 text-xs">
          {actionError && <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800">{actionError}</div>}

          <p className="text-slate-600 leading-relaxed">
            Specify clearly what details are required to continue field work (e.g. nearest meter box number, exact house gate, or additional photos).
          </p>

          <Textarea
            label="Required Information Message"
            required
            rows={4}
            placeholder="e.g. Please provide the property owner name or nearest electricity pole number so our crew can position equipment..."
            value={infoRequestMsg}
            onChange={(e) => setInfoRequestMsg(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Dispatch Request to Citizen
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Modal 3: Submit Resolution Report (SRS FR-14) */}
      <Dialog
        isOpen={activeModal === 'RESOLUTION'}
        onClose={() => setActiveModal(null)}
        title="Submit Resolution Report for Administrative Review"
        maxWidth="lg"
      >
        <form onSubmit={handleResolutionSubmit} className="space-y-4 text-xs">
          {resolutionUploadError && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded text-rose-800 font-medium">
              {resolutionUploadError}
            </div>
          )}

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 leading-relaxed">
            <strong>SRS FR-14 Requirement:</strong> You must state actions taken, outcome description, completion date, and
            attach at least one supporting evidence file (photo or inspection certificate) before submitting.
          </div>

          <Textarea
            label="Actions Executed"
            required
            rows={3}
            placeholder="e.g. Excavated leak point, replaced damaged 100mm CI pipe section with HDPE fitting, tested pressure at 3.0 bar..."
            value={actionsTaken}
            onChange={(e) => setActionsTaken(e.target.value)}
          />

          <Textarea
            label="Resolution Outcome Description"
            required
            rows={3}
            placeholder="e.g. Clean drinking water supply restored to all 16 residential units. Purity confirmed..."
            value={outcomeDescription}
            onChange={(e) => setOutcomeDescription(e.target.value)}
          />

          <Input
            label="Completion Date"
            type="date"
            required
            value={completionDate}
            onChange={(e) => setCompletionDate(e.target.value)}
          />

          {/* Mandatory Evidence Upload */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block font-semibold uppercase tracking-wider text-slate-700">
              Mandatory Resolution Evidence <span className="text-rose-600">*</span>
            </label>
            <p className="text-[11px] text-slate-500">
              Photographs of completed work, weighbridge vouchers, or water laboratory purity certificates. (JPG, PNG, PDF ≤ 10MB)
            </p>

            {evidenceAttachments.length < 5 && (
              <label className="border-2 border-dashed border-slate-300 rounded-lg p-3 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-slate-400 bg-slate-50/50">
                <Upload className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold text-slate-700">Attach Inspection Photo or Certificate</span>
                <input
                  type="file"
                  multiple
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={handleEvidenceFileChange}
                  className="hidden"
                />
              </label>
            )}

            {evidenceAttachments.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {evidenceAttachments.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-2 bg-slate-50 border rounded text-xs">
                    <span className="truncate max-w-[180px] font-semibold">{f.filename}</span>
                    <button
                      type="button"
                      onClick={() => setEvidenceAttachments((prev) => prev.filter((a) => a.id !== f.id))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={isSubmitting}>
              Submit Report to Administrator
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
