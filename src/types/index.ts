/**
 * Domain types for Public Complaint System
 */

import { ComplaintPriority, ComplaintStatus, ActionKey, UserRole } from '../config/workflow';

export type { UserRole, ComplaintStatus, ComplaintPriority, ActionKey };

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  emailVerified: boolean;
  accountStatus: 'ACTIVE' | 'DEACTIVATED';
  createdAt: string;
  // Officer specific attributes
  employeeId?: string;
  departmentId?: string;
  departmentName?: string;
  availabilityStatus?: 'AVAILABLE' | 'ON_LEAVE' | 'BUSY';
  eligibleCategoryIds?: string[];
  eligibleZoneIds?: string[];
}

export interface EvidenceAttachment {
  id: string;
  filename: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
  uploadedBy: string;
  url: string;
}

export interface StatusHistoryItem {
  id: string;
  complaintId: string;
  oldStatus: ComplaintStatus | null;
  newStatus: ComplaintStatus;
  changedBy: string;
  changedByName: string;
  changedByRole: UserRole;
  changedAt: string;
  reason?: string;
}

export interface ProgressUpdateItem {
  id: string;
  complaintId: string;
  officerId: string;
  officerName: string;
  timestamp: string;
  note: string;
  visibility: 'CITIZEN_VISIBLE' | 'INTERNAL_NOTE';
}

export interface CitizenInfoRequestItem {
  id: string;
  complaintId: string;
  requestedAt: string;
  officerName: string;
  message: string;
  response?: string;
  respondedAt?: string;
}

export interface ResolutionReportItem {
  id: string;
  complaintId: string;
  officerId: string;
  officerName: string;
  actionsTaken: string;
  outcomeDescription: string;
  completionDate: string;
  submittedAt: string;
  evidenceAttachments: EvidenceAttachment[];
  reviewStatus: 'PENDING_REVIEW' | 'APPROVED' | 'REJECTED';
  adminDecision?: {
    decision: 'APPROVED' | 'REJECTED';
    reviewerName: string;
    reviewedAt: string;
    reason?: string;
  };
}

export interface FeedbackItem {
  id: string;
  complaintId: string;
  citizenId: string;
  rating: number; // 1-5
  comment?: string;
  submittedAt: string;
}

export interface Complaint {
  id: string; // "CP-2026-XXXX"
  citizenId: string;
  citizenName: string;
  citizenPhone: string;
  citizenEmail: string;
  categoryId: string;
  categoryName: string;
  departmentId: string;
  departmentName: string;
  wardZoneId: string;
  wardZoneName: string;
  title: string;
  description: string;
  exactLocation: string;
  mapCoordinates?: { lat: number; lng: number };
  incidentDate?: string;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  assignedAt?: string;
  ackDeadline?: string;
  actionDeadline?: string;
  acknowledgedAt?: string;
  actionStartedAt?: string;
  submittedAt: string;
  updatedAt: string;
  objectionWindowEnd?: string; // 7 days from admin approval
  closedAt?: string;
  attachments: EvidenceAttachment[];
  allowedActions: ActionKey[];
  // Exceptional handling fields
  isPaused?: boolean;
  pauseReason?: string;
  pendingWithdrawalReason?: string;
  pendingReopenReason?: string;
  relatedComplaintIds?: string[];
  // Nested sub-entities
  history?: StatusHistoryItem[];
  progressUpdates?: ProgressUpdateItem[];
  infoRequests?: CitizenInfoRequestItem[];
  resolutionReports?: ResolutionReportItem[];
  feedback?: FeedbackItem;
}

export interface NotificationItem {
  id: string;
  recipientId: string;
  recipientRole: UserRole;
  title: string;
  message: string;
  type: string;
  relatedComplaintId?: string;
  read: boolean;
  createdAt: string;
  emailDeliveryStatus?: 'SENT' | 'PENDING' | 'FAILED';
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  reason?: string;
  beforeValue?: string;
  afterValue?: string;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiError {
  status: number;
  code: string;
  message: string;
  fieldErrors?: Record<string, string>;
}
