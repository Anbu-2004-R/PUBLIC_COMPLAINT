/**
 * Central API Client and Error Handler
 * Enforces in-memory token storage (never localStorage) per Prompt Section 0 & 14
 */

import { ENV } from '../config/env';
import { ApiError } from '../types';

let inMemoryToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  inMemoryToken = token;
}

export function getAuthToken(): string | null {
  return inMemoryToken;
}

export function setUnauthorizedHandler(callback: () => void) {
  onUnauthorizedCallback = callback;
}

interface RequestOptions extends RequestInit {
  idempotencyKey?: string;
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { idempotencyKey, params, headers, ...rest } = options;

  let url = `${ENV.API_BASE_URL}${endpoint}`;
  if (params) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '') {
        query.append(key, String(value));
      }
    }
    const queryString = query.toString();
    if (queryString) {
      url += (url.includes('?') ? '&' : '?') + queryString;
    }
  }

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(headers as Record<string, string>),
  };

  if (inMemoryToken) {
    reqHeaders['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  if (idempotencyKey) {
    reqHeaders['Idempotency-Key'] = idempotencyKey;
  }

  try {
    const response = await fetch(url, {
      ...rest,
      headers: reqHeaders,
    });

    if (response.status === 401) {
      inMemoryToken = null;
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
      const error: ApiError = {
        status: 401,
        code: 'UNAUTHORIZED',
        message: 'Your session has expired. Please sign in again.',
      };
      throw error;
    }

    if (!response.ok) {
      let errorBody: any = null;
      try {
        errorBody = await response.json();
      } catch {
        errorBody = { message: response.statusText };
      }

      const apiError: ApiError = {
        status: response.status,
        code: errorBody.code || `HTTP_${response.status}`,
        message: errorBody.message || 'An unexpected error occurred. Please try again.',
        fieldErrors: errorBody.fieldErrors,
      };
      throw apiError;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return (await response.json()) as T;
  } catch (err: any) {
    if (err.status && err.code) {
      throw err;
    }
    // Network or parse error
    const netError: ApiError = {
      status: 0,
      code: 'NETWORK_ERROR',
      message: 'Unable to reach the server. Please check your network connection and retry.',
    };
    throw netError;
  }
}
