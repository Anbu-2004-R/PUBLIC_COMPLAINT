/**
 * Notification Service
 * Manages in-app notifications and email dispatch tracking
 */

import { ENV } from '../config/env';
import { apiRequest } from './apiClient';
import { NotificationItem } from '../types';
import { mockStore } from '../mocks/mockStore';

export const notificationService = {
  async getNotifications(): Promise<NotificationItem[]> {
    if (ENV.IS_DEMO) {
      return mockStore.getNotifications();
    }
    return await apiRequest<NotificationItem[]>('/notifications');
  },

  async markAsRead(id: string): Promise<void> {
    if (ENV.IS_DEMO) {
      mockStore.markNotificationRead(id);
      return;
    }
    await apiRequest(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllAsRead(): Promise<void> {
    if (ENV.IS_DEMO) {
      mockStore.markAllNotificationsRead();
      return;
    }
    await apiRequest('/notifications/read-all', { method: 'POST' });
  },
};
