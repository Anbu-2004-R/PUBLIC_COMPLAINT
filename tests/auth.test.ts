import { describe, it, expect, beforeEach } from 'vitest';
import { authService } from '../src/services/authService';
import { mockStore } from '../src/mocks/mockStore';
import { getAuthToken } from '../src/services/apiClient';

describe('CivicConnect Authentication Flow Verification', () => {
  const testUser = {
    fullName: 'Anbu Selvan',
    email: `citizen.tester.${Date.now()}@example.com`,
    phone: '+919876543210',
    password: 'SecurePassword123!',
  };

  it('1. Registration followed by login with valid credentials succeeds and creates session token', async () => {
    // Register the citizen
    const regResult = await authService.register(testUser);
    expect(regResult.message).toContain('Registration successful');
    expect(regResult.emailVerificationSent).toBe(true);

    // Verify user is persisted in the database/store
    const persistedUser = mockStore.findUserByEmail(testUser.email);
    expect(persistedUser).toBeDefined();
    expect(persistedUser?.fullName).toBe(testUser.fullName);
    expect(persistedUser?.role).toBe('CITIZEN');

    // Attempt login with valid credentials and CITIZEN role
    const loginResult = await authService.login(testUser.email, testUser.password, 'CITIZEN');
    expect(loginResult.token).toBeDefined();
    expect(loginResult.token).toContain('demo-token');
    expect(loginResult.user.email).toBe(testUser.email);
    expect(loginResult.user.role).toBe('CITIZEN');

    // Check in-memory token was set for API client
    expect(getAuthToken()).toBe(loginResult.token);
  });

  it('2. Incorrect password is firmly rejected with INVALID_CREDENTIALS', async () => {
    await expect(
      authService.login(testUser.email, 'WrongPassword999!', 'CITIZEN')
    ).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('3. Unknown email is rejected with generic neutral message', async () => {
    await expect(
      authService.login('nonexistent.user@example.com', 'SomePassword123!', 'CITIZEN')
    ).rejects.toMatchObject({
      status: 401,
      code: 'INVALID_CREDENTIALS',
    });
  });

  it('4. Role mismatch rejection prevents privilege escalation', async () => {
    // Attempt to log in a Citizen under Officer portal
    await expect(
      authService.login(testUser.email, testUser.password, 'OFFICER')
    ).rejects.toMatchObject({
      status: 403,
      code: 'ROLE_MISMATCH',
    });

    // Attempt to log in a Citizen under Admin portal
    await expect(
      authService.login(testUser.email, testUser.password, 'ADMIN')
    ).rejects.toMatchObject({
      status: 403,
      code: 'ROLE_MISMATCH',
    });

    // Attempt to log in an Officer under Citizen portal
    await expect(
      authService.login('officer.pwd@civicpulse.org', 'DemoPass123!', 'CITIZEN')
    ).rejects.toMatchObject({
      status: 403,
      code: 'ROLE_MISMATCH',
    });
  });

  it('5. Inactive / deactivated account rejection', async () => {
    // Create and deactivate a user
    const deactEmail = `deactivated.${Date.now()}@example.com`;
    await authService.register({
      fullName: 'Deactivated User',
      email: deactEmail,
      phone: '+919876543219',
      password: 'SecurePassword123!',
    });

    const user = mockStore.findUserByEmail(deactEmail);
    expect(user).toBeDefined();
    if (user) {
      mockStore.updateUserStatus(user.id, 'DEACTIVATED', 'Security audit deactivation test');
    }

    await expect(
      authService.login(deactEmail, 'SecurePassword123!', 'CITIZEN')
    ).rejects.toMatchObject({
      status: 403,
      code: 'ACCOUNT_DEACTIVATED',
    });
  });

  it('6. Duplicate registration prevention enforces email uniqueness', async () => {
    await expect(
      authService.register({
        fullName: 'Another Person',
        email: testUser.email, // already registered
        phone: '+919876543211',
        password: 'AnotherPassword123!',
      })
    ).rejects.toMatchObject({
      status: 409,
      code: 'EMAIL_ALREADY_EXISTS',
    });
  });

  it('7. Pre-seeded Officer and Admin login with valid credentials and correct roles', async () => {
    // Officer login
    const officerLogin = await authService.login(
      'officer.pwd@civicpulse.org',
      'DemoPass123!',
      'OFFICER'
    );
    expect(officerLogin.user.role).toBe('OFFICER');
    expect(officerLogin.user.departmentName).toContain('Public Works');

    // Admin login
    const adminLogin = await authService.login(
      'admin@civicpulse.org',
      'DemoPass123!',
      'ADMIN'
    );
    expect(adminLogin.user.role).toBe('ADMIN');
  });
});
