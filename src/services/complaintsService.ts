/**
 * Complaints Service
 * Handles complaint queries, submissions, duplicate checking, objections, and citizen feedback.
 */

import { ENV } from '../config/env';
import { apiRequest } from './apiClient';
import { Complaint, PaginatedResult, EvidenceAttachment } from '../types';
import { mockStore } from '../mocks/mockStore';

export interface ComplaintFilterParams {
  search?: string;
  status?: string;
  category?: string;
  priority?: string;
  page?: number;
  size?: number;
  sort?: string;
}

export const complaintsService = {
  async getMyComplaints(params: ComplaintFilterParams = {}): Promise<PaginatedResult<Complaint>> {
    if (ENV.IS_DEMO) {
      const user = mockStore.getCurrentUser();
      let list = mockStore.getComplaints().filter((c) => c.citizenId === user.id);

      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter((c) => c.title.toLowerCase().includes(s) || c.id.toLowerCase().includes(s));
      }
      if (params.status) {
        list = list.filter((c) => c.status === params.status);
      }
      if (params.category) {
        list = list.filter((c) => c.categoryId === params.category);
      }
      if (params.priority) {
        list = list.filter((c) => c.priority === params.priority);
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

    return await apiRequest<PaginatedResult<Complaint>>('/complaints/mine', {
      params: params as any,
    });
  },

  async getComplaintById(id: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      const item = mockStore.getComplaintById(id);
      if (!item) {
        throw { status: 404, code: 'NOT_FOUND', message: 'Complaint record not found.' };
      }
      return item;
    }
    return await apiRequest<Complaint>(`/complaints/${id}`);
  },

  async checkDuplicates(params: {
    categoryId: string;
    wardZoneId: string;
    title: string;
  }): Promise<{
    hasDuplicates: boolean;
    ownMatches: { id: string; title: string; status: any }[];
    genericNotice?: string;
  }> {
    if (ENV.IS_DEMO) {
      const user = mockStore.getCurrentUser();
      return mockStore.checkDuplicates(params.categoryId, params.wardZoneId, params.title, user.id);
    }
    return await apiRequest('/complaints/duplicate-check', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async submitComplaint(
    data: {
      title: string;
      description: string;
      categoryId: string;
      wardZoneId: string;
      exactLocation: string;
      incidentDate?: string;
      attachments: EvidenceAttachment[];
    },
    idempotencyKey: string
  ): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.submitComplaint({
        ...data,
        idempotencyKey,
      });
    }

    return await apiRequest<Complaint>('/complaints', {
      method: 'POST',
      idempotencyKey,
      body: JSON.stringify(data),
    });
  },

  async replyToInfoRequest(complaintId: string, response: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.replyToInfoRequest(complaintId, response);
    }
    return await apiRequest<Complaint>(`/complaints/${complaintId}/info-responses`, {
      method: 'POST',
      body: JSON.stringify({ response }),
    });
  },

  async submitObjection(complaintId: string, reason: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.submitCitizenObjection(complaintId, reason);
    }
    return await apiRequest<Complaint>(`/complaints/${complaintId}/objections`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async submitFeedback(complaintId: string, rating: number, comment?: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.submitFeedback(complaintId, rating, comment);
    }
    return await apiRequest<Complaint>(`/complaints/${complaintId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    });
  },

  async requestReopening(complaintId: string, reason: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.requestLateReopening(complaintId, reason);
    }
    return await apiRequest<Complaint>(`/complaints/${complaintId}/reopen-requests`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async requestWithdrawal(complaintId: string, reason: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.requestWithdrawal(complaintId, reason);
    }
    return await apiRequest<Complaint>(`/complaints/${complaintId}/withdrawal-requests`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};
