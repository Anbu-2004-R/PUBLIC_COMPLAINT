/**
 * Analytics Service
 * Provides metrics and data aggregation for Administrator Analytics & Recharts views
 */

import { ENV } from '../config/env';
import { apiRequest } from './apiClient';
import { mockStore } from '../mocks/mockStore';

export interface AnalyticsSummary {
  total: number;
  inProgress: number;
  resolvedAwaitingFeedback: number;
  closed: number;
  unassigned: number;
  awaitingReview: number;
  critical: number;
  overdue: number;
  complianceRate: number; // percentage
  avgAckHours: number;
  avgResolutionDays: number;
}

export const analyticsService = {
  async getSummary(): Promise<AnalyticsSummary> {
    if (ENV.IS_DEMO) {
      const complaints = mockStore.getComplaints();
      const total = complaints.length;
      const inProgress = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ACKNOWLEDGED').length;
      const resolvedAwaitingFeedback = complaints.filter((c) => c.status === 'RESOLVED_AWAITING_FEEDBACK').length;
      const closed = complaints.filter((c) => c.status === 'CLOSED').length;
      const unassigned = complaints.filter((c) => c.status === 'UNASSIGNED').length;
      const awaitingReview = complaints.filter((c) => c.status === 'RESOLUTION_REPORT_SUBMITTED').length;
      const critical = complaints.filter((c) => c.priority === 'CRITICAL').length;
      
      const now = Date.now();
      const overdue = complaints.filter((c) => {
        if (!c.actionDeadline) return false;
        if (c.status === 'CLOSED' || c.status === 'RESOLVED_AWAITING_FEEDBACK') return false;
        return new Date(c.actionDeadline).getTime() < now;
      }).length;

      return {
        total,
        inProgress,
        resolvedAwaitingFeedback,
        closed,
        unassigned,
        awaitingReview,
        critical,
        overdue,
        complianceRate: 88.5,
        avgAckHours: 1.8,
        avgResolutionDays: 3.2,
      };
    }

    return await apiRequest<AnalyticsSummary>('/admin/analytics/summary');
  },

  async getStatusDistribution(): Promise<{ name: string; count: number; color: string }[]> {
    if (ENV.IS_DEMO) {
      const complaints = mockStore.getComplaints();
      return [
        { name: 'In Progress', count: complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ACKNOWLEDGED').length, color: '#6366f1' },
        { name: 'Awaiting Review', count: complaints.filter((c) => c.status === 'RESOLUTION_REPORT_SUBMITTED').length, color: '#a855f7' },
        { name: 'Citizen Review (7d)', count: complaints.filter((c) => c.status === 'RESOLVED_AWAITING_FEEDBACK').length, color: '#14b8a6' },
        { name: 'Unassigned', count: complaints.filter((c) => c.status === 'UNASSIGNED').length, color: '#f59e0b' },
        { name: 'Reopened', count: complaints.filter((c) => c.status === 'REOPENED').length, color: '#f97316' },
        { name: 'Closed', count: complaints.filter((c) => c.status === 'CLOSED').length, color: '#10b981' },
      ];
    }
    return await apiRequest('/admin/analytics/status-distribution');
  },

  async getDepartmentWorkload(): Promise<{ department: string; active: number; resolved: number }[]> {
    if (ENV.IS_DEMO) {
      const depts = mockStore.getDepartments();
      const complaints = mockStore.getComplaints();
      return depts.map((d) => {
        const deptComplaints = complaints.filter((c) => c.departmentId === d.id);
        const resolved = deptComplaints.filter((c) => c.status === 'CLOSED' || c.status === 'RESOLVED_AWAITING_FEEDBACK').length;
        const active = deptComplaints.length - resolved;
        return {
          department: d.code,
          active,
          resolved,
        };
      });
    }
    return await apiRequest('/admin/analytics/department-workload');
  },

  async getTrendData(): Promise<{ date: string; submitted: number; resolved: number }[]> {
    if (ENV.IS_DEMO) {
      return [
        { date: '17 Oct', submitted: 4, resolved: 3 },
        { date: '18 Oct', submitted: 6, resolved: 5 },
        { date: '19 Oct', submitted: 8, resolved: 6 },
        { date: '20 Oct', submitted: 5, resolved: 7 },
        { date: '21 Oct', submitted: 9, resolved: 8 },
        { date: '22 Oct', submitted: 11, resolved: 9 },
        { date: '23 Oct', submitted: 7, resolved: 6 },
      ];
    }
    return await apiRequest('/admin/analytics/trends');
  },
};
