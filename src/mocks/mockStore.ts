/**
 * Stateful in-memory store for Demo Mode
 * Implements SRS v1.1 business logic, routing, and audit logs.
 */

import {
  User,
  Complaint,
  AuditLogItem,
  NotificationItem,
  ComplaintPriority,
  ComplaintStatus,
  ActionKey,
  EvidenceAttachment,
  ResolutionReportItem,
} from '../types';
import { DEMO_USERS, INITIAL_COMPLAINTS, INITIAL_NOTIFICATIONS, INITIAL_AUDIT_LOGS } from './mockData';
import { CATEGORIES, DEPARTMENTS, WARDS_ZONES, Department, Category, WardZone } from '../config/referenceData';
import { ROLE_STATUS_ACTIONS, PRIORITY_DEFINITIONS } from '../config/workflow';

import { DEFAULT_DEMO_PASSWORD_HASH } from '../utils/security';

class MockStore {
  private users: User[] = [...DEMO_USERS];
  private userPasswords: Map<string, string> = new Map();
  private complaints: Complaint[] = [...INITIAL_COMPLAINTS];
  private notifications: NotificationItem[] = [...INITIAL_NOTIFICATIONS];
  private auditLogs: AuditLogItem[] = [...INITIAL_AUDIT_LOGS];
  private departments: Department[] = [...DEPARTMENTS];
  private categories: Category[] = [...CATEGORIES];
  private zones: WardZone[] = [...WARDS_ZONES];
  private idempotencyStore = new Set<string>();

  // Current authenticated user in demo mode
  private currentUser: User = DEMO_USERS[0]; // Default to Citizen Priya Sharma

  getCurrentUser(): User {
    return this.currentUser;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
  }

  getUsers(): User[] {
    return [...this.users];
  }

  findUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    const normalized = clean.replace('@civictrack.org', '@civicpulse.org');
    return this.users.find((u) => {
      const uEmail = u.email.trim().toLowerCase();
      return uEmail === clean || uEmail === normalized || uEmail.replace('@civictrack.org', '@civicpulse.org') === normalized;
    });
  }

  registerUser(user: User, passwordHash: string): User {
    this.users.push(user);
    this.userPasswords.set(user.id, passwordHash);
    this.userPasswords.set(user.email.toLowerCase().trim(), passwordHash);

    this.addAuditLog({
      actorId: user.id,
      actorName: user.fullName,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: user.id,
      reason: 'Citizen online self-registration',
      beforeValue: 'NULL',
      afterValue: `USER_CREATED [email=${user.email}, role=${user.role}, phone=${user.phone}]`,
    });

    return { ...user };
  }

  verifyPassword(userId: string, passwordHash: string): boolean {
    const user = this.users.find((u) => u.id === userId);
    if (!user) return false;

    // Check by ID or normalized email
    const stored = this.userPasswords.get(userId) || this.userPasswords.get(user.email.toLowerCase().trim());
    if (stored) {
      return stored === passwordHash;
    }

    // Default hash fallback for initial pre-seeded demo accounts
    return passwordHash === DEFAULT_DEMO_PASSWORD_HASH;
  }

  setUserPassword(userId: string, passwordHash: string): void {
    this.userPasswords.set(userId, passwordHash);
    const user = this.users.find((u) => u.id === userId);
    if (user) {
      this.userPasswords.set(user.email.toLowerCase().trim(), passwordHash);
    }
  }

  verifyUserEmail(tokenOrEmail: string): boolean {
    const clean = tokenOrEmail.trim().toLowerCase();
    const user = this.users.find((u) => u.email.toLowerCase() === clean);
    if (user) {
      user.emailVerified = true;
      return true;
    }
    // In simulated demo mode, activating verification token marks all unverified accounts as verified
    this.users.forEach((u) => {
      u.emailVerified = true;
    });
    return true;
  }

  updateUserStatus(userId: string, newStatus: 'ACTIVE' | 'DEACTIVATED', reason: string): User {
    const user = this.users.find((u) => u.id === userId);
    if (!user) throw new Error('User not found');
    const oldStatus = user.accountStatus;
    user.accountStatus = newStatus;

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: this.currentUser.role,
      action: 'USER_STATUS_CHANGE',
      entityType: 'User',
      entityId: userId,
      reason,
      beforeValue: `STATUS=${oldStatus}`,
      afterValue: `STATUS=${newStatus}`,
    });

    return { ...user };
  }

  getDepartments(): Department[] {
    return [...this.departments];
  }

  saveDepartment(dept: Department): Department {
    const idx = this.departments.findIndex((d) => d.id === dept.id);
    if (idx >= 0) {
      this.departments[idx] = dept;
    } else {
      dept.id = 'dept-' + Date.now();
      this.departments.push(dept);
    }
    return dept;
  }

  getCategories(): Category[] {
    return [...this.categories];
  }

  saveCategory(cat: Category): Category {
    const idx = this.categories.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      this.categories[idx] = cat;
    } else {
      cat.id = 'cat-' + Date.now();
      this.categories.push(cat);
    }
    return cat;
  }

  getZones(): WardZone[] {
    return [...this.zones];
  }

  saveZone(zone: WardZone): WardZone {
    const idx = this.zones.findIndex((z) => z.id === zone.id);
    if (idx >= 0) {
      this.zones[idx] = zone;
    } else {
      zone.id = 'w-' + Date.now();
      this.zones.push(zone);
    }
    return zone;
  }

  getComplaints(): Complaint[] {
    return [...this.complaints];
  }

  getComplaintById(id: string): Complaint | undefined {
    const complaint = this.complaints.find((c) => c.id === id);
    if (!complaint) return undefined;

    // Refresh allowed actions based on current user's role and status
    const allowed = ROLE_STATUS_ACTIONS[this.currentUser.role]?.[complaint.status] || [];
    return {
      ...complaint,
      allowedActions: allowed,
    };
  }

  // Duplicate Check per SRS FR-24
  checkDuplicates(categoryId: string, wardZoneId: string, title: string, userId: string): {
    hasDuplicates: boolean;
    ownMatches: { id: string; title: string; status: ComplaintStatus }[];
    genericNotice?: string;
  } {
    const keywords = title.toLowerCase().split(/\s+/).filter((w) => w.length > 3);
    const potential = this.complaints.filter(
      (c) =>
        c.wardZoneId === wardZoneId &&
        c.categoryId === categoryId &&
        c.status !== 'CLOSED' &&
        c.status !== 'WITHDRAWN'
    );

    const ownMatches: { id: string; title: string; status: ComplaintStatus }[] = [];
    let hasOthers = false;

    for (const c of potential) {
      const match = keywords.some((k) => c.title.toLowerCase().includes(k) || c.description.toLowerCase().includes(k));
      if (match) {
        if (c.citizenId === userId) {
          ownMatches.push({ id: c.id, title: c.title, status: c.status });
        } else {
          hasOthers = true; // Never reveal private citizen details
        }
      }
    }

    return {
      hasDuplicates: ownMatches.length > 0 || hasOthers,
      ownMatches,
      genericNotice: hasOthers
        ? 'A similar issue was recently reported in this ward. Your report will be cross-referenced for priority action.'
        : undefined,
    };
  }

  // Automatic Routing Engine per SRS FR-09
  private routeComplaint(
    categoryId: string,
    wardZoneId: string,
    priority: ComplaintPriority
  ): {
    officer?: User;
    status: ComplaintStatus;
    reason: string;
  } {
    // 1. Find category and mapped department
    const category = this.categories.find((c) => c.id === categoryId);
    const departmentId = category?.departmentId;

    // 2. Find eligible officers
    const eligibleOfficers = this.users.filter((u) => {
      if (u.role !== 'OFFICER' || u.accountStatus !== 'ACTIVE') return false;
      if (u.departmentId !== departmentId) return false;
      const zoneEligible = !u.eligibleZoneIds || u.eligibleZoneIds.includes(wardZoneId);
      const catEligible = !u.eligibleCategoryIds || u.eligibleCategoryIds.includes(categoryId);
      return zoneEligible && catEligible && u.availabilityStatus === 'AVAILABLE';
    });

    if (eligibleOfficers.length === 0) {
      return {
        status: 'UNASSIGNED',
        reason: 'No eligible and available officer found for this category and ward; queued for Administrator.',
      };
    }

    // 3. Find officer with lowest active workload
    let lowestOfficer = eligibleOfficers[0];
    let minWorkload = Infinity;

    for (const officer of eligibleOfficers) {
      const activeCount = this.complaints.filter(
        (c) =>
          c.assignedOfficerId === officer.id &&
          c.status !== 'CLOSED' &&
          c.status !== 'WITHDRAWN' &&
          c.status !== 'RESOLVED_AWAITING_FEEDBACK'
      ).length;

      if (activeCount < minWorkload) {
        minWorkload = activeCount;
        lowestOfficer = officer;
      }
    }

    return {
      officer: lowestOfficer,
      status: 'ASSIGNED',
      reason: `Auto-routed to ${lowestOfficer.fullName} (active workload: ${minWorkload} cases).`,
    };
  }

  // Complaint Submission per SRS FR-05, FR-06
  submitComplaint(params: {
    title: string;
    description: string;
    categoryId: string;
    wardZoneId: string;
    exactLocation: string;
    incidentDate?: string;
    attachments: EvidenceAttachment[];
    idempotencyKey?: string;
  }): Complaint {
    if (params.idempotencyKey && this.idempotencyStore.has(params.idempotencyKey)) {
      // Idempotency check: find recently submitted complaint
      const existing = this.complaints.find((c) => c.citizenId === this.currentUser.id);
      if (existing) return existing;
    }
    if (params.idempotencyKey) {
      this.idempotencyStore.add(params.idempotencyKey);
    }

    const nextNum = 1000 + this.complaints.length + 1;
    const trackingId = `CP-2026-${nextNum}`;

    const category = this.categories.find((c) => c.id === params.categoryId)!;
    const department = this.departments.find((d) => d.id === category.departmentId)!;
    const zone = this.zones.find((z) => z.id === params.wardZoneId)!;
    const priority = category.defaultPriority || 'MEDIUM';

    // Calculate response deadlines
    const now = new Date();
    const ackDeadline = new Date(now.getTime() + (priority === 'CRITICAL' ? 15 * 60 * 1000 : 4 * 60 * 60 * 1000)).toISOString();
    const actionDeadline = new Date(now.getTime() + (priority === 'CRITICAL' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString();

    const routing = this.routeComplaint(params.categoryId, params.wardZoneId, priority);

    const newComplaint: Complaint = {
      id: trackingId,
      citizenId: this.currentUser.id,
      citizenName: this.currentUser.fullName,
      citizenPhone: this.currentUser.phone,
      citizenEmail: this.currentUser.email,
      categoryId: params.categoryId,
      categoryName: category.name,
      departmentId: department.id,
      departmentName: department.name,
      wardZoneId: params.wardZoneId,
      wardZoneName: zone.name,
      title: params.title,
      description: params.description,
      exactLocation: params.exactLocation,
      incidentDate: params.incidentDate,
      priority,
      status: routing.status,
      assignedOfficerId: routing.officer?.id,
      assignedOfficerName: routing.officer?.fullName,
      assignedAt: routing.officer ? now.toISOString() : undefined,
      ackDeadline,
      actionDeadline,
      submittedAt: now.toISOString(),
      updatedAt: now.toISOString(),
      attachments: params.attachments || [],
      allowedActions: ['REQUEST_WITHDRAWAL', 'REQUEST_CORRECTION'],
      history: [
        {
          id: `h-${Date.now()}-1`,
          complaintId: trackingId,
          oldStatus: null,
          newStatus: 'SUBMITTED',
          changedBy: this.currentUser.id,
          changedByName: this.currentUser.fullName,
          changedByRole: 'CITIZEN',
          changedAt: now.toISOString(),
          reason: 'Initial submission by citizen',
        },
      ],
      progressUpdates: [],
    };

    if (routing.status === 'ASSIGNED' && routing.officer) {
      newComplaint.history?.push({
        id: `h-${Date.now()}-2`,
        complaintId: trackingId,
        oldStatus: 'SUBMITTED',
        newStatus: 'ASSIGNED',
        changedBy: 'SYSTEM',
        changedByName: 'Routing Engine',
        changedByRole: 'ADMIN',
        changedAt: now.toISOString(),
        reason: routing.reason,
      });

      // Send in-app notification to officer
      this.addNotification({
        recipientId: routing.officer.id,
        recipientRole: 'OFFICER',
        title: 'New Complaint Assigned',
        message: `Case ${trackingId} (${category.name}) in ${zone.name} has been assigned to you. Priority: ${priority}.`,
        type: 'ASSIGNMENT',
        relatedComplaintId: trackingId,
      });
    } else {
      // Sent to unassigned queue
      newComplaint.history?.push({
        id: `h-${Date.now()}-2`,
        complaintId: trackingId,
        oldStatus: 'SUBMITTED',
        newStatus: 'UNASSIGNED',
        changedBy: 'SYSTEM',
        changedByName: 'Routing Engine',
        changedByRole: 'ADMIN',
        changedAt: now.toISOString(),
        reason: routing.reason,
      });

      // Alert administrator
      this.addNotification({
        recipientId: 'usr-adm-1',
        recipientRole: 'ADMIN',
        title: 'Unassigned Complaint Alert',
        message: `Case ${trackingId} (${category.name}) could not be auto-routed. Manual officer assignment required.`,
        type: 'UNASSIGNED_ALERT',
        relatedComplaintId: trackingId,
      });
    }

    this.complaints.unshift(newComplaint);

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'CITIZEN',
      action: 'COMPLAINT_SUBMITTED',
      entityType: 'Complaint',
      entityId: trackingId,
      reason: 'Citizen logged grievance',
      afterValue: `STATUS=${routing.status}, CATEGORY=${category.name}, WARD=${zone.name}`,
    });

    return newComplaint;
  }

  // Officer Acknowledges Complaint
  acknowledgeComplaint(complaintId: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'ACKNOWLEDGED';
    complaint.acknowledgedAt = now;
    complaint.updatedAt = now;

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'ACKNOWLEDGED',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'OFFICER',
      changedAt: now,
      reason: 'Officer acknowledged assignment and began preliminary triage',
    });

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'OFFICER',
      action: 'COMPLAINT_ACKNOWLEDGED',
      entityType: 'Complaint',
      entityId: complaintId,
      beforeValue: `STATUS=${oldStatus}`,
      afterValue: 'STATUS=ACKNOWLEDGED',
    });

    return complaint;
  }

  // Officer Adds Progress Update
  addProgressUpdate(complaintId: string, note: string, visibility: 'CITIZEN_VISIBLE' | 'INTERNAL_NOTE'): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    if (complaint.status === 'ACKNOWLEDGED' || complaint.status === 'RESOLUTION_REPORT_REJECTED') {
      complaint.status = 'IN_PROGRESS';
      complaint.actionStartedAt = complaint.actionStartedAt || now;
    }
    complaint.updatedAt = now;

    complaint.progressUpdates = complaint.progressUpdates || [];
    complaint.progressUpdates.push({
      id: `p-${Date.now()}`,
      complaintId,
      officerId: this.currentUser.id,
      officerName: this.currentUser.fullName,
      timestamp: now,
      note,
      visibility,
    });

    // Notify citizen if update is citizen-visible
    if (visibility === 'CITIZEN_VISIBLE') {
      this.addNotification({
        recipientId: complaint.citizenId,
        recipientRole: 'CITIZEN',
        title: 'Investigation Progress Update',
        message: `Officer ${this.currentUser.fullName} posted an update on your case ${complaint.id}: "${note.substring(0, 80)}..."`,
        type: 'PROGRESS_UPDATE',
        relatedComplaintId: complaint.id,
      });
    }

    return complaint;
  }

  // Officer Requests Info from Citizen per SRS FR-13
  requestCitizenInfo(complaintId: string, message: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'AWAITING_CITIZEN_INFO';
    complaint.updatedAt = now;

    complaint.infoRequests = complaint.infoRequests || [];
    complaint.infoRequests.push({
      id: `req-${Date.now()}`,
      complaintId,
      requestedAt: now,
      officerName: this.currentUser.fullName,
      message,
    });

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'AWAITING_CITIZEN_INFO',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'OFFICER',
      changedAt: now,
      reason: `Officer requested clarification: "${message}"`,
    });

    this.addNotification({
      recipientId: complaint.citizenId,
      recipientRole: 'CITIZEN',
      title: 'Action Required: Additional Information Requested',
      message: `Officer ${this.currentUser.fullName} needs more details for complaint ${complaint.id}: "${message}"`,
      type: 'INFO_REQUEST',
      relatedComplaintId: complaint.id,
    });

    return complaint;
  }

  // Citizen Replies to Info Request
  replyToInfoRequest(complaintId: string, response: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'IN_PROGRESS';
    complaint.updatedAt = now;

    if (complaint.infoRequests && complaint.infoRequests.length > 0) {
      const latest = complaint.infoRequests[complaint.infoRequests.length - 1];
      latest.response = response;
      latest.respondedAt = now;
    }

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'IN_PROGRESS',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'CITIZEN',
      changedAt: now,
      reason: `Citizen replied with requested information: "${response.substring(0, 100)}..."`,
    });

    if (complaint.assignedOfficerId) {
      this.addNotification({
        recipientId: complaint.assignedOfficerId,
        recipientRole: 'OFFICER',
        title: 'Citizen Replied to Info Request',
        message: `Citizen ${this.currentUser.fullName} provided details for ${complaint.id}. Investigation resumed.`,
        type: 'CITIZEN_REPLIED',
        relatedComplaintId: complaint.id,
      });
    }

    return complaint;
  }

  // Officer Submits Resolution Report per SRS FR-14
  submitResolutionReport(params: {
    complaintId: string;
    actionsTaken: string;
    outcomeDescription: string;
    completionDate: string;
    evidenceAttachments: EvidenceAttachment[];
  }): Complaint {
    const complaint = this.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) throw new Error('Complaint not found');

    if (!params.evidenceAttachments || params.evidenceAttachments.length === 0) {
      throw new Error('At least one evidence attachment is required to submit a resolution report (SRS FR-14, FR-23).');
    }

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'RESOLUTION_REPORT_SUBMITTED';
    complaint.updatedAt = now;

    const report: ResolutionReportItem = {
      id: `rep-${Date.now()}`,
      complaintId: params.complaintId,
      officerId: this.currentUser.id,
      officerName: this.currentUser.fullName,
      actionsTaken: params.actionsTaken,
      outcomeDescription: params.outcomeDescription,
      completionDate: params.completionDate,
      submittedAt: now,
      evidenceAttachments: params.evidenceAttachments,
      reviewStatus: 'PENDING_REVIEW',
    };

    complaint.resolutionReports = complaint.resolutionReports || [];
    complaint.resolutionReports.push(report);

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId: params.complaintId,
      oldStatus,
      newStatus: 'RESOLUTION_REPORT_SUBMITTED',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'OFFICER',
      changedAt: now,
      reason: 'Officer submitted resolution report with evidence attachments for Administrator review.',
    });

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'OFFICER',
      action: 'RESOLUTION_REPORT_SUBMITTED',
      entityType: 'ResolutionReport',
      entityId: report.id,
      reason: 'Officer completed field remediation',
      afterValue: `COMPLETION_DATE=${params.completionDate}, EVIDENCE_COUNT=${params.evidenceAttachments.length}`,
    });

    // Notify Administrator
    this.addNotification({
      recipientId: 'usr-adm-1',
      recipientRole: 'ADMIN',
      title: 'Resolution Report Pending Review',
      message: `Officer ${this.currentUser.fullName} submitted a resolution report for ${complaint.id}. Review and approve/reject required.`,
      type: 'RESOLUTION_SUBMITTED',
      relatedComplaintId: complaint.id,
    });

    return complaint;
  }

  // Admin Reviews Resolution Report per SRS FR-15
  reviewResolutionReport(params: {
    complaintId: string;
    reportId: string;
    decision: 'APPROVED' | 'REJECTED';
    reason: string; // Mandatory for rejection
  }): Complaint {
    const complaint = this.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const report = complaint.resolutionReports?.find((r) => r.id === params.reportId);
    if (!report) throw new Error('Resolution report not found');

    const now = new Date();
    const oldStatus = complaint.status;

    if (params.decision === 'APPROVED') {
      complaint.status = 'RESOLVED_AWAITING_FEEDBACK';
      report.reviewStatus = 'APPROVED';
      report.adminDecision = {
        decision: 'APPROVED',
        reviewerName: this.currentUser.fullName,
        reviewedAt: now.toISOString(),
        reason: params.reason || 'Evidence verified and accepted',
      };

      // Set 7-day objection window from notification time (SRS FR-16)
      const windowEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString();
      complaint.objectionWindowEnd = windowEnd;
      complaint.updatedAt = now.toISOString();

      complaint.history = complaint.history || [];
      complaint.history.push({
        id: `h-${Date.now()}`,
        complaintId: complaint.id,
        oldStatus,
        newStatus: 'RESOLVED_AWAITING_FEEDBACK',
        changedBy: this.currentUser.id,
        changedByName: this.currentUser.fullName,
        changedByRole: 'ADMIN',
        changedAt: now.toISOString(),
        reason: `Administrator approved resolution report. 7-day objection window active until ${windowEnd}.`,
      });

      // Notify citizen (SRS 9.2)
      this.addNotification({
        recipientId: complaint.citizenId,
        recipientRole: 'CITIZEN',
        title: 'Resolution Approved — 7-Day Review Window Active',
        message: `Your complaint ${complaint.id} has been marked resolved. You have 7 days (until ${new Date(windowEnd).toLocaleDateString()}) to object or provide feedback.`,
        type: 'RESOLUTION_APPROVED',
        relatedComplaintId: complaint.id,
      });

      // Notify officer
      if (complaint.assignedOfficerId) {
        this.addNotification({
          recipientId: complaint.assignedOfficerId,
          recipientRole: 'OFFICER',
          title: 'Resolution Report Approved',
          message: `Your resolution report for ${complaint.id} was approved by Administrator ${this.currentUser.fullName}.`,
          type: 'RESOLUTION_APPROVED_OFFICER',
          relatedComplaintId: complaint.id,
        });
      }
    } else {
      // REJECTED (SRS FR-15, Revision Note v1.1: Returns to In Progress, citizen NOT notified)
      if (!params.reason) {
        throw new Error('A mandatory reason must be provided when rejecting a resolution report.');
      }

      complaint.status = 'IN_PROGRESS';
      report.reviewStatus = 'REJECTED';
      report.adminDecision = {
        decision: 'REJECTED',
        reviewerName: this.currentUser.fullName,
        reviewedAt: now.toISOString(),
        reason: params.reason,
      };
      complaint.updatedAt = now.toISOString();

      complaint.history = complaint.history || [];
      complaint.history.push({
        id: `h-${Date.now()}`,
        complaintId: complaint.id,
        oldStatus,
        newStatus: 'IN_PROGRESS',
        changedBy: this.currentUser.id,
        changedByName: this.currentUser.fullName,
        changedByRole: 'ADMIN',
        changedAt: now.toISOString(),
        reason: `Administrator rejected resolution report: "${params.reason}". Complaint returned to In Progress for further officer remediation.`,
      });

      // Notify Officer only (citizens are NOT notified of rejections per SRS v1.1 section 9.2)
      if (complaint.assignedOfficerId) {
        this.addNotification({
          recipientId: complaint.assignedOfficerId,
          recipientRole: 'OFFICER',
          title: 'Resolution Report Rejected',
          message: `Your resolution report for ${complaint.id} was returned by Administrator. Reason: "${params.reason}". Further corrective action required.`,
          type: 'REPORT_REJECTED',
          relatedComplaintId: complaint.id,
        });
      }
    }

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'ADMIN',
      action: `RESOLUTION_REPORT_${params.decision}`,
      entityType: 'ResolutionReport',
      entityId: params.reportId,
      reason: params.reason,
      beforeValue: `STATUS=${oldStatus}`,
      afterValue: `STATUS=${complaint.status}`,
    });

    return complaint;
  }

  // Citizen Submits Formal Objection within 7-Day Window per SRS FR-16
  submitCitizenObjection(complaintId: string, objectionReason: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    if (complaint.status !== 'RESOLVED_AWAITING_FEEDBACK') {
      throw new Error('Formal objection can only be filed during the active 7-day resolution window.');
    }

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'REOPENED';
    complaint.updatedAt = now;

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'REOPENED',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'CITIZEN',
      changedAt: now,
      reason: `Citizen filed formal objection: "${objectionReason}". Case reopened for renewed investigation.`,
    });

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'CITIZEN',
      action: 'CITIZEN_OBJECTION_FILED',
      entityType: 'Complaint',
      entityId: complaintId,
      reason: objectionReason,
      beforeValue: `STATUS=${oldStatus}`,
      afterValue: 'STATUS=REOPENED',
    });

    // Notify Officer and Admin (SRS FR-16)
    if (complaint.assignedOfficerId) {
      this.addNotification({
        recipientId: complaint.assignedOfficerId,
        recipientRole: 'OFFICER',
        title: 'Complaint Reopened by Citizen Objection',
        message: `Citizen objected to resolution on ${complaint.id}: "${objectionReason}". Status is now Reopened.`,
        type: 'OBJECTION_REOPENED',
        relatedComplaintId: complaint.id,
      });
    }

    this.addNotification({
      recipientId: 'usr-adm-1',
      recipientRole: 'ADMIN',
      title: 'Citizen Objection Logged',
      message: `Citizen filed objection on ${complaint.id}. Case automatically returned to Reopened.`,
      type: 'OBJECTION_ADMIN',
      relatedComplaintId: complaint.id,
    });

    return complaint;
  }

  // Citizen Submits Feedback (1-5 stars) per SRS FR-17
  submitFeedback(complaintId: string, rating: number, comment?: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    complaint.feedback = {
      id: `fb-${Date.now()}`,
      complaintId,
      citizenId: this.currentUser.id,
      rating,
      comment,
      submittedAt: now,
    };
    complaint.updatedAt = now;

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'CITIZEN',
      action: 'CITIZEN_FEEDBACK_SUBMITTED',
      entityType: 'Feedback',
      entityId: complaint.feedback.id,
      afterValue: `RATING=${rating}/5, COMMENT=${comment || 'None'}`,
    });

    return complaint;
  }

  // Citizen Requests Late Reopening per SRS 10.1
  requestLateReopening(complaintId: string, reason: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    complaint.pendingReopenReason = reason;
    complaint.updatedAt = new Date().toISOString();

    this.addNotification({
      recipientId: 'usr-adm-1',
      recipientRole: 'ADMIN',
      title: 'Late Reopening Request Pending',
      message: `Citizen requested late reopening for closed complaint ${complaint.id}: "${reason}". Administrator decision required.`,
      type: 'REOPEN_REQUEST',
      relatedComplaintId: complaint.id,
    });

    return complaint;
  }

  // Admin Decides Late Reopening Request
  decideReopening(complaintId: string, approved: boolean, adminReason: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.pendingReopenReason = undefined;

    if (approved) {
      complaint.status = 'REOPENED';
      complaint.closedAt = undefined;
      complaint.updatedAt = now;

      complaint.history = complaint.history || [];
      complaint.history.push({
        id: `h-${Date.now()}`,
        complaintId,
        oldStatus,
        newStatus: 'REOPENED',
        changedBy: this.currentUser.id,
        changedByName: this.currentUser.fullName,
        changedByRole: 'ADMIN',
        changedAt: now,
        reason: `Administrator approved late reopening request: "${adminReason}"`,
      });

      this.addNotification({
        recipientId: complaint.citizenId,
        recipientRole: 'CITIZEN',
        title: 'Late Reopening Approved',
        message: `Your request to reopen case ${complaint.id} was approved by Administrator. Reason: "${adminReason}".`,
        type: 'REOPEN_APPROVED',
        relatedComplaintId: complaint.id,
      });
    }

    return complaint;
  }

  // Citizen Requests Withdrawal per SRS 10.6
  requestWithdrawal(complaintId: string, reason: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'WITHDRAWAL_REQUEST_PENDING';
    complaint.pendingWithdrawalReason = reason;
    complaint.updatedAt = now;

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'WITHDRAWAL_REQUEST_PENDING',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'CITIZEN',
      changedAt: now,
      reason: `Citizen requested withdrawal: "${reason}"`,
    });

    this.addNotification({
      recipientId: 'usr-adm-1',
      recipientRole: 'ADMIN',
      title: 'Withdrawal Request Submitted',
      message: `Citizen requested withdrawal for ${complaint.id}. Reason: "${reason}". Review required.`,
      type: 'WITHDRAWAL_REQUEST',
      relatedComplaintId: complaint.id,
    });

    return complaint;
  }

  // Admin Decides Withdrawal Request
  decideWithdrawal(complaintId: string, approved: boolean, decisionReason: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.pendingWithdrawalReason = undefined;

    if (approved) {
      complaint.status = 'WITHDRAWN';
      complaint.updatedAt = now;

      complaint.history = complaint.history || [];
      complaint.history.push({
        id: `h-${Date.now()}`,
        complaintId,
        oldStatus,
        newStatus: 'WITHDRAWN',
        changedBy: this.currentUser.id,
        changedByName: this.currentUser.fullName,
        changedByRole: 'ADMIN',
        changedAt: now,
        reason: `Administrator approved withdrawal: "${decisionReason}"`,
      });

      this.addNotification({
        recipientId: complaint.citizenId,
        recipientRole: 'CITIZEN',
        title: 'Complaint Withdrawal Approved',
        message: `Your complaint ${complaint.id} has been formally withdrawn. Decision: "${decisionReason}".`,
        type: 'WITHDRAWAL_APPROVED',
        relatedComplaintId: complaint.id,
      });
    } else {
      complaint.status = 'IN_PROGRESS';
      complaint.updatedAt = now;

      complaint.history = complaint.history || [];
      complaint.history.push({
        id: `h-${Date.now()}`,
        complaintId,
        oldStatus,
        newStatus: 'IN_PROGRESS',
        changedBy: this.currentUser.id,
        changedByName: this.currentUser.fullName,
        changedByRole: 'ADMIN',
        changedAt: now,
        reason: `Administrator rejected withdrawal: "${decisionReason}". Public grievance remains active.`,
      });
    }

    return complaint;
  }

  // Admin Assigns or Reassigns Officer (SRS FR-10, 8.3, 10.8)
  assignOfficer(complaintId: string, officerId: string, reason: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const officer = this.users.find((u) => u.id === officerId && u.role === 'OFFICER');
    if (!officer) throw new Error('Selected officer not found or invalid');

    const now = new Date().toISOString();
    const oldOfficer = complaint.assignedOfficerName || 'Unassigned';
    const oldStatus = complaint.status;

    complaint.assignedOfficerId = officer.id;
    complaint.assignedOfficerName = officer.fullName;
    complaint.assignedAt = now;
    complaint.status = 'ASSIGNED';
    complaint.updatedAt = now;

    // Preserves existing deadline per SRS 10.8: Reassignment does not reset deadline!

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'ASSIGNED',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'ADMIN',
      changedAt: now,
      reason: `Administrator assigned case to ${officer.fullName}. Reason: "${reason}". Original response deadlines preserved.`,
    });

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'ADMIN',
      action: 'ADMIN_OFFICER_ASSIGNED',
      entityType: 'Complaint',
      entityId: complaintId,
      reason,
      beforeValue: `OFFICER=${oldOfficer}`,
      afterValue: `OFFICER=${officer.fullName}`,
    });

    // Notify Officer
    this.addNotification({
      recipientId: officer.id,
      recipientRole: 'OFFICER',
      title: 'Complaint Assigned by Administrator',
      message: `Case ${complaint.id} (${complaint.categoryName}) in ${complaint.wardZoneName} has been assigned to you. Note: "${reason}".`,
      type: 'ASSIGNMENT',
      relatedComplaintId: complaint.id,
    });

    return complaint;
  }

  // Admin Corrects Routing (Category, Priority) per SRS FR-08, 8.3
  correctRouting(params: {
    complaintId: string;
    newCategoryId?: string;
    newPriority?: ComplaintPriority;
    reason: string;
  }): Complaint {
    const complaint = this.complaints.find((c) => c.id === params.complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const beforeParts: string[] = [];
    const afterParts: string[] = [];

    if (params.newCategoryId && params.newCategoryId !== complaint.categoryId) {
      const cat = this.categories.find((c) => c.id === params.newCategoryId);
      if (cat) {
        beforeParts.push(`CATEGORY=${complaint.categoryName}`);
        complaint.categoryId = cat.id;
        complaint.categoryName = cat.name;
        afterParts.push(`CATEGORY=${cat.name}`);
      }
    }

    if (params.newPriority && params.newPriority !== complaint.priority) {
      beforeParts.push(`PRIORITY=${complaint.priority}`);
      complaint.priority = params.newPriority;
      afterParts.push(`PRIORITY=${params.newPriority}`);
    }

    complaint.updatedAt = now;

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId: params.complaintId,
      oldStatus: complaint.status,
      newStatus: complaint.status,
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'ADMIN',
      changedAt: now,
      reason: `Routing correction: ${afterParts.join(', ')}. Reason: "${params.reason}".`,
    });

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'ADMIN',
      action: 'ADMIN_ROUTING_CORRECTION',
      entityType: 'Complaint',
      entityId: params.complaintId,
      reason: params.reason,
      beforeValue: beforeParts.join(', '),
      afterValue: afterParts.join(', '),
    });

    return complaint;
  }

  // Admin Escalation
  escalateComplaint(complaintId: string, reason: string): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'ESCALATED';
    complaint.priority = 'CRITICAL';
    complaint.updatedAt = now;

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'ESCALATED',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'ADMIN',
      changedAt: now,
      reason: `Case escalated by Administrator: "${reason}". Priority elevated to Critical with 24/7 supervisor tracking.`,
    });

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'ADMIN',
      action: 'COMPLAINT_ESCALATED',
      entityType: 'Complaint',
      entityId: complaintId,
      reason,
      beforeValue: `STATUS=${oldStatus}`,
      afterValue: 'STATUS=ESCALATED, PRIORITY=CRITICAL',
    });

    return complaint;
  }

  // Close Complaint (Automatic after 7 days or Admin Final Closure)
  closeComplaint(complaintId: string, reason: string = 'Administrative closure'): Complaint {
    const complaint = this.complaints.find((c) => c.id === complaintId);
    if (!complaint) throw new Error('Complaint not found');

    const now = new Date().toISOString();
    const oldStatus = complaint.status;
    complaint.status = 'CLOSED';
    complaint.closedAt = now;
    complaint.updatedAt = now;

    complaint.history = complaint.history || [];
    complaint.history.push({
      id: `h-${Date.now()}`,
      complaintId,
      oldStatus,
      newStatus: 'CLOSED',
      changedBy: this.currentUser.id,
      changedByName: this.currentUser.fullName,
      changedByRole: 'ADMIN',
      changedAt: now,
      reason,
    });

    this.addAuditLog({
      actorId: this.currentUser.id,
      actorName: this.currentUser.fullName,
      actorRole: 'ADMIN',
      action: 'COMPLAINT_CLOSED',
      entityType: 'Complaint',
      entityId: complaintId,
      reason,
      beforeValue: `STATUS=${oldStatus}`,
      afterValue: 'STATUS=CLOSED',
    });

    return complaint;
  }

  // Notifications API
  getNotifications(): NotificationItem[] {
    return this.notifications.filter(
      (n) => n.recipientId === this.currentUser.id || n.recipientRole === this.currentUser.role
    );
  }

  markNotificationRead(id: string): void {
    const n = this.notifications.find((item) => item.id === id);
    if (n) n.read = true;
  }

  markAllNotificationsRead(): void {
    const userNotifs = this.getNotifications();
    userNotifs.forEach((n) => (n.read = true));
  }

  addNotification(item: Omit<NotificationItem, 'id' | 'read' | 'createdAt'>): void {
    const notif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString(),
      emailDeliveryStatus: 'SENT',
    };
    this.notifications.unshift(notif);
  }

  // Audit Logs
  getAuditLogs(): AuditLogItem[] {
    return [...this.auditLogs];
  }

  addAuditLog(item: Omit<AuditLogItem, 'id' | 'timestamp'>): void {
    const log: AuditLogItem = {
      ...item,
      id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
  }
}

export const mockStore = new MockStore();
