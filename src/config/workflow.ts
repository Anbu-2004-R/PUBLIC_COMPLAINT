/**
 * Complaint Status & Workflow Configuration
 * Source of Truth: SRS v1.1 Section 7.2 & Section 6.1
 */

export type UserRole = 'CITIZEN' | 'OFFICER' | 'ADMIN';

export type ComplaintStatus =
  | 'SUBMITTED'
  | 'UNASSIGNED'
  | 'ASSIGNED'
  | 'ACKNOWLEDGED'
  | 'IN_PROGRESS'
  | 'AWAITING_CITIZEN_INFO'
  | 'RESOLUTION_REPORT_SUBMITTED'
  | 'RESOLUTION_REPORT_REJECTED'
  | 'RESOLVED_AWAITING_FEEDBACK'
  | 'REOPENED'
  | 'ESCALATED'
  | 'CLOSED'
  | 'WITHDRAWAL_REQUEST_PENDING'
  | 'WITHDRAWN';

export type ComplaintPriority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface StatusMeta {
  code: ComplaintStatus;
  label: string;
  description: string;
  badgeClass: string;
  textClass: string;
}

export const STATUS_DEFINITIONS: Record<ComplaintStatus, StatusMeta> = {
  SUBMITTED: {
    code: 'SUBMITTED',
    label: 'Submitted',
    description: 'Complaint successfully received and pending initial routing',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200',
    textClass: 'text-slate-700',
  },
  UNASSIGNED: {
    code: 'UNASSIGNED',
    label: 'Unassigned',
    description: 'No eligible officer found or routing requires administrative review',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    textClass: 'text-amber-700',
  },
  ASSIGNED: {
    code: 'ASSIGNED',
    label: 'Assigned',
    description: 'Responsible officer selected and assigned to the case',
    badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
    textClass: 'text-sky-700',
  },
  ACKNOWLEDGED: {
    code: 'ACKNOWLEDGED',
    label: 'Acknowledged',
    description: 'Officer has acknowledged receipt and started preliminary review',
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
    textClass: 'text-blue-700',
  },
  IN_PROGRESS: {
    code: 'IN_PROGRESS',
    label: 'In Progress',
    description: 'Investigation or corrective work is actively underway',
    badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    textClass: 'text-indigo-700',
  },
  AWAITING_CITIZEN_INFO: {
    code: 'AWAITING_CITIZEN_INFO',
    label: 'Awaiting Citizen Information',
    description: 'Officer requested additional information from the complainant',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
    textClass: 'text-amber-700',
  },
  RESOLUTION_REPORT_SUBMITTED: {
    code: 'RESOLUTION_REPORT_SUBMITTED',
    label: 'Resolution Report Submitted / Awaiting Review',
    description: 'Officer has submitted a resolution report for administrative review',
    badgeClass: 'bg-purple-50 text-purple-800 border-purple-200',
    textClass: 'text-purple-700',
  },
  RESOLUTION_REPORT_REJECTED: {
    code: 'RESOLUTION_REPORT_REJECTED',
    label: 'Resolution Report Rejected',
    description: 'Admin rejected the resolution report; complaint returned to In Progress',
    badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
    textClass: 'text-rose-700',
  },
  RESOLVED_AWAITING_FEEDBACK: {
    code: 'RESOLVED_AWAITING_FEEDBACK',
    label: 'Resolved — Awaiting Citizen Feedback',
    description: 'Administrator approved resolution report; 7-day objection window active',
    badgeClass: 'bg-teal-50 text-teal-800 border-teal-200',
    textClass: 'text-teal-700',
  },
  REOPENED: {
    code: 'REOPENED',
    label: 'Reopened',
    description: 'Citizen filed a formal objection or administrator approved late reopening',
    badgeClass: 'bg-orange-50 text-orange-800 border-orange-200',
    textClass: 'text-orange-700',
  },
  ESCALATED: {
    code: 'ESCALATED',
    label: 'Escalated',
    description: 'Complaint requires urgent administrative supervisor intervention',
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
    textClass: 'text-red-700',
  },
  CLOSED: {
    code: 'CLOSED',
    label: 'Closed',
    description: 'Complaint reached official administrative closure (objection window elapsed)',
    badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    textClass: 'text-emerald-700',
  },
  WITHDRAWAL_REQUEST_PENDING: {
    code: 'WITHDRAWAL_REQUEST_PENDING',
    label: 'Withdrawal Request Pending',
    description: 'Citizen requested withdrawal; administrative review pending',
    badgeClass: 'bg-stone-50 text-stone-800 border-stone-200',
    textClass: 'text-stone-700',
  },
  WITHDRAWN: {
    code: 'WITHDRAWN',
    label: 'Withdrawn',
    description: 'Complaint formally withdrawn after administrative approval',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
    textClass: 'text-zinc-600',
  },
};

export interface PriorityMeta {
  code: ComplaintPriority;
  label: string;
  description: string;
  ackTarget: string;
  actionTarget: string;
  is24x7: boolean;
  badgeClass: string;
}

export const PRIORITY_DEFINITIONS: Record<ComplaintPriority, PriorityMeta> = {
  CRITICAL: {
    code: 'CRITICAL',
    label: 'Critical',
    description: 'Immediate danger or severe public hazard',
    ackTarget: 'Within 15 minutes',
    actionTarget: 'Within 1 hour',
    is24x7: true,
    badgeClass: 'bg-red-50 text-red-800 border-red-200',
  },
  HIGH: {
    code: 'HIGH',
    label: 'High',
    description: 'Serious issue requiring urgent attention',
    ackTarget: 'Within 4 working hours',
    actionTarget: 'Within 1 working day',
    is24x7: false,
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  MEDIUM: {
    code: 'MEDIUM',
    label: 'Medium',
    description: 'Routine issue requiring timely action',
    ackTarget: 'Within 1 working day',
    actionTarget: 'Within 3 working days',
    is24x7: false,
    badgeClass: 'bg-blue-50 text-blue-800 border-blue-200',
  },
  LOW: {
    code: 'LOW',
    label: 'Low',
    description: 'Minor issue with limited immediate impact',
    ackTarget: 'Within 3 working days',
    actionTarget: 'Within 7 working days',
    is24x7: false,
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

export type ActionKey =
  | 'REPLY_INFO'
  | 'SUBMIT_OBJECTION'
  | 'SUBMIT_FEEDBACK'
  | 'REQUEST_REOPEN'
  | 'REQUEST_WITHDRAWAL'
  | 'REQUEST_CORRECTION'
  | 'ACKNOWLEDGE'
  | 'UPDATE_PROGRESS'
  | 'REQUEST_INFO'
  | 'SUBMIT_RESOLUTION'
  | 'ASSIGN'
  | 'REASSIGN'
  | 'CORRECT_ROUTING'
  | 'REVIEW_RESOLUTION'
  | 'DECIDE_WITHDRAWAL'
  | 'DECIDE_REOPEN'
  | 'ESCALATE'
  | 'CLOSE';

/**
 * Fallback action permission matrix by role and status.
 * In real API mode, backend allowedActions takes priority.
 */
export const ROLE_STATUS_ACTIONS: Record<UserRole, Record<ComplaintStatus, ActionKey[]>> = {
  CITIZEN: {
    SUBMITTED: ['REQUEST_WITHDRAWAL', 'REQUEST_CORRECTION'],
    UNASSIGNED: ['REQUEST_WITHDRAWAL', 'REQUEST_CORRECTION'],
    ASSIGNED: ['REQUEST_WITHDRAWAL', 'REQUEST_CORRECTION'],
    ACKNOWLEDGED: ['REQUEST_WITHDRAWAL', 'REQUEST_CORRECTION'],
    IN_PROGRESS: ['REQUEST_WITHDRAWAL', 'REQUEST_CORRECTION'],
    AWAITING_CITIZEN_INFO: ['REPLY_INFO', 'REQUEST_WITHDRAWAL'],
    RESOLUTION_REPORT_SUBMITTED: [],
    RESOLUTION_REPORT_REJECTED: ['REQUEST_WITHDRAWAL'],
    RESOLVED_AWAITING_FEEDBACK: ['SUBMIT_OBJECTION', 'SUBMIT_FEEDBACK'],
    REOPENED: ['REQUEST_WITHDRAWAL', 'REQUEST_CORRECTION'],
    ESCALATED: ['REQUEST_WITHDRAWAL'],
    CLOSED: ['SUBMIT_FEEDBACK', 'REQUEST_REOPEN'],
    WITHDRAWAL_REQUEST_PENDING: [],
    WITHDRAWN: [],
  },
  OFFICER: {
    SUBMITTED: [],
    UNASSIGNED: [],
    ASSIGNED: ['ACKNOWLEDGE'],
    ACKNOWLEDGED: ['UPDATE_PROGRESS', 'REQUEST_INFO', 'SUBMIT_RESOLUTION'],
    IN_PROGRESS: ['UPDATE_PROGRESS', 'REQUEST_INFO', 'SUBMIT_RESOLUTION'],
    AWAITING_CITIZEN_INFO: ['UPDATE_PROGRESS'],
    RESOLUTION_REPORT_SUBMITTED: [], // Officer cannot approve own report
    RESOLUTION_REPORT_REJECTED: ['UPDATE_PROGRESS', 'REQUEST_INFO', 'SUBMIT_RESOLUTION'],
    RESOLVED_AWAITING_FEEDBACK: [],
    REOPENED: ['UPDATE_PROGRESS', 'REQUEST_INFO', 'SUBMIT_RESOLUTION'],
    ESCALATED: ['UPDATE_PROGRESS', 'SUBMIT_RESOLUTION'],
    CLOSED: [],
    WITHDRAWAL_REQUEST_PENDING: [],
    WITHDRAWN: [],
  },
  ADMIN: {
    SUBMITTED: ['ASSIGN', 'CORRECT_ROUTING'],
    UNASSIGNED: ['ASSIGN', 'CORRECT_ROUTING'],
    ASSIGNED: ['REASSIGN', 'CORRECT_ROUTING', 'ESCALATE'],
    ACKNOWLEDGED: ['REASSIGN', 'CORRECT_ROUTING', 'ESCALATE'],
    IN_PROGRESS: ['REASSIGN', 'CORRECT_ROUTING', 'ESCALATE'],
    AWAITING_CITIZEN_INFO: ['REASSIGN', 'CORRECT_ROUTING'],
    RESOLUTION_REPORT_SUBMITTED: ['REVIEW_RESOLUTION'],
    RESOLUTION_REPORT_REJECTED: ['REASSIGN', 'ESCALATE'],
    RESOLVED_AWAITING_FEEDBACK: ['CLOSE'],
    REOPENED: ['REASSIGN', 'ESCALATE'],
    ESCALATED: ['REASSIGN', 'CORRECT_ROUTING', 'CLOSE'],
    CLOSED: ['DECIDE_REOPEN'],
    WITHDRAWAL_REQUEST_PENDING: ['DECIDE_WITHDRAWAL'],
    WITHDRAWN: [],
  },
};

/**
 * Check if a role is permitted to perform an action on a complaint
 */
export function isActionAllowed(
  role: UserRole,
  status: ComplaintStatus,
  action: ActionKey,
  serverAllowedActions?: ActionKey[]
): boolean {
  if (serverAllowedActions && serverAllowedActions.length > 0) {
    return serverAllowedActions.includes(action);
  }
  const roleActions = ROLE_STATUS_ACTIONS[role]?.[status] || [];
  return roleActions.includes(action);
}
