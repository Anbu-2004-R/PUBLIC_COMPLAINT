/**
 * Officer Service
 * Handles officer investigation, progress logging, citizen info requests, and resolution reports.
 */

import { ENV } from '../config/env';
import { apiRequest } from './apiClient';
import { Complaint, PaginatedResult, EvidenceAttachment } from '../types';
import { mockStore } from '../mocks/mockStore';

export interface OfficerFilterParams {
  search?: string;
  status?: string;
  priority?: string;
  overdueOnly?: boolean;
  page?: number;
  size?: number;
}

export const officerService = {
  async getAssignedComplaints(params: OfficerFilterParams = {}): Promise<PaginatedResult<Complaint>> {
    if (ENV.IS_DEMO) {
      const user = mockStore.getCurrentUser();
      let list = mockStore.getComplaints().filter((c) => c.assignedOfficerId === user.id);

      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter((c) => c.title.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
      }
      if (params.status) {
        list = list.filter((c) => c.status === params.status);
      }
      if (params.priority) {
        list = list.filter((c) => c.priority === params.priority);
      }
      if (params.overdueOnly) {
        const now = Date.now();
        list = list.filter((c) => {
          if (!c.ackDeadline && !c.actionDeadline) return false;
          const ackPassed = c.ackDeadline && !c.acknowledgedAt && new Date(c.ackDeadline).getTime() < now;
          const actPassed = c.actionDeadline && !c.actionStartedAt && new Date(c.actionDeadline).getTime() < now;
          return ackPassed || actPassed;
        });
      }

      const page = params.page || 1;
      const size = params.size || 10;
      const totalItems = list.length;
      const totalPages = Math.ceil(totalItems / size) || 1;
      const paginated = list.slice((page - 1) * size, page * size);

      return {
        items: paginated,
        page,
        size,
        totalItems,
        totalPages,
      };
    }

    return await apiRequest<PaginatedResult<Complaint>>('/officer/complaints', {
      params: params as any,
    });
  },

  async acknowledgeComplaint(complaintId: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.acknowledgeComplaint(complaintId);
    }
    return await apiRequest<Complaint>(`/officer/complaints/${complaintId}/acknowledge`, {
      method: 'POST',
    });
  },

  async addProgressUpdate(
    complaintId: string,
    note: string,
    visibility: 'CITIZEN_VISIBLE' | 'INTERNAL_NOTE'
  ): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.addProgressUpdate(complaintId, note, visibility);
    }
    return await apiRequest<Complaint>(`/officer/complaints/${complaintId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ note, visibility }),
    });
  },

  async requestCitizenInfo(complaintId: string, message: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.requestCitizenInfo(complaintId, message);
    }
    return await apiRequest<Complaint>(`/officer/complaints/${complaintId}/info-requests`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  async submitResolutionReport(data: {
    complaintId: string;
    actionsTaken: string;
    outcomeDescription: string;
    completionDate: string;
    evidenceAttachments: EvidenceAttachment[];
  }): Promise<Complaint> {
    if (!data.evidenceAttachments || data.evidenceAttachments.length === 0) {
      throw {
        status: 400,
        code: 'EVIDENCE_REQUIRED',
        message: 'At least one evidence attachment is mandatory before submitting a resolution report (SRS FR-14).',
      };
    }

    if (ENV.IS_DEMO) {
      return mockStore.submitResolutionReport(data);
    }

    return await apiRequest<Complaint>(`/officer/complaints/${data.complaintId}/resolution-reports`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
