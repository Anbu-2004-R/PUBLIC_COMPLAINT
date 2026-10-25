/**
 * Security and password hashing utilities.
 * Uses Web Crypto API SHA-256 with a system salt.
 * Ensures passwords are never stored or compared in plain text.
 */

const SYSTEM_SALT = 'civicpulse_salt_2026';

// Pre-computed SHA-256 hash for default demo credentials ('DemoPass123!')
export const DEFAULT_DEMO_PASSWORD_HASH =
  '32499f3c455048931d10659c44aaf76b21af71ad0e90d93788e3ebcf27107adc';

export async function hashPassword(password: string): Promise<string> {
  const salted = `${SYSTEM_SALT}:${password}`;
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(salted);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Resilient fallback for testing runtimes without crypto.subtle
  let hash = 0;
  for (let i = 0; i < salted.length; i++) {
    hash = (hash << 5) - hash + salted.charCodeAt(i);
    hash |= 0;
  }
  return `hash-${Math.abs(hash)}`;
}
