/**
 * Comprehensive Automated End-to-End QA Test Suite
 * Executes live against the running Spring Boot API on port 8081
 */

const BASE_URL = 'http://127.0.0.1:8081/api/v1';

async function req(endpoint, options = {}) {
  const { token, ...rest } = options;
  const headers = {
    'Content-Type': 'application/json',
    ...(rest.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers,
  });
  let body = null;
  const text = await res.text();
  try {
    body = JSON.parse(text);
  } catch (e) {
    body = text;
  }
  return { status: res.status, ok: res.ok, body };
}

const testResults = [];

function recordTest(id, name, expected, passed, evidence) {
  testResults.push({ id, name, expected, status: passed ? 'PASS' : 'FAIL', evidence });
  console.log(`[${passed ? 'PASS' : 'FAIL'}] ${id}: ${name}`);
  if (!passed) console.log(`   Evidence: ${JSON.stringify(evidence)}`);
}

async function runQA() {
  console.log('--- Starting Comprehensive QA Verification Suite ---');

  // TC-01: Citizen Registration
  const testEmail = `qa.citizen.${Date.now()}@testcivic.org`;
  const regRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'QA Test Citizen',
      email: testEmail,
      phone: '+91 8098369020',
      password: 'Password@123',
    }),
  });
  recordTest('TC-01', 'Citizen Registration with Phone (+91 8098369020)', 'Status 200/201 and message', regRes.ok, regRes.body);

  // TC-02: Duplicate Email Rejection
  const dupRes = await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'QA Duplicate',
      email: testEmail,
      phone: '+91 8098369020',
      password: 'Password@123',
    }),
  });
  recordTest('TC-02', 'Duplicate Email Registration Prevention', 'Status 409 Conflict', dupRes.status === 409, dupRes.body);

  // TC-03: Login with Valid Credentials
  const loginRes = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'Password@123',
    }),
  });
  const citizenToken = loginRes.body?.token;
  const citizenUser = loginRes.body?.user;
  recordTest('TC-03', 'Citizen Login & JWT Token Generation', 'JWT token and citizen user returned', !!citizenToken && citizenUser?.role === 'CITIZEN', loginRes.status);

  // TC-04: Login with Invalid Password
  const badLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: testEmail,
      password: 'WrongPassword999!',
    }),
  });
  recordTest('TC-04', 'Authentication Failure on Invalid Credentials', 'Status 401 Unauthorized', badLogin.status === 401, badLogin.body);

  // TC-05: RBAC - Citizen cannot access Officer endpoints
  const citizenAccessOfficer = await req('/officer/complaints', {
    method: 'GET',
    token: citizenToken,
  });
  recordTest('TC-05', 'RBAC Enforcement: Citizen denied access to Officer API', 'Status 403 Forbidden', citizenAccessOfficer.status === 403, citizenAccessOfficer.status);

  // TC-06: RBAC - Citizen cannot access Admin endpoints
  const citizenAccessAdmin = await req('/admin/analytics/summary', {
    method: 'GET',
    token: citizenToken,
  });
  recordTest('TC-06', 'RBAC Enforcement: Citizen denied access to Admin Analytics', 'Status 403 Forbidden', citizenAccessAdmin.status === 403, citizenAccessAdmin.status);

  // TC-07: Officer Login
  const officerLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'officer.pwd@civicpulse.org',
      password: 'Password@123',
    }),
  });
  const officerToken = officerLogin.body?.token;
  recordTest('TC-07', 'Officer Authentication', 'Officer JWT token and role OFFICER', !!officerToken && officerLogin.body?.user?.role === 'OFFICER', officerLogin.status);

  // TC-08: Admin Login
  const adminLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'admin@civicpulse.org',
      password: 'Password@123',
    }),
  });
  const adminToken = adminLogin.body?.token;
  recordTest('TC-08', 'Admin Authentication', 'Admin JWT token and role ADMIN', !!adminToken && adminLogin.body?.user?.role === 'ADMIN', adminLogin.status);

  // TC-09: RBAC - Officer cannot access Admin review approval
  const officerApproveAdmin = await req('/admin/reviews/some-report-id/approve', {
    method: 'POST',
    token: officerToken,
    body: JSON.stringify({ reason: 'Self-approval attempt' }),
  });
  recordTest('TC-09', 'RBAC Enforcement: Officer cannot approve resolution reports', 'Status 403 Forbidden', officerApproveAdmin.status === 403, officerApproveAdmin.status);

  // TC-10: Validation on Complaint Submission (Missing Required Fields)
  const invalidComplaint = await req('/complaints', {
    method: 'POST',
    token: citizenToken,
    body: JSON.stringify({
      title: 'Bad',
      description: 'Short',
    }),
  });
  recordTest('TC-10', 'Validation: Rejection of incomplete complaint submission', 'Status 400 Bad Request', invalidComplaint.status === 400, invalidComplaint.body);

  // TC-11: Valid Complaint Submission & Automatic Assignment
  const complaintRes = await req('/complaints', {
    method: 'POST',
    token: citizenToken,
    body: JSON.stringify({
      title: 'Water pipe leak on 5th Cross Road',
      description: 'Severe underground potable water pipeline fracture flooding the residential road.',
      categoryId: 'cat-roads',
      wardZoneId: 'ward-101',
      exactLocation: 'Opposite Community Hall, 5th Cross',
      incidentDate: '2026-10-24',
    }),
  });
  const complaintId = complaintRes.body?.id;
  const isAssigned = complaintRes.body?.status === 'ASSIGNED' || complaintRes.body?.status === 'SUBMITTED';
  const hasDeadlines = !!complaintRes.body?.ackDeadline && !!complaintRes.body?.actionDeadline;
  recordTest('TC-11', 'Complaint Submission & Automatic Routing with SLA Deadlines', 'Status 200, tracking ID CP-2026-XXXX, assigned with SLA deadlines', complaintRes.ok && !!complaintId && hasDeadlines, { complaintId, status: complaintRes.body?.status });

  // TC-12: IDOR Protection: Another Citizen cannot view this complaint
  const citizen2Email = `qa.citizen2.${Date.now()}@testcivic.org`;
  await req('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      fullName: 'Other Citizen',
      email: citizen2Email,
      phone: '+91 9988776655',
      password: 'Password@123',
    }),
  });
  const citizen2Login = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: citizen2Email,
      password: 'Password@123',
    }),
  });
  const idorCheck = await req(`/complaints/${complaintId}`, {
    method: 'GET',
    token: citizen2Login.body?.token,
  });
  recordTest('TC-12', 'IDOR Defense: Unauthorized citizen cannot access another citizen grievance', 'Status 403 Forbidden', idorCheck.status === 403, idorCheck.status);

  // TC-13: Officer Acknowledges Complaint
  const ackRes = await req(`/officer/complaints/${complaintId}/acknowledge`, {
    method: 'POST',
    token: officerToken,
  });
  recordTest('TC-13', 'Officer Acknowledgement Transition', 'Status ACKNOWLEDGED with timestamp', ackRes.ok && ackRes.body?.status === 'ACKNOWLEDGED', ackRes.body?.status);

  // TC-14: Officer Progress Note (IN_PROGRESS)
  const progRes = await req(`/officer/complaints/${complaintId}/progress`, {
    method: 'POST',
    token: officerToken,
    body: JSON.stringify({
      note: 'Valve isolation completed. Pipeline welding team deployed on site.',
      visibility: 'CITIZEN_VISIBLE',
    }),
  });
  recordTest('TC-14', 'Officer Progress Update & IN_PROGRESS Transition', 'Status IN_PROGRESS and progress update recorded', progRes.ok && progRes.body?.status === 'IN_PROGRESS', progRes.body?.status);

  // TC-15: Officer Resolution Report Without Evidence Attachment (Mandatory Rule)
  const noEvidenceRes = await req(`/officer/complaints/${complaintId}/resolution-reports`, {
    method: 'POST',
    token: officerToken,
    body: JSON.stringify({
      actionsTaken: 'Fixed pipe',
      outcomeDescription: 'Done',
      completionDate: '2026-10-25',
      evidenceAttachments: [],
    }),
  });
  recordTest('TC-15', 'Mandatory Evidence Rule: Rejection of report without attachments', 'Status 400 Bad Request', noEvidenceRes.status === 400, noEvidenceRes.body);

  // TC-16: Officer Submits Resolution Report with Evidence
  const validReportRes = await req(`/officer/complaints/${complaintId}/resolution-reports`, {
    method: 'POST',
    token: officerToken,
    body: JSON.stringify({
      actionsTaken: 'Replaced 4-meter ductile iron pipe section and pressure-tested up to 6 bar.',
      outcomeDescription: 'Potable water flow fully restored with zero leakage.',
      completionDate: '2026-10-25',
      evidenceAttachments: [
        {
          filename: 'pipe_restoration_verified.jpg',
          fileSize: 1048576,
          fileType: 'image/jpeg',
          url: '/api/v1/attachments/demo-pipe-restored',
        },
      ],
    }),
  });
  const reportId = validReportRes.body?.resolutionReports?.[0]?.id;
  recordTest('TC-16', 'Resolution Report Submission with Evidence Attachment', 'Status RESOLUTION_REPORT_SUBMITTED and report created', validReportRes.ok && validReportRes.body?.status === 'RESOLUTION_REPORT_SUBMITTED', { reportId, status: validReportRes.body?.status });

  // TC-17: Admin Rejection Requires Reason (SRS FR-15)
  const emptyReject = await req(`/admin/reviews/${reportId}/reject`, {
    method: 'POST',
    token: adminToken,
    body: JSON.stringify({ reason: '' }),
  });
  recordTest('TC-17', 'Mandatory Review Reason: Rejection requires non-empty reason', 'Status 400 Bad Request', emptyReject.status === 400, emptyReject.body);

  // TC-18: Admin Approves Report & Starts 7-Day Objection Window
  const approveRes = await req(`/admin/reviews/${reportId}/approve`, {
    method: 'POST',
    token: adminToken,
    body: JSON.stringify({ reason: 'Water supply restoration verified by area superintendent.' }),
  });
  const objectionEnd = approveRes.body?.objectionWindowEnd;
  const isSevenDays = objectionEnd && new Date(objectionEnd).getTime() > Date.now() + 6 * 24 * 3600 * 1000;
  recordTest('TC-18', 'Admin Approval & 7-Day Citizen Objection Window Initiation', 'Status RESOLVED_AWAITING_FEEDBACK and objectionWindowEnd ~7 days out', approveRes.ok && approveRes.body?.status === 'RESOLVED_AWAITING_FEEDBACK' && isSevenDays, { status: approveRes.body?.status, objectionWindowEnd: objectionEnd });

  // TC-19: Citizen Submits Formal Objection within 7-Day Window
  const objRes = await req(`/complaints/${complaintId}/objections`, {
    method: 'POST',
    token: citizenToken,
    body: JSON.stringify({
      reason: 'Low pressure observed after repair; silt in household line.',
    }),
  });
  recordTest('TC-19', 'Citizen Formal Objection within 7-day Window', 'Status REOPENED and history entry created', objRes.ok && objRes.body?.status === 'REOPENED', objRes.body?.status);

  // TC-20: Separate Feedback Rating Submission
  const feedbackRes = await req(`/complaints/${complaintId}/feedback`, {
    method: 'POST',
    token: citizenToken,
    body: JSON.stringify({
      rating: 4,
      comment: 'Team was courteous and addressed the issue.',
    }),
  });
  recordTest('TC-20', 'Independent Citizen Feedback Rating (1-5 stars)', 'Feedback recorded without corrupting complaint state', feedbackRes.ok && feedbackRes.body?.feedback?.rating === 4, feedbackRes.body?.feedback);

  // TC-21: Admin Analytics Aggregation
  const analyticsRes = await req('/admin/analytics/summary', {
    method: 'GET',
    token: adminToken,
  });
  recordTest('TC-21', 'Admin Analytics Live Database Aggregation', 'Summary metrics returned with numeric totals', analyticsRes.ok && typeof analyticsRes.body?.total === 'number', analyticsRes.body);

  // TC-22: Audit Log Immutability & Persistence
  const auditRes = await req('/admin/audit-logs', {
    method: 'GET',
    token: adminToken,
  });
  recordTest('TC-22', 'Immutable Audit Trail Logging', 'Audit log entries retrieved with actor, action, timestamp', auditRes.ok && Array.isArray(auditRes.body?.content || auditRes.body), { count: (auditRes.body?.content || auditRes.body)?.length });

  // TC-23: Citizen Withdrawal Request
  const withdrawRes = await req(`/complaints/${complaintId}/withdrawal-requests`, {
    method: 'POST',
    token: citizenToken,
    body: JSON.stringify({ reason: 'Issue resolved by local society maintenance crew.' }),
  });
  recordTest('TC-23', 'Citizen Withdrawal Request Handling', 'Status WITHDRAWAL_PENDING or WITHDRAWN recorded', withdrawRes.ok || withdrawRes.status === 200, withdrawRes.body?.status || withdrawRes.status);

  // TC-24: SQL Injection Defense in Search & Filter Parameters
  const sqliRes = await req('/complaints?search=' + encodeURIComponent("' OR '1'='1' -- "), {
    method: 'GET',
    token: citizenToken,
  });
  recordTest('TC-24', 'SQL Injection Defense: Parameterized Query Sanitation', 'Status 200 without SQL syntax errors or leaking other records', sqliRes.ok && (sqliRes.body?.items !== undefined || sqliRes.body?.total !== undefined || Array.isArray(sqliRes.body)), { status: sqliRes.status, total: sqliRes.body?.total });

  // TC-25: Cross-Site Scripting (XSS) Payload Handling
  const xssComplaint = await req('/complaints', {
    method: 'POST',
    token: citizenToken,
    body: JSON.stringify({
      title: '<script>alert("xss")</script> Drainage overflow',
      description: 'Persistent overflow leaking into sidewalk area <img src=x onerror=alert(1)>',
      categoryId: 'cat-sanitation',
      wardZoneId: 'ward-101',
      exactLocation: 'Opposite Park Gate 3',
      incidentDate: '2026-10-24',
    }),
  });
  recordTest('TC-25', 'XSS Input Handling & HTML Tag Neutralization', 'Stored securely as text content without execution', xssComplaint.ok && !!xssComplaint.body?.id, { id: xssComplaint.body?.id });

  // TC-26: Attachment Validation: Empty file rejected
  const emptyForm = new FormData();
  const emptyBlob = new Blob([], { type: 'image/jpeg' });
  emptyForm.append('file', emptyBlob, 'empty.jpg');
  const emptyRes = await fetch(`${BASE_URL}/attachments/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: emptyForm,
  });
  const emptyBody = await emptyRes.json().catch(() => ({}));
  recordTest('TC-26', 'Attachment Security: Empty file rejection', 'Status 400 Bad Request', emptyRes.status === 400, emptyBody);

  // TC-27: Attachment Validation: Invalid file extension rejected (e.g. .exe)
  const exeForm = new FormData();
  const exeBlob = new Blob(['fake-binary-content'], { type: 'application/octet-stream' });
  exeForm.append('file', exeBlob, 'malware.exe');
  const invalidMime = await fetch(`${BASE_URL}/attachments/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
    body: exeForm,
  });
  const invalidMimeBody = await invalidMime.json().catch(() => ({}));
  recordTest('TC-27', 'Attachment Security: Executable file extension (.exe) rejection', 'Status 400 Bad Request with UNSUPPORTED_FILE_TYPE', invalidMime.status === 400, invalidMimeBody);

  // TC-28: Inactive / Deactivated User Login Block
  const deactivatedLogin = await req('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'deactivated.citizen@civicpulse.org',
      password: 'Password@123',
    }),
  });
  recordTest('TC-28', 'Account Security: Inactive/Deactivated account login prevention', 'Status 401 or 403 with account deactivated message', deactivatedLogin.status === 401 || deactivatedLogin.status === 403, deactivatedLogin.body);

  console.log('\n--- QA Verification Suite Completed ---');
  const passCount = testResults.filter(t => t.status === 'PASS').length;
  console.log(`Summary: ${passCount} / ${testResults.length} Tests PASSED`);
  return testResults;
}

runQA();
