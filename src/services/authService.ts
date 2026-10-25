/**
 * Authentication Service
 * Handles Citizen registration, email verification, login, password reset, and session.
 */

import { ENV } from '../config/env';
import { apiRequest, setAuthToken } from './apiClient';
import { User, ApiError } from '../types';
import { mockStore } from '../mocks/mockStore';

import { hashPassword } from '../utils/security';

export interface LoginResponse {
  token: string;
  user: User;
}

export const authService = {
  async login(email: string, password: string, role?: string): Promise<LoginResponse> {
    if (ENV.IS_DEMO) {
      if (!email || !password) {
        const err: ApiError = {
          status: 400,
          code: 'MISSING_CREDENTIALS',
          message: 'Please enter both your email address and password.',
        };
        throw err;
      }

      // 1. Consistent case-insensitive trimmed user lookup
      const matched = mockStore.findUserByEmail(email);

      if (!matched) {
        // FR-02/FR-04: Generic neutral message for unknown email without leaking email existence
        const err: ApiError = {
          status: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please verify your credentials or reset your password.',
        };
        throw err;
      }

      // 2. Secure password verification using salted SHA-256 hash
      const computedHash = await hashPassword(password);
      const isPasswordValid = mockStore.verifyPassword(matched.id, computedHash);

      if (!isPasswordValid) {
        const err: ApiError = {
          status: 401,
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password. Please verify your credentials or reset your password.',
        };
        throw err;
      }

      // 3. Role matching validation: enforce workspace role alignment
      if (role && matched.role !== role) {
        const roleNames: Record<string, string> = {
          CITIZEN: 'Citizen',
          OFFICER: 'Department Officer',
          ADMIN: 'Administrator',
        };
        const actualRoleName = roleNames[matched.role] || matched.role;
        const requestedRoleName = roleNames[role] || role;

        const err: ApiError = {
          status: 403,
          code: 'ROLE_MISMATCH',
          message: `Access denied: This account is registered as a ${actualRoleName}. You cannot sign in under the ${requestedRoleName} workspace. Please select the ${actualRoleName} role tab above.`,
        };
        throw err;
      }

      // 4. Inactive/deactivated account protection
      if (matched.accountStatus === 'DEACTIVATED') {
        const err: ApiError = {
          status: 403,
          code: 'ACCOUNT_DEACTIVATED',
          message: 'This account has been deactivated. Please contact the municipal administrator.',
        };
        throw err;
      }

      // 5. Successful authentication & token generation
      const token = `demo-token-${matched.id}-${Date.now()}`;
      setAuthToken(token);
      mockStore.setCurrentUser(matched);
      return { token, user: matched };
    }

    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
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
      const cleanEmail = data.email.trim().toLowerCase();

      // Validate email uniqueness against store
      const existing = mockStore.findUserByEmail(cleanEmail);
      if (existing) {
        const err: ApiError = {
          status: 409,
          code: 'EMAIL_ALREADY_EXISTS',
          message: 'An account with this email address is already registered.',
          fieldErrors: { email: 'Email address already in use' },
        };
        throw err;
      }

      // Compute secure salted password hash
      const passwordHash = await hashPassword(data.password);

      // Create and persist new Citizen user in the mock database store
      const newUser: User = {
        id: `usr-cit-${Date.now()}`,
        fullName: data.fullName.trim(),
        email: cleanEmail,
        phone: data.phone.trim(),
        role: 'CITIZEN',
        emailVerified: true,
        accountStatus: 'ACTIVE',
        createdAt: new Date().toISOString(),
      };

      mockStore.registerUser(newUser, passwordHash);

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
      mockStore.verifyUserEmail(token);
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
      const newHash = await hashPassword(newPassword);
      const currentUser = mockStore.getCurrentUser();
      if (currentUser) {
        mockStore.setUserPassword(currentUser.id, newHash);
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
