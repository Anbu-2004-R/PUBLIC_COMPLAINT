/**
 * Authentication Service
 * Handles Citizen registration, email verification, login, password reset, and session.
 */

import { ENV } from '../config/env';
import { apiRequest, setAuthToken } from './apiClient';
import { User, ApiError } from '../types';
import { mockStore } from '../mocks/mockStore';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    if (ENV.IS_DEMO) {
      // Demo authentication simulation
      const users = mockStore.getUsers();
      const normalized = email.toLowerCase().replace('@civictrack.org', '@civicpulse.org');
      const matched = users.find(
        (u) => u.email.toLowerCase() === email.toLowerCase() || u.email.toLowerCase() === normalized
      );

      if (!matched) {
        // FR-02: Neutral message after failed login without leaking email existence
        const err: ApiError = {
          status: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please verify your credentials.',
        };
        throw err;
      }

      if (matched.accountStatus === 'DEACTIVATED') {
        const err: ApiError = {
          status: 403,
          code: 'ACCOUNT_DEACTIVATED',
          message: 'This account has been deactivated. Please contact the administrator.',
        };
        throw err;
      }

      const token = `demo-token-${matched.id}-${Date.now()}`;
      setAuthToken(token);
      mockStore.setCurrentUser(matched);
      return { token, user: matched };
    }

    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setAuthToken(response.token);
    return response;
  },

  async register(data: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ message: string; emailVerificationSent: boolean }> {
    if (ENV.IS_DEMO) {
      // Validate uniqueness
      const users = mockStore.getUsers();
      if (users.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
        const err: ApiError = {
          status: 409,
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address is already registered.',
          fieldErrors: { email: 'Email address already in use' },
        };
        throw err;
      }

      return {
        message: 'Registration successful. A verification link has been sent to your email address.',
        emailVerificationSent: true,
      };
    }

    return await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    if (ENV.IS_DEMO) {
      if (!token || token === 'invalid') {
        const err: ApiError = {
          status: 400,
          code: 'INVALID_TOKEN',
          message: 'This verification token is invalid or has expired. Please request a new verification email.',
        };
        throw err;
      }
      return {
        success: true,
        message: 'Your email has been successfully verified! You can now sign in to submit complaints.',
      };
    }

    return await apiRequest('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    if (ENV.IS_DEMO) {
      return { message: 'If an account exists for this email, a new verification link has been dispatched.' };
    }
    return await apiRequest('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async forgotPassword(email: string): Promise<{ message: string }> {
    if (ENV.IS_DEMO) {
      return { message: 'If your email is registered, you will receive password reset instructions shortly.' };
    }
    return await apiRequest('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    if (ENV.IS_DEMO) {
      if (!token || token === 'invalid') {
        const err: ApiError = {
          status: 400,
          code: 'EXPIRED_TOKEN',
          message: 'Password reset link has expired. Please request a new link.',
        };
        throw err;
      }
      return { message: 'Your password has been reset successfully. Please log in with your new credentials.' };
    }
    return await apiRequest('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  },

  async getMe(): Promise<User> {
    if (ENV.IS_DEMO) {
      return mockStore.getCurrentUser();
    }
    return await apiRequest<User>('/auth/me');
  },

  async logout(): Promise<void> {
    setAuthToken(null);
    if (!ENV.IS_DEMO) {
      try {
        await apiRequest('/auth/logout', { method: 'POST' });
      } catch {
        // Silently clear local session
      }
    }
  },
};
