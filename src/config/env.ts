/**
 * Environment configuration reading
 */

export const ENV = {
  API_MODE: (import.meta.env.VITE_API_MODE || 'demo').toLowerCase() as 'demo' | 'real',
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  PHONE_PREFIX: import.meta.env.VITE_PHONE_DEFAULT_PREFIX || '+91',
  IS_DEMO: (import.meta.env.VITE_API_MODE || 'demo').toLowerCase() === 'demo',
};
