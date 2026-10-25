/**
 * Administrator Service
 * Handles system-wide complaints, unassigned queue, resolution reviews, user/officer management,
 * department/zone configuration, and audit logs.
 */

import { ENV } from '../config/env';
import { apiRequest } from './apiClient';
import { Complaint, PaginatedResult, User, AuditLogItem, ComplaintPriority } from '../types';
import { mockStore } from '../mocks/mockStore';
import { Department, WardZone, Category } from '../config/referenceData';

export interface AdminComplaintFilterParams {
  search?: string;
  departmentId?: string;
  officerId?: string;
  wardZoneId?: string;
  categoryId?: string;
  priority?: string;
  status?: string;
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
}

export const adminService = {
  async getComplaints(params: AdminComplaintFilterParams = {}): Promise<PaginatedResult<Complaint>> {
    if (ENV.IS_DEMO) {
      let list = mockStore.getComplaints();

      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.id.toLowerCase().includes(s) ||
            c.title.toLowerCase().includes(s) ||
            c.citizenName.toLowerCase().includes(s)
        );
      }
      if (params.status) list = list.filter((c) => c.status === params.status);
      if (params.priority) list = list.filter((c) => c.priority === params.priority);
      if (params.departmentId) list = list.filter((c) => c.departmentId === params.departmentId);
      if (params.wardZoneId) list = list.filter((c) => c.wardZoneId === params.wardZoneId);
      if (params.categoryId) list = list.filter((c) => c.categoryId === params.categoryId);
      if (params.officerId) list = list.filter((c) => c.assignedOfficerId === params.officerId);

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

    return await apiRequest<PaginatedResult<Complaint>>('/admin/complaints', {
      params: params as any,
    });
  },

  async getUnassignedQueue(params: { page?: number; size?: number } = {}): Promise<PaginatedResult<Complaint>> {
    if (ENV.IS_DEMO) {
      const list = mockStore.getComplaints().filter((c) => c.status === 'UNASSIGNED');
      const page = params.page || 1;
      const size = params.size || 10;
      const totalItems = list.length;
      const totalPages = Math.ceil(totalItems / size) || 1;

      return {
        items: list.slice((page - 1) * size, page * size),
        page,
        size,
        totalItems,
        totalPages,
      };
    }

    return await apiRequest<PaginatedResult<Complaint>>('/admin/complaints/unassigned', {
      params: params as any,
    });
  },

  async assignOfficer(complaintId: string, officerId: string, reason: string): Promise<Complaint> {
    if (!reason.trim()) {
      throw { status: 400, code: 'REASON_REQUIRED', message: 'A justification reason is required for administrative assignment.' };
    }
    if (ENV.IS_DEMO) {
      return mockStore.assignOfficer(complaintId, officerId, reason);
    }
    return await apiRequest<Complaint>(`/admin/complaints/${complaintId}/assign`, {
      method: 'POST',
      body: JSON.stringify({ officerId, reason }),
    });
  },

  async correctRouting(
    complaintId: string,
    data: { newCategoryId?: string; newPriority?: ComplaintPriority; reason: string }
  ): Promise<Complaint> {
    if (!data.reason.trim()) {
      throw { status: 400, code: 'REASON_REQUIRED', message: 'A reason is required when correcting complaint routing or priority.' };
    }
    if (ENV.IS_DEMO) {
      return mockStore.correctRouting({ complaintId, ...data });
    }
    return await apiRequest<Complaint>(`/admin/complaints/${complaintId}/correction`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async escalateComplaint(complaintId: string, reason: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.escalateComplaint(complaintId, reason);
    }
    return await apiRequest<Complaint>(`/admin/complaints/${complaintId}/escalate`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async closeComplaint(complaintId: string, reason: string): Promise<Complaint> {
    if (ENV.IS_DEMO) {
      return mockStore.closeComplaint(complaintId, reason);
    }
    return await apiRequest<Complaint>(`/admin/complaints/${complaintId}/close`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getResolutionReviews(): Promise<Complaint[]> {
    if (ENV.IS_DEMO) {
      return mockStore.getComplaints().filter((c) => c.status === 'RESOLUTION_REPORT_SUBMITTED');
    }
    return await apiRequest<Complaint[]>('/admin/reviews');
  },

  async reviewResolutionReport(
    complaintId: string,
    reportId: string,
    decision: 'APPROVED' | 'REJECTED',
    reason: string
  ): Promise<Complaint> {
    if (decision === 'REJECTED' && !reason.trim()) {
      throw {
        status: 400,
        code: 'REJECTION_REASON_MANDATORY',
        message: 'A mandatory explanation reason must be provided when rejecting a resolution report (SRS FR-15).',
      };
    }

    if (ENV.IS_DEMO) {
      return mockStore.reviewResolutionReport({
        complaintId,
        reportId,
        decision,
        reason,
      });
    }

    const endpoint = decision === 'APPROVED' ? `/admin/reviews/${reportId}/approve` : `/admin/reviews/${reportId}/reject`;
    return await apiRequest<Complaint>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  async getUsers(params: { role?: string; search?: string } = {}): Promise<User[]> {
    if (ENV.IS_DEMO) {
      let list = mockStore.getUsers();
      if (params.role) list = list.filter((u) => u.role === params.role);
      if (params.search) {
        const s = params.search.toLowerCase();
        list = list.filter((u) => u.fullName.toLowerCase().includes(s) || u.email.toLowerCase().includes(s));
      }
      return list;
    }
    return await apiRequest<User[]>('/admin/users', { params: params as any });
  },

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'DEACTIVATED', reason: string): Promise<User> {
    if (ENV.IS_DEMO) {
      return mockStore.updateUserStatus(userId, status, reason);
    }
    return await apiRequest<User>(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, reason }),
    });
  },

  async getOfficers(): Promise<User[]> {
    if (ENV.IS_DEMO) {
      return mockStore.getUsers().filter((u) => u.role === 'OFFICER');
    }
    return await apiRequest<User[]>('/admin/officers');
  },

  async updateOfficerEligibility(
    officerId: string,
    eligibleCategoryIds: string[],
    eligibleZoneIds: string[]
  ): Promise<User> {
    if (ENV.IS_DEMO) {
      const user = mockStore.getUsers().find((u) => u.id === officerId);
      if (user) {
        user.eligibleCategoryIds = eligibleCategoryIds;
        user.eligibleZoneIds = eligibleZoneIds;
      }
      return user!;
    }
    return await apiRequest<User>(`/admin/officers/${officerId}/eligibility`, {
      method: 'PUT',
      body: JSON.stringify({ eligibleCategoryIds, eligibleZoneIds }),
    });
  },

  async updateOfficerAvailability(officerId: string, availabilityStatus: 'AVAILABLE' | 'ON_LEAVE' | 'BUSY'): Promise<User> {
    if (ENV.IS_DEMO) {
      const user = mockStore.getUsers().find((u) => u.id === officerId);
      if (user) {
        user.availabilityStatus = availabilityStatus;
      }
      return user!;
    }
    return await apiRequest<User>(`/admin/officers/${officerId}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ availabilityStatus }),
    });
  },

  async getDepartments(): Promise<Department[]> {
    if (ENV.IS_DEMO) return mockStore.getDepartments();
    return await apiRequest<Department[]>('/admin/departments');
  },

  async saveDepartment(dept: Department): Promise<Department> {
    if (ENV.IS_DEMO) return mockStore.saveDepartment(dept);
    return await apiRequest<Department>('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(dept),
    });
  },

  async getZones(): Promise<WardZone[]> {
    if (ENV.IS_DEMO) return mockStore.getZones();
    return await apiRequest<WardZone[]>('/admin/zones');
  },

  async saveZone(zone: WardZone): Promise<WardZone> {
    if (ENV.IS_DEMO) return mockStore.saveZone(zone);
    return await apiRequest<WardZone>('/admin/zones', {
      method: 'POST',
      body: JSON.stringify(zone),
    });
  },

  async getCategories(): Promise<Category[]> {
    if (ENV.IS_DEMO) return mockStore.getCategories();
    return await apiRequest<Category[]>('/categories');
  },

  async saveCategory(cat: Category): Promise<Category> {
    if (ENV.IS_DEMO) return mockStore.saveCategory(cat);
    return await apiRequest<Category>('/admin/categories', {
      method: 'POST',
      body: JSON.stringify(cat),
    });
  },

  async getAuditLogs(params: { actorId?: string; entityType?: string } = {}): Promise<AuditLogItem[]> {
    if (ENV.IS_DEMO) {
      let list = mockStore.getAuditLogs();
      if (params.entityType) list = list.filter((l) => l.entityType === params.entityType);
      return list;
    }
    return await apiRequest<AuditLogItem[]>('/admin/audit-logs', { params: params as any });
  },
};
