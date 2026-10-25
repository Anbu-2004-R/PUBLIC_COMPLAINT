import { describe, it, expect } from 'vitest';
import {
  STATUS_DEFINITIONS,
  PRIORITY_DEFINITIONS,
  ROLE_STATUS_ACTIONS,
  isActionAllowed,
  ComplaintStatus,
} from '../src/config/workflow';

describe('Workflow & Permission Configuration (SRS v1.1)', () => {
  it('defines all 14 official SRS v1.1 statuses with human-readable labels', () => {
    const requiredStatuses: ComplaintStatus[] = [
      'SUBMITTED',
      'UNASSIGNED',
      'ASSIGNED',
      'ACKNOWLEDGED',
      'IN_PROGRESS',
      'AWAITING_CITIZEN_INFO',
      'RESOLUTION_REPORT_SUBMITTED',
      'RESOLUTION_REPORT_REJECTED',
      'RESOLVED_AWAITING_FEEDBACK',
      'REOPENED',
      'ESCALATED',
      'CLOSED',
      'WITHDRAWAL_REQUEST_PENDING',
      'WITHDRAWN',
    ];

    for (const status of requiredStatuses) {
      expect(STATUS_DEFINITIONS[status]).toBeDefined();
      expect(STATUS_DEFINITIONS[status].label).toBeTruthy();
      expect(STATUS_DEFINITIONS[status].badgeClass).toBeTruthy();
    }

    // Verify Revision Note 1.1: 'Resolution Report Rejected'
    expect(STATUS_DEFINITIONS.RESOLUTION_REPORT_REJECTED.label).toBe('Resolution Report Rejected');
    expect(STATUS_DEFINITIONS.RESOLVED_AWAITING_FEEDBACK.label).toBe('Resolved — Awaiting Citizen Feedback');
  });

  it('defines 4 priority tiers with response target definitions', () => {
    expect(PRIORITY_DEFINITIONS.CRITICAL.is24x7).toBe(true);
    expect(PRIORITY_DEFINITIONS.CRITICAL.ackTarget).toBe('Within 15 minutes');
    expect(PRIORITY_DEFINITIONS.HIGH.is24x7).toBe(false);
    expect(PRIORITY_DEFINITIONS.MEDIUM.is24x7).toBe(false);
    expect(PRIORITY_DEFINITIONS.LOW.is24x7).toBe(false);
  });

  it('enforces officer restrictions: cannot approve own reports or close cases', () => {
    // When a report is submitted, officer CANNOT approve it
    expect(isActionAllowed('OFFICER', 'RESOLUTION_REPORT_SUBMITTED', 'REVIEW_RESOLUTION')).toBe(false);
    expect(isActionAllowed('OFFICER', 'RESOLUTION_REPORT_SUBMITTED', 'CLOSE')).toBe(false);

    // Only Administrator can review resolution
    expect(isActionAllowed('ADMIN', 'RESOLUTION_REPORT_SUBMITTED', 'REVIEW_RESOLUTION')).toBe(true);
  });

  it('permits citizen objection only during the active 7-day resolution window', () => {
    // Objection is allowed in RESOLVED_AWAITING_FEEDBACK
    expect(isActionAllowed('CITIZEN', 'RESOLVED_AWAITING_FEEDBACK', 'SUBMIT_OBJECTION')).toBe(true);
    expect(isActionAllowed('CITIZEN', 'RESOLVED_AWAITING_FEEDBACK', 'SUBMIT_FEEDBACK')).toBe(true);

    // Objection is NOT allowed while in progress or unassigned
    expect(isActionAllowed('CITIZEN', 'IN_PROGRESS', 'SUBMIT_OBJECTION')).toBe(false);
    expect(isActionAllowed('CITIZEN', 'UNASSIGNED', 'SUBMIT_OBJECTION')).toBe(false);
  });

  it('allows citizens to reply when status is AWAITING_CITIZEN_INFO', () => {
    expect(isActionAllowed('CITIZEN', 'AWAITING_CITIZEN_INFO', 'REPLY_INFO')).toBe(true);
    expect(isActionAllowed('CITIZEN', 'IN_PROGRESS', 'REPLY_INFO')).toBe(false);
  });
});
