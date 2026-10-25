/**
 * Central Route definitions for Public Complaint System
 */

export const ROUTES = {
  // Public
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  FORBIDDEN: '/403',
  
  // Citizen
  CITIZEN_DASHBOARD: '/dashboard',
  CITIZEN_COMPLAINTS: '/complaints',
  CITIZEN_NEW_COMPLAINT: '/complaints/new',
  CITIZEN_COMPLAINT_DETAIL: (id: string = ':id') => `/complaints/${id}`,

  // Officer
  OFFICER_DASHBOARD: '/officer',
  OFFICER_COMPLAINTS: '/officer/complaints',
  OFFICER_COMPLAINT_DETAIL: (id: string = ':id') => `/officer/complaints/${id}`,

  // Admin
  ADMIN_DASHBOARD: '/admin',
  ADMIN_COMPLAINTS: '/admin/complaints',
  ADMIN_UNASSIGNED: '/admin/complaints/unassigned',
  ADMIN_COMPLAINT_DETAIL: (id: string = ':id') => `/admin/complaints/${id}`,
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_REVIEW_DETAIL: (id: string = ':id') => `/admin/reviews/${id}`,
  ADMIN_USERS: '/admin/users',
  ADMIN_OFFICERS: '/admin/officers',
  ADMIN_DEPARTMENTS: '/admin/departments',
  ADMIN_ZONES: '/admin/zones',
  ADMIN_MAPPINGS: '/admin/mappings',
  ADMIN_ANALYTICS: '/admin/analytics',
  ADMIN_AUDIT: '/admin/audit',
  ADMIN_SETTINGS: '/admin/settings',

  // Shared Authenticated
  NOTIFICATIONS: '/notifications',
  PROFILE: '/profile',
} as const;
