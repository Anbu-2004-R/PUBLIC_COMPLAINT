import React, { useState, useEffect, useId } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { complaintsService } from '../../services/complaintsService';
import { CATEGORIES, WARDS_ZONES } from '../../config/referenceData';
import { ROUTES } from '../../config/routes';
import { generateIdempotencyKey } from '../../utils/idempotency';
import { validateFileList } from '../../utils/fileValidation';
import { formatFileSize } from '../../utils/formatting';
import { EvidenceAttachment, Complaint } from '../../types';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/Toast';
import {
  Upload,
  X,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  MapPin,
  ExternalLink,
} from 'lucide-react';

const complaintSchema = z.object({
  categoryId: z.string().min(1, 'Please select a grievance category'),
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(120, 'Title cannot exceed 120 characters'),
  description: z
    .string()
    .min(20, 'Please provide a detailed description of at least 20 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  wardZoneId: z.string().min(1, 'Please select the affected ward / zone'),
  exactLocation: z
    .string()
    .min(5, 'Please provide an exact landmark, street, or house address')
    .max(200, 'Location cannot exceed 200 characters'),
  incidentDate: z.string().optional(),
});

type ComplaintFormData = z.infer<typeof complaintSchema>;

export function ComplaintSubmitForm() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  // One idempotency key per form session
  const [idempotencyKey] = useState<string>(() => generateIdempotencyKey());

  // Form step: 'form' | 'review' | 'success'
  const [step, setStep] = useState<'form' | 'review' | 'success'>('form');
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);

  // Attachments state
  const [attachments, setAttachments] = useState<EvidenceAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Duplicate warning state
  const [duplicateWarning, setDuplicateWarning] = useState<{
    hasDuplicates: boolean;
    ownMatches: { id: string; title: string; status: any }[];
    genericNotice?: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors },
  } = useForm<ComplaintFormData>({
    resolver: zodResolver(complaintSchema),
  });

  const categoryId = watch('categoryId');
  const wardZoneId = watch('wardZoneId');
  const title = watch('title');

  // Trigger duplicate check when category, ward, or title changes
  useEffect(() => {
    if (categoryId && wardZoneId && title && title.length >= 8) {
      const timer = setTimeout(() => {
        complaintsService
          .checkDuplicates({ categoryId, wardZoneId, title })
          .then((res) => {
            if (res.hasDuplicates) {
              setDuplicateWarning(res);
            } else {
              setDuplicateWarning(null);
            }
          })
          .catch(() => setDuplicateWarning(null));
      }, 400);

      return () => clearTimeout(timer);
    }
  }, [categoryId, wardZoneId, title]);

  // Handle client-side file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    const validation = validateFileList(files, attachments.length);
    if (!validation.valid) {
      setUploadError(validation.errors.join(' '));
      return;
    }

    const newAttachments: EvidenceAttachment[] = files.map((file) => ({
      id: 'att-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      filename: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date().toISOString(),
      uploadedBy: 'Complainant',
      url: file.type.startsWith('image/') ? URL.createObjectURL(file) : '#',
    }));

    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Step 1: Proceed to Review
  const onProceedToReview = () => {
    setStep('review');
  };

  // Step 2: Final Submit
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);
    const formData = getValues();

    try {
      const created = await complaintsService.submitComplaint(
        {
          ...formData,
          attachments,
        },
        idempotencyKey
      );

      setSubmittedComplaint(created);
      setStep('success');
      showToast({
        type: 'success',
        title: 'Complaint Registered',
        message: `Tracking ID ${created.id} has been generated.`,
      });
    } catch (err: any) {
      setSubmissionError(
        err.message || 'Submission could not be completed. Your form data has been preserved. Please retry.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS STEP: Show tracking ID and next steps
  if (step === 'success' && submittedComplaint) {
    return (
      <div className="max-w-2xl mx-auto py-10 px-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
              Submission Successful
            </span>
            <h1 className="text-2xl font-extrabold text-slate-900 mt-3">Grievance Registered</h1>
            <p className="text-xs text-slate-500 mt-1">
              Your report has been saved to the municipal registry with an immutable tracking ID.
            </p>
          </div>

          {/* Tracking ID Badge */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs text-slate-500 mb-1">Official Tracking ID</p>
            <p className="text-2xl font-mono font-bold text-slate-900 tracking-wider">
              {submittedComplaint.id}
            </p>
          </div>

          <div className="text-left bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-900">What happens next?</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <strong>Routing:</strong> Handled by {submittedComplaint.departmentName} (Status:{' '}
                <span className="font-medium">{submittedComplaint.status}</span>).
              </li>
              {submittedComplaint.assignedOfficerName && (
                <li>
                  <strong>Assigned Officer:</strong> {submittedComplaint.assignedOfficerName}.
                </li>
              )}
              <li>
                <strong>Target Response:</strong> Acknowledged within response target hours; progress updates will be posted here.
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to={ROUTES.CITIZEN_COMPLAINT_DETAIL(submittedComplaint.id)} className="flex-1">
              <Button size="md" className="w-full">
                View Complaint Timeline
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to={ROUTES.CITIZEN_DASHBOARD} className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                Go to Citizen Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // REVIEW STEP
  if (step === 'review') {
    const formData = getValues();
    const categoryName = CATEGORIES.find((c) => c.id === formData.categoryId)?.name || formData.categoryId;
    const wardName = WARDS_ZONES.find((z) => z.id === formData.wardZoneId)?.name || formData.wardZoneId;

    return (
      <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setStep('form')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Edit Complaint Details
          </button>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">Review Before Final Submission</h1>
          <p className="text-xs text-slate-500">
            Please verify your grievance details. A tracking ID will be generated upon confirmation.
          </p>
        </div>

        {submissionError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-xs text-rose-800">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Submission Failed</p>
              <p className="mt-0.5">{submissionError}</p>
            </div>
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4 border-b border-slate-100 text-xs">
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Category</p>
              <p className="font-semibold text-slate-900 mt-0.5">{categoryName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Ward / Zone</p>
              <p className="font-semibold text-slate-900 mt-0.5">{wardName}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Exact Landmark</p>
              <p className="font-semibold text-slate-900 mt-0.5">{formData.exactLocation}</p>
            </div>
            <div>
              <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Incident Date</p>
              <p className="font-semibold text-slate-900 mt-0.5">{formData.incidentDate || 'Not specified'}</p>
            </div>
          </div>

          <div>
            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Title</p>
            <p className="text-sm font-semibold text-slate-900 mt-0.5">{formData.title}</p>
          </div>

          <div>
            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Detailed Description</p>
            <p className="text-xs text-slate-700 mt-1 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {formData.description}
            </p>
          </div>

          {/* Attachments Review */}
          <div>
            <p className="text-slate-400 font-semibold uppercase tracking-wider text-[10px] mb-2">
              Attached Evidence ({attachments.length} files)
            </p>
            {attachments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">No attachments uploaded (initial evidence is optional).</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {attachments.map((att) => (
                  <div key={att.id} className="p-2 border border-slate-200 rounded-lg bg-slate-50 text-xs">
                    <p className="font-semibold truncate text-slate-900">{att.filename}</p>
                    <p className="text-[10px] text-slate-500">{formatFileSize(att.fileSize)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 pt-2">
          <Button variant="outline" size="md" onClick={() => setStep('form')} disabled={isSubmitting}>
            Modify Details
          </Button>

          <Button size="md" onClick={handleFinalSubmit} isLoading={isSubmitting}>
            Confirm and Submit Grievance
          </Button>
        </div>
      </div>
    );
  }

  // STEP 1: FORM INPUT
  return (
    <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Submit a Civic Complaint</h1>
        <p className="text-xs text-slate-500 mt-1">
          Provide accurate details and landmarks. Fields marked with{' '}
          <span className="text-rose-600 font-bold">*</span> are mandatory.
        </p>
      </div>

      {/* Duplicate Warning Callout per SRS FR-24 */}
      {duplicateWarning && duplicateWarning.hasDuplicates && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
          <div className="flex items-center gap-2 text-amber-900 text-xs font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Potential Duplicate / Existing Complaints Detected</span>
          </div>

          {duplicateWarning.ownMatches.length > 0 && (
            <div className="text-xs text-amber-900">
              <p className="font-semibold mb-1">Your existing reports in this category and ward:</p>
              <ul className="space-y-1">
                {duplicateWarning.ownMatches.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 bg-amber-100/70 p-1.5 rounded">
                    <span>
                      <strong className="font-mono">{m.id}</strong>: {m.title} ({m.status})
                    </span>
                    <Link
                      to={ROUTES.CITIZEN_COMPLAINT_DETAIL(m.id)}
                      className="text-amber-950 font-bold hover:underline flex items-center gap-1 shrink-0"
                    >
                      View <ExternalLink className="w-3 h-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {duplicateWarning.genericNotice && (
            <p className="text-xs text-amber-800 leading-relaxed italic">
              {duplicateWarning.genericNotice}
            </p>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit(onProceedToReview)} className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Grievance Category"
            required
            error={errors.categoryId?.message}
            {...register('categoryId')}
          >
            <option value="">Select Category</option>
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </Select>

          <Select
            label="Ward / Municipal Zone"
            required
            error={errors.wardZoneId?.message}
            {...register('wardZoneId')}
          >
            <option value="">Select Ward</option>
            {WARDS_ZONES.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.name} ({zone.zone} Zone)
              </option>
            ))}
          </Select>
        </div>

        <Input
          label="Short Title"
          required
          placeholder="e.g. Broken water pipe leaking on 4th Main Road"
          error={errors.title?.message}
          {...register('title')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input
            label="Exact Location / Landmark"
            required
            placeholder="e.g. Opposite City Hospital Gate 3, 4th Main Road"
            error={errors.exactLocation?.message}
            {...register('exactLocation')}
          />

          <Input
            label="Date Issue Occurred"
            type="date"
            error={errors.incidentDate?.message}
            {...register('incidentDate')}
          />
        </div>

        <Textarea
          label="Detailed Description"
          required
          rows={5}
          placeholder="Describe the nature of the issue, severity, observed damage, hazards to traffic or public safety, and any previous attempts to notify local staff..."
          error={errors.description?.message}
          hint="Minimum 20 characters. Be specific to aid officer investigation."
          {...register('description')}
        />

        {/* Attachments Section per SRS FR-23 */}
        <div className="space-y-3 pt-3 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700">
                Evidence Files (Optional)
              </label>
              <p className="text-[11px] text-slate-500">
                JPG, PNG, or PDF. Max 10 MB per file. Up to 5 files total.
              </p>
            </div>
            <span className="text-xs text-slate-400 tabular-nums">
              {attachments.length} / 5 uploaded
            </span>
          </div>

          {uploadError && <p className="text-xs text-rose-600 font-medium">{uploadError}</p>}

          {/* Upload Button */}
          {attachments.length < 5 && (
            <label className="border-2 border-dashed border-slate-300 rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-slate-400 bg-slate-50/50 transition-colors">
              <Upload className="w-5 h-5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700">Click to upload photo or inspection document</span>
              <span className="text-[11px] text-slate-400">JPG, PNG, PDF up to 10MB</span>
              <input
                type="file"
                multiple
                accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          )}

          {/* Attachment list thumbnails */}
          {attachments.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {attachments.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{file.filename}</p>
                      <p className="text-[10px] text-slate-500">{formatFileSize(file.fileSize)}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeAttachment(file.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                    aria-label={`Remove ${file.filename}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link to={ROUTES.CITIZEN_COMPLAINTS}>
            <Button variant="ghost" size="md">
              Cancel
            </Button>
          </Link>
          <Button type="submit" size="md">
            Review Submission
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </form>
    </div>
  );
}
