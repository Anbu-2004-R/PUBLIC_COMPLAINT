# Public Complaint System (CivicTrack) — Frontend Application

A production-grade, accessible, and responsive civic case-management frontend application for public citizens, department officers, and municipal administrators.

**Baseline Document:** Project Analysis and Software Requirements Specification (SRS) Version 1.1.

---

## 1. Stack & Architecture

- **Runtime:** Node.js 20 LTS
- **Core Library:** React 19 with Vite 8 and TypeScript
- **Styling:** Tailwind CSS v4 (configured via `@tailwindcss/vite` and `@import "tailwindcss";` in `src/index.css`)
- **Routing:** React Router v6 with centralized route definitions and role-based guards
- **Typography:** Plus Jakarta Sans (Display), DM Sans (Body), JetBrains Mono (Data & Tabular Figures)
- **Forms & Validation:** React Hook Form with Zod (`@hookform/resolvers`)
- **Visual Icons:** Lucide React (Strict affordance-only icons; no decorative emojis or pseudo-code comment headers)
- **Data Visualizations:** Recharts for departmental workload, lifecycle distribution, and resolution trends
- **State Architecture:** React Context (`AuthContext`, `NotificationContext`, `ToastContext`) and service-layer encapsulation
- **Testing:** Vitest for workflow permissions, status mapping, file validation, and form schemas
- **Auth Token Strategy:** Bearer tokens stored in-memory (never persisted in `localStorage` for privacy & security)

---

## 2. Prerequisites & Quick Start

### Prerequisites
- Node.js 20.x or higher
- npm 10.x or higher

### Local Setup
```bash
# Clone and enter directory
cd applet

# Install dependencies
npm install

# Start local development server (Port 3000)
npm run dev

# Run unit tests
npm test

# Verify TypeScript types and lint
npm run lint

# Build for production
npm run build
```

---

## 3. Switching Modes (Demo vs. Real Backend)

The application supports dual-mode operation controlled via `VITE_API_MODE`:

1. **Demo Mode (`VITE_API_MODE=demo`):**
   - Active by default for local college demonstrations, testing, and vivas.
   - Powered by a stateful in-memory store (`src/mocks/mockStore.ts`) that executes automatic routing, workload tie-breaking, duplicate detection, and immutable audit logs.
   - Displays a prominent amber **DEMO MODE** banner with a one-click role switcher across Citizen, Officer, and Administrator accounts.

2. **Real Backend Mode (`VITE_API_MODE=real`):**
   - Directs all REST calls to the Spring Boot backend (`VITE_API_BASE_URL="/api/v1"`).
   - In-memory mock services are completely bypassed.
   - Enforces real bearer token authorization headers, HTTP 401 session expiration redirects, and backend `Idempotency-Key` headers.

To switch to Real Backend Mode, configure your `.env` file:
```env
VITE_API_MODE=real
VITE_API_BASE_URL="http://localhost:8080/api/v1"
VITE_PHONE_DEFAULT_PREFIX="+91"
```

---

## 4. Demo Accounts for Immediate Evaluation

| Role | Name | Email | Password | Details |
|---|---|---|---|---|
| **Citizen** | Priya Sharma | `citizen@civictrack.org` | `Citizen123!` | Active citizen complainant with multiple filed grievances |
| **Officer (PWD)** | Er. Rajesh Kumar | `officer.pwd@civictrack.org` | `Officer123!` | Public Works Department (Roads, Infrastructure) |
| **Officer (Water)** | Er. Anita Desai | `officer.water@civictrack.org` | `Officer123!` | Water Supply and Sewerage Board |
| **Officer (Safety)** | Insp. Meera Nair | `officer.safety@civictrack.org` | `Officer123!` | Public Safety & Vigilance |
| **Administrator** | Kavitha Ranganathan | `admin@civictrack.org` | `Admin123!` | Municipal supervisor (reviews, routing, audit logs) |

*Tip: Use the top "Switch Demo Role" buttons on the demo banner to switch between accounts without typing passwords.*

---

## 5. Feature Checklist & Implementation Status

### Citizen Experience
- [x] **Registration & Email Verification (FR-01):** Full name, email, 10-digit mobile (+91), password complexity, terms notice, and email verification link screen.
- [x] **Authentication (FR-02):** Email & password without role dropdown. Neutral error messages on invalid login without leaking email existence.
- [x] **Citizen Dashboard (FR-11):** Total filed, in-progress, action required, and 7-day review counters.
- [x] **Complaint Submission (FR-05, FR-06):** 10 categories, wards/zones, exact location, review step, and unique tracking ID generated **only after successful save**.
- [x] **Duplicate Warning (FR-24):** Checks category and location similarity; displays tracking ID and title of complainant's own reports, plus generic warning for other reports without revealing identities.
- [x] **7-Day Objection Window (FR-16):** Active after admin approves resolution report; formal objection reopens the case.
- [x] **Citizen Feedback (FR-17):** 1 to 5 star rating and optional comments. Stored separately and does not replace formal objections.
- [x] **Exceptional Handling:** Requests for late reopening (SRS 10.1), withdrawal (SRS 10.6), and information corrections (SRS 10.10).

### Officer Experience
- [x] **Officer Dashboard (FR-12):** Caseload metrics: assigned, pending acknowledgement, in progress, awaiting review, overdue.
- [x] **Assigned Complaints Table:** Search, status, priority, and overdue filtering with server-side pagination.
- [x] **Complaint Acknowledgement (FR-13):** Starts response target timers and moves status to Acknowledged.
- [x] **Progress Logging:** Choice between citizen-visible updates and internal notes (internal notes are strictly hidden from citizens).
- [x] **Information Requests (FR-13):** Prompts citizen for clarifications; dispatches in-app notification.
- [x] **Resolution Report Submission (FR-14):** Collects actions taken, outcome description, completion date, and **enforces at least 1 evidence attachment** before submission.
- [x] **Role Restrictions Enforced:** Officers cannot approve their own reports, cannot close complaints, and cannot delete history.

### Administrator Experience
- [x] **Overview & Analytics (FR-22):** Total grievances, unassigned queue count, resolution reviews count, and Recharts lifecycle breakdowns.
- [x] **Unassigned Queue (FR-09):** Queues complaints that could not be auto-routed; enables manual assignment preserving original response deadlines.
- [x] **Resolution Reviews (FR-15):** Inspects officer reports and evidence. Approve (starts 7-day citizen window) or Reject (mandatory reason; returns case to In Progress without notifying citizen per SRS v1.1 Revision Notes).
- [x] **Routing & Priority Corrections:** Modifies categories or priority tiers with mandatory justification reason.
- [x] **User & Officer Administration (FR-04):** Activates/deactivates accounts; manages officer availability status (`AVAILABLE`, `ON_LEAVE`, `BUSY`) and zone eligibility.
- [x] **Audit Trail (FR-25, FR-29):** Immutable, read-only audit log tracking timestamps, actors, actions, reasons, and state deltas.
- [x] **Configuration Settings (FR-26, FR-29):** Configures response targets, working hours calendar, upload limits, and records audited change reasons.
- [x] **PDF & XLSX Exports:** Disabled with label *"Export not yet connected"* until the backend export endpoints are connected.

---

## 6. Proposed REST API Contract (Spring Boot Integration)

All endpoints conform to `/api/v1` base URL:

### Auth & User Profile
- `POST /auth/register` — Body: `{ fullName, email, phone, password }`
- `POST /auth/login` — Body: `{ email, password }` → Returns: `{ token, user }`
- `POST /auth/logout` — Invalidate session
- `GET /auth/me` — Current authenticated user profile
- `POST /auth/verify-email` — Body: `{ token }`
- `POST /auth/resend-verification` — Body: `{ email }`
- `POST /auth/forgot-password` — Body: `{ email }`
- `POST /auth/reset-password` — Body: `{ token, newPassword }`

### Reference Data
- `GET /categories` — Active grievance categories
- `GET /wards` — Active wards and zones
- `GET /departments` — Active municipal departments

### Citizen Complaints
- `POST /complaints` — Header: `Idempotency-Key`. Body: `{ title, description, categoryId, wardZoneId, exactLocation, incidentDate, attachments }`
- `GET /complaints/mine` — Query: `search, status, category, priority, page, size` → Returns: `{ items, page, size, totalItems, totalPages }`
- `GET /complaints/{id}` — Complaint details, timeline, allowed actions, approved resolution report
- `POST /complaints/duplicate-check` — Body: `{ categoryId, wardZoneId, title }`
- `POST /complaints/{id}/info-responses` — Body: `{ response }`
- `POST /complaints/{id}/objections` — Body: `{ reason }`
- `POST /complaints/{id}/feedback` — Body: `{ rating, comment }`
- `POST /complaints/{id}/reopen-requests` — Body: `{ reason }`
- `POST /complaints/{id}/withdrawal-requests` — Body: `{ reason }`

### Officer Endpoints
- `GET /officer/complaints` — Query: `search, status, priority, overdueOnly, page, size`
- `POST /officer/complaints/{id}/acknowledge`
- `POST /officer/complaints/{id}/progress` — Body: `{ note, visibility: "CITIZEN_VISIBLE" | "INTERNAL_NOTE" }`
- `POST /officer/complaints/{id}/info-requests` — Body: `{ message }`
- `POST /officer/complaints/{id}/resolution-reports` — Body: `{ actionsTaken, outcomeDescription, completionDate, evidenceAttachments }`

### Administrator Endpoints
- `GET /admin/complaints` — Query: `search, status, priority, departmentId, wardZoneId, page, size`
- `GET /admin/complaints/unassigned` — Query: `page, size`
- `POST /admin/complaints/{id}/assign` — Body: `{ officerId, reason }`
- `PATCH /admin/complaints/{id}/correction` — Body: `{ newCategoryId, newPriority, reason }`
- `POST /admin/complaints/{id}/escalate` — Body: `{ reason }`
- `POST /admin/complaints/{id}/close` — Body: `{ reason }`
- `GET /admin/reviews` — Awaiting review complaints
- `POST /admin/reviews/{reportId}/approve` — Body: `{ reason }`
- `POST /admin/reviews/{reportId}/reject` — Body: `{ reason }` (Mandatory)
- `GET /admin/users` — User directory
- `PATCH /admin/users/{id}/status` — Body: `{ status, reason }`
- `GET /admin/officers` — Officer list
- `PATCH /admin/officers/{id}/availability` — Body: `{ availabilityStatus }`
- `GET /admin/audit-logs` — Read-only audit log entries
- `GET /admin/analytics/summary` — Overview metrics
- `GET /admin/analytics/trends` — Query: `granularity=day|week|month`

---

## 7. Backend Implementation & Architecture

The production-minded Spring Boot backend is fully implemented under `/backend`:

- **Framework:** Spring Boot 3.3.4 on Java 21 LTS
- **Database:** MySQL 8.x with Flyway schema migrations (`V1__init_schema.sql`, `V2__seed_reference_data.sql`)
- **Security:** Spring Security 6 with stateless JJWT 0.12.5 Bearer tokens and BCrypt password encryption
- **API Documentation:** OpenAPI 3.0 / Swagger UI (`/swagger-ui/index.html` and `/v3/api-docs`)
- **Actuator:** Production health checks at `/actuator/health` and `/actuator/info`
- **Port:** Spring Boot runs on port `8081`, reverse-proxied seamlessly through Vite on `/api/v1`

### Running the Full-Stack Application

1. **Start MySQL Database Server:**
   ```bash
   /etc/init.d/mysql start
   ```

2. **Run Spring Boot Backend Tests:**
   ```bash
   cd backend
   mvn test
   # 9/9 unit and integration tests passing:
   # - AuthServiceTest (login, password validation, duplicate email)
   # - AssignmentServiceTest (workload balancing, unassigned queue)
   # - ResolutionServiceTest (mandatory evidence, mandatory rejection reason, 7-day objection window)
   # - CivicConnectApplicationTests (Spring Boot context load)
   ```

3. **Launch Spring Boot Backend:**
   ```bash
   cd backend
   mvn package -DskipTests
   java -jar target/civicconnect-backend-1.0.0.jar --spring.profiles.active=local
   ```

4. **Run Frontend Dev Server (Port 3000):**
   ```bash
   npm run dev
   ```

---

## 8. College Viva & Examination Quick Reference

1. **How is automatic assignment handled?**
   - The system checks complaint category, finds the mapped department, looks up officers eligible for the ward, filters for active `AVAILABLE` status, and selects the officer with lowest active complaint count (`countByAssignedOfficerIdAndStatusNotIn`). If no officer is available, it routes to the Administrator Unassigned Queue (`ComplaintStatus.UNASSIGNED`) and alerts administrators.
2. **What is the difference between Feedback and Formal Objection?**
   - Star feedback (1-5 stars) is statistical satisfaction rating. A Formal Objection is a binding procedural action within 7 calendar days of resolution approval that immediately transitions the complaint to the **REOPENED** state with mandatory citizen reason.
3. **How does 7-day automatic closure work?**
   - When an administrator approves a resolution report, `objectionWindowEnd` is set to `Instant.now().plus(7, ChronoUnit.DAYS)`. A Spring `@Scheduled` background worker (`ScheduledWorkflowTasks.java`) detects complaints whose objection window has expired without an objection, automatically marks them `CLOSED`, logs an immutable audit event, and dispatches a closing notification to the citizen.
4. **Why are internal officer notes hidden from citizens?**
   - Officers frequently record technical contractor mix details, vendor logistics, or internal departmental coordination that should not clutter the public complaint narrative or leak internal operations. Field updates tagged with `INTERNAL_NOTE` are filtered out from citizen views.
5. **How is data integrity guaranteed?**
   - Optimistic locking via JPA `@Version` prevents lost updates during concurrent edits.
   - All state transitions record before/after status, actor role, timestamp, and justification reason in `complaint_status_history` and `audit_logs`.
   - Rejection of a resolution report strictly mandates an explanation reason (SRS FR-15).
