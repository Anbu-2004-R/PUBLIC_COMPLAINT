# Public Complaint Management System (CivicPulse / CivicTrack)

A full-stack, enterprise-grade civic grievance management platform connecting citizens, department officers, and municipal administrators for transparent case resolution, automated SLA tracking, and auditability.

**Baseline Document:** Project Analysis and Software Requirements Specification (SRS) Version 1.1.

---

## 1. System Architecture & Tech Stack

```
┌────────────────────────────────┐         REST / JSON          ┌───────────────────────────────────┐
│     Frontend (Port 3000)       │ ◄──────────────────────────► │     Backend (Port 8080)           │
│  React 19 • Vite 8 • Tailwind  │    Bearer JWT / Idempotency  │  Spring Boot 3.2 • Java 17        │
│  React Router 7 • Recharts     │                              │  Spring Security • Spring Data JPA│
└────────────────────────────────┘                              └─────────────────┬─────────────────┘
                                                                                  │
                                                                       Flyway /   │  JDBC / SQL
                                                                       Hibernate  │
                                                                                  ▼
                                                                ┌───────────────────────────────────┐
                                                                │        MySQL 8 Database           │
                                                                │  Users, Complaints, Reviews,      │
                                                                │  Audit Logs, SLA Timers, Mappings │
                                                                └───────────────────────────────────┘
```

### Frontend
- **Framework:** React 19 SPA with Vite 8 and TypeScript
- **Styling:** Tailwind CSS v4 (`@tailwindcss/vite`, `@import "tailwindcss";`)
- **Routing:** React Router v7 with role-based RouteGuards (`CITIZEN`, `OFFICER`, `ADMIN`)
- **Forms & Validation:** React Hook Form + Zod
- **Visual Analytics:** Recharts for departmental workload, lifecycle distribution, and trends
- **Icons:** Lucide React
- **Token Handling:** Secure in-memory token storage (never exposed in persistent `localStorage`)

### Backend
- **Framework:** Java 17 LTS, Spring Boot 3.2.5
- **Security:** Spring Security 6 with stateless JJWT (`io.jsonwebtoken 0.11.5`) and BCrypt password hashing
- **Data & Persistence:** Spring Data JPA / Hibernate, MySQL 8 connector
- **Database Migrations:** Flyway (`V1__init_schema.sql`, `V2__seed_reference_data.sql`)
- **Validation:** Spring Boot Starter Validation (`jakarta.validation`)
- **Email:** Spring Mail (`JavaMailSender`) with asynchronous dispatch and fallback logging
- **CORS:** Configurable allowed origins with credentials and header exposure

---

## 2. Repository Structure

```
├── .env.example                               # Frontend environment variables template
├── index.html                                 # Single-page HTML entry point
├── package.json                               # Frontend dependencies and scripts
├── render.yaml                                # Render Blueprint (Infrastructure-as-Code)
├── vite.config.ts                             # Vite configuration with /api backend proxy
├── src/                                       # Frontend React application
│   ├── app/                                   # Contexts (Auth, Notification, Theme, ErrorBoundary)
│   ├── components/                            # Reusable UI (Button, Input, Dialog, Shell, Badges)
│   ├── config/                                # Reference data, SLA definitions, workflow transitions
│   ├── features/                              # Role-based pages
│   │   ├── admin/                             # Overview, Unassigned Queue, Reviews, Users, Zones
│   │   ├── analytics/                         # Recharts dashboard & workload analytics
│   │   ├── auth/                              # Login, Register, Verify Email, Password Reset
│   │   ├── citizen/                           # Submit Complaint, My Complaints, Detail & Feedback
│   │   ├── notifications/                     # In-app notifications & email dispatch history
│   │   ├── officer/                           # Assigned Complaints, Investigations, Resolution Reports
│   │   └── profile/                           # User profile & contact management
│   ├── mocks/                                 # In-memory mock store (active during VITE_API_MODE=demo)
│   ├── services/                              # API client & domain services (Auth, Complaints, Admin)
│   ├── types/                                 # Domain models, enums, DTOs
│   └── utils/                                 # File validation (magic bytes, MIME), security, formatting
├── tests/                                     # Frontend Vitest test suite (21 unit tests)
└── backend/                                   # Spring Boot Java application
    ├── pom.xml                                # Maven build configuration
    ├── Dockerfile                             # Multi-stage production container build
    ├── .env.example                           # Backend environment variables template
    └── src/
        ├── main/
        │   ├── java/com/civicconnect/
        │   │   ├── CivicConnectApplication.java
        │   │   ├── analytics/                 # Metrics & charts aggregation endpoints
        │   │   ├── audit/                     # Immutable audit logging entity & endpoints
        │   │   ├── auth/                      # Login, Register, Tokens, Email, JWT
        │   │   ├── category/                  # Grievance category entities & controller
        │   │   ├── common/                    # ApiException, GlobalExceptionHandler, PaginatedResult
        │   │   ├── complaint/                 # Complaint lifecycle, auto-routing, SLA, reports
        │   │   ├── config/                    # SecurityConfig, JwtUtils, CorsConfig
        │   │   ├── department/                # Municipal department entities & controller
        │   │   ├── notification/              # In-app notifications repository & controller
        │   │   ├── user/                      # User entity, roles, availability, eligibility
        │   │   └── ward/                      # Ward zone entities & controller
        │   └── resources/
        │       ├── application.yml            # Main Spring configuration with env defaults
        │       ├── application-test.yml       # H2 configuration for automated tests
        │       └── db/migration/
        │           ├── V1__init_schema.sql    # DDL for all MySQL tables, indexes, and FKs
        │           └── V2__seed_reference_data.sql # Reference categories, wards, demo users
        └── test/
            └── java/com/civicconnect/
                └── CivicConnectApplicationTests.java # End-to-end Spring integration tests
```

---

## 3. Database Schema & Flyway Migrations

The database schema is versioned via Flyway under `backend/src/main/resources/db/migration/`:

1. **`V1__init_schema.sql`**:
   - `departments`: ID, name, unique code, description, head officer name, active status.
   - `ward_zones`: ID, name, unique code, zone quadrant, description, active status.
   - `categories`: ID, name, description, default priority, department foreign key.
   - `users`: ID, full name, unique email, phone, BCrypt password hash, role (`CITIZEN`, `OFFICER`, `ADMIN`), email verification status, account status, employee ID, department ID, availability status (`AVAILABLE`, `ON_LEAVE`, `BUSY`).
   - `officer_eligible_categories`: Many-to-many junction between officers and categories.
   - `officer_eligible_zones`: Many-to-many junction between officers and ward zones.
   - `email_verification_tokens`: Expiring single-use verification tokens.
   - `password_reset_tokens`: Expiring single-use password reset tokens.
   - `complaints`: Comprehensive complaint master table (tracking ID `CP-2026-XXXX`, citizen FK, category FK, department FK, ward FK, location, priority, status, assigned officer FK, SLA deadlines `ackDeadline` & `actionDeadline`, timestamps).
   - `complaint_attachments`: Metadata for uploaded evidence photos/documents.
   - `complaint_status_history`: Immutable transition log with actor ID, role, old status, new status, timestamp, and justification reason.
   - `complaint_progress_updates`: Investigation updates (with `CITIZEN_VISIBLE` or `INTERNAL_NOTE` visibility).
   - `citizen_info_requests`: Formal inquiries from officer to citizen and responses.
   - `resolution_reports`: Formal resolution report (actions taken, outcome, date, admin approval/rejection state).
   - `complaint_feedback`: Citizen star ratings (1–5) and remarks.
   - `notifications`: In-app notification inbox with email delivery tracking status.
   - `audit_logs`: System-wide audit events with before/after state snapshots.

2. **`V2__seed_reference_data.sql`**:
   - Seeds 9 standard municipal departments (PWD, Water Board, Sanitation, Electricity, Safety, Parks, etc.).
   - Seeds 8 urban ward zones (Gandhi Nagar, Malleshwaram, Shivaji Commercial, etc.).
   - Seeds 10 core complaint categories.
   - Seeds initial active accounts: Administrator (`admin@civicpulse.org`), PWD Officer (`officer.pwd@civicpulse.org`), Water Board Officer (`officer.water@civicpulse.org`), and Citizen (`citizen.priya@gmail.com`).

---

## 4. Local Development Guide

### 4.1 Prerequisites
- **Node.js:** 20+ LTS or 22
- **Java:** JDK 17+
- **Maven:** 3.8+
- **MySQL:** 8.0+ (or use H2 profile for testing)

### 4.2 Start Backend
```bash
cd backend

# Option A: Run automated integration tests (using embedded H2)
mvn test

# Option B: Run locally against MySQL
# Ensure MySQL database 'civicpulse_db' exists on localhost:3306
mvn spring-boot:run
```
The Spring Boot backend will start on `http://localhost:8080/api/v1`.

### 4.3 Start Frontend
```bash
# In project root
npm install

# Start Vite dev server (Port 3000)
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 5. Dual-Mode Operation (`VITE_API_MODE`)

The application supports seamless toggling between Demo and Real Backend modes:

1. **Demo Mode (`VITE_API_MODE=demo`):**
   - Ideal for immediate testing, UI review, or local previews without running MySQL.
   - Uses `src/mocks/mockStore.ts` with auto-routing, SLA timers, and preset accounts.
   - Displays the amber Demo Mode banner with quick account switcher.

2. **Real Mode (`VITE_API_MODE=real`):**
   - Connects to the live Spring Boot REST API (`VITE_API_BASE_URL`).
   - Persists all accounts, complaints, resolution reports, and audit logs permanently in MySQL.
   - In real mode, errors from the backend are rendered directly; mock data is never silently substituted.

Configure in `.env`:
```env
VITE_API_MODE=real
VITE_API_BASE_URL=/api/v1
VITE_PHONE_DEFAULT_PREFIX=+91
```

---

## 6. REST API Specification

Base Path: `/api/v1`

### Authentication & Account
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register new Citizen account |
| POST | `/auth/login` | Public | Authenticate and obtain JWT Bearer token |
| POST | `/auth/verify-email` | Public | Verify email with single-use token |
| POST | `/auth/resend-verification` | Public | Dispatch fresh verification token |
| POST | `/auth/forgot-password` | Public | Send password reset link |
| POST | `/auth/reset-password` | Public | Reset password using reset token |
| GET | `/auth/me` | Authenticated | Retrieve current session profile |
| POST | `/auth/logout` | Authenticated | Clear user session |

### Reference Data
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/categories` | Public | List grievance categories |
| GET | `/admin/departments` | Authenticated | List municipal departments |
| POST | `/admin/departments` | ADMIN | Create or update department |
| GET | `/admin/zones` | Authenticated | List municipal ward zones |
| POST | `/admin/zones` | ADMIN | Create or update ward zone |

### Citizen Workflows
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/complaints/mine` | CITIZEN | Paginated complaints filed by current citizen |
| POST | `/complaints` | CITIZEN | File new grievance with `Idempotency-Key` |
| GET | `/complaints/{id}` | Owner/Officer/Admin | View grievance details and history |
| POST | `/complaints/duplicate-check` | CITIZEN | Check for similar existing issues |
| POST | `/complaints/{id}/info-responses` | CITIZEN | Respond to officer clarification request |
| POST | `/complaints/{id}/objections` | CITIZEN | Lodge objection during 7-day review window |
| POST | `/complaints/{id}/feedback` | CITIZEN | Submit satisfaction rating (1-5) and remarks |
| POST | `/complaints/{id}/reopen-requests`| CITIZEN | Request reopening of closed complaint |
| POST | `/complaints/{id}/withdrawal-requests`| CITIZEN | Request voluntary complaint withdrawal |

### Officer Workflows
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/officer/complaints` | OFFICER | List complaints assigned to officer |
| POST | `/officer/complaints/{id}/acknowledge` | OFFICER | Acknowledge receipt and start action SLA |
| POST | `/officer/complaints/{id}/progress` | OFFICER | Log progress note (Citizen-visible or Internal) |
| POST | `/officer/complaints/{id}/info-requests` | OFFICER | Request clarification from citizen |
| POST | `/officer/complaints/{id}/resolution-reports`| OFFICER | Submit formal report with mandatory evidence |

### Administrator Workflows
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/complaints` | ADMIN | System-wide complaints management |
| GET | `/admin/complaints/unassigned` | ADMIN | Unassigned queue requiring officer assignment |
| POST | `/admin/complaints/{id}/assign` | ADMIN | Assign officer with mandatory justification |
| PATCH | `/admin/complaints/{id}/correction`| ADMIN | Re-categorize or adjust priority with reason |
| POST | `/admin/complaints/{id}/escalate`| ADMIN | Escalate complaint |
| POST | `/admin/complaints/{id}/close` | ADMIN | Administrative closure with recorded reason |
| GET | `/admin/reviews` | ADMIN | Pending resolution reports awaiting approval |
| POST | `/admin/reviews/{reportId}/approve` | ADMIN | Approve resolution (starts 7-day objection window) |
| POST | `/admin/reviews/{reportId}/reject` | ADMIN | Reject resolution (mandatory reason; returns to In Progress) |
| GET | `/admin/users` | ADMIN | Directory of registered users and citizens |
| PATCH | `/admin/users/{userId}/status` | ADMIN | Activate or deactivate user account |
| GET | `/admin/officers` | ADMIN | Officer directory with caseload and availability |
| PUT | `/admin/officers/{officerId}/eligibility` | ADMIN | Update category and ward eligibility |
| PATCH | `/admin/officers/{officerId}/availability` | ADMIN | Update availability (`AVAILABLE`, `ON_LEAVE`, `BUSY`) |
| GET | `/admin/audit-logs` | ADMIN | Immutable, tamper-evident audit log trail |
| GET | `/admin/analytics/summary` | ADMIN | KPI metrics (compliance rate, avg ack time, etc.) |
| GET | `/admin/analytics/status-distribution` | ADMIN | Complaint status distribution for Recharts |
| GET | `/admin/analytics/department-workload` | ADMIN | Active vs resolved workload by department |
| GET | `/admin/analytics/trends` | ADMIN | 7-day intake and resolution trends |

---

## 7. Production Deployment on Render

This repository contains `render.yaml` ready for one-click Render Blueprint deployment.

### 7.1 Services Setup

#### Service 1: MySQL Database
Provision a managed MySQL database (e.g. Render Managed Database, PlanetScale, Aiven, or AWS RDS).
- **Required Variables:**
  - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:3306/<dbname>?useSSL=true&allowPublicKeyRetrieval=true&serverTimezone=UTC`
  - `SPRING_DATASOURCE_USERNAME`: `<db-user>`
  - `SPRING_DATASOURCE_PASSWORD`: `<db-password>`

#### Service 2: Backend Web Service (Render Java Service)
- **Runtime:** Java
- **Root Directory:** `backend`
- **Build Command:** `mvn clean package -DskipTests`
- **Start Command:** `java -jar target/civicconnect-backend-1.0.0.jar`
- **Health Check Path:** `/api/v1/categories`
- **Environment Variables:**
  | Variable | Value / Description |
  |---|---|
  | `PORT` | `8080` (or Render assigned port) |
  | `SPRING_PROFILES_ACTIVE` | `prod` |
  | `SPRING_DATASOURCE_URL` | MySQL JDBC URL |
  | `SPRING_DATASOURCE_USERNAME` | MySQL Username |
  | `SPRING_DATASOURCE_PASSWORD` | MySQL Password |
  | `JWT_SECRET` | 64+ char random hex string |
  | `CORS_ALLOWED_ORIGINS` | Deployed frontend URL (e.g., `https://civicpulse-frontend.onrender.com`) |
  | `CLIENT_BASE_URL` | Deployed frontend URL |
  | `SPRING_MAIL_HOST` | `smtp.gmail.com` (or SendGrid/Mailgun SMTP host) |
  | `SPRING_MAIL_PORT` | `587` |
  | `SPRING_MAIL_USERNAME` | SMTP account email |
  | `SPRING_MAIL_PASSWORD` | SMTP app password |

#### Service 3: Frontend Static Site (Render Static Site)
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Redirect / Rewrite Rule:** `/*` -> `/index.html` (200 Rewrite for SPA routing)
- **Environment Variables:**
  | Variable | Value |
  |---|---|
  | `VITE_API_MODE` | `real` |
  | `VITE_API_BASE_URL` | `https://civicpulse-backend.onrender.com/api/v1` |
  | `VITE_PHONE_DEFAULT_PREFIX` | `+91` |

---

## 8. Verification & Test Execution

### Backend Tests
```bash
cd backend
mvn test
```
- Tests database initialization with H2
- Tests citizen registration, unique constraints, and password hashing
- Tests complaint submission, SLA deadline calculation, auto-routing to eligible officers
- Tests officer acknowledgement, progress logging, and resolution report submission

### Frontend Tests
```bash
npm run test
```
- 21 Vitest tests verifying:
  - Role-based workflow state transitions (`workflow.test.ts`)
  - Form validation rules (`forms.test.ts`)
  - Authentication state handling (`auth.test.ts`)
  - File upload restrictions, magic byte validation, and MIME checks (`fileValidation.test.ts`)

---

## 9. Security & Compliance Safeguards

- **No Plaintext Passwords:** Passwords hashed with salted BCrypt before persistence.
- **Strict Role Verification:** Backend independently verifies role authorization on every REST request via JWT claims; client-provided roles are never trusted.
- **Immutable Audit Logging:** Key operations (status changes, eligibility changes, report reviews) automatically write to `audit_logs` with before and after state snapshots.
- **Separation of Concerns:** Resolution report rejections are private between administrator and department officer; citizens are not notified of intermediate internal rejections (SRS v1.1).
