---
title: "Public Complaint System"
subtitle: "Project Analysis and Software Requirements Specification (SRS)"
---

**Document Version:** 1.1 (reviewed and corrected)\
**Document Status:** Requirements baseline, for team review before system design and development\
**Project Type:** Responsive web application\
**Frontend:** React.js + Tailwind CSS\
**Backend:** Java Spring Boot + Spring Security\
**Database:** MySQL + Spring Data JPA/Hibernate\
**Development Tools:** VS Code, Git and GitHub\

# Revision Notes (Version 1.1)

| Section | Change |
|---|---|
| 7.2 Status Definitions | Renamed "Rejected with Reason" to "Resolution Report Rejected". A rejected report returns the complaint to In Progress, so the old name implied the complaint was closed. |
| 9.2 Citizen Notifications | Removed citizen notifications for report rejection. Rejections happen between the officer and administrator and are not shown to citizens. |
| 4 FR-26 and FR-29 | Merged the duplicated configuration requirements into FR-26. FR-29 now covers only the audit requirement for configuration changes. |
| 7.2 Status Definitions | Clarified that Escalated may be a status or a flag, and that every status transition is validated. |

---

# 1. INTRODUCTION

## 1.1 Project Overview

The Public Complaint System is a web-based application designed to help citizens report problems related to public services and infrastructure. It provides a centralized platform for submitting complaints, tracking their progress, communicating with responsible departments, and receiving resolution updates.

The system provides three main roles:

1. Citizen / Public User
2. Department Officer
3. Administrator

Citizens can submit complaints and monitor their status. Department officers investigate assigned complaints, record progress, and submit resolution reports with supporting evidence. Administrators manage the overall system, assign complaints, supervise departmental work, review resolution reports, handle exceptional cases, and generate reports.

The application emphasizes transparency, accountability, traceability, and controlled complaint resolution.

## 1.2 Background

In a manual complaint-handling process, citizens may need to visit offices, make phone calls, or contact departments repeatedly to understand what happened to their complaints. Records may be scattered across different channels, and it may be difficult to identify responsible staff, monitor deadlines, or understand why a complaint has been delayed.

The proposed system centralizes complaint information and provides a structured workflow from submission to administrative closure.

## 1.3 Problem Statement

The absence of a centralized complaint-management process can lead to:

- Difficulty submitting and tracking complaints.
- Unclear responsibility for handling complaints.
- Delays in assigning complaints to appropriate departments.
- Limited visibility into complaint progress.
- Difficulty identifying overdue and high-priority cases.
- Insufficient documentation of resolution decisions.
- Lack of reliable records for reviewing departmental performance.

The Public Complaint System aims to address these problems through digital complaint submission, automatic assignment, status tracking, notifications, evidence-based resolution review, and administrative reporting.

## 1.4 Objectives

The main objectives are:

1. Provide an accessible online platform for citizens to submit complaints.
2. Generate a unique tracking ID for every successfully submitted complaint.
3. Automatically route complaints to eligible officers using category, location, availability, and workload.
4. Allow citizens to monitor the status and progress of their own complaints.
5. Help officers investigate complaints and document actions taken.
6. Require administrator review of every resolution report.
7. Allow citizens to object to a resolution within a defined seven-day period.
8. Notify citizens, officers, and administrators about important events.
9. Monitor response targets, overdue cases, and escalation events.
10. Maintain a complete history of complaint handling and administrative decisions.
11. Provide administrators with analytics and PDF/Excel reports.
12. Protect user information and enforce role-based permissions.

## 1.5 Expected Outcomes

The completed system should provide:

- Easier complaint submission and tracking.
- Clear responsibility for each assigned complaint.
- Better visibility into pending and overdue work.
- Documented investigation and resolution decisions.
- More consistent communication between citizens and responsible departments.
- Historical records for accountability and reporting.

---

# 2. SCOPE OF THE PROJECT

## 2.1 Features Included in the First Release

The first release will include:

- User registration and email verification.
- Login, logout, and password reset.
- Role-based access control.
- Citizen profile management.
- Complaint submission and tracking.
- Complaint categories and priority levels.
- Ward/zone-based routing.
- Automatic assignment to eligible officers.
- Administrator-managed unassigned complaint queue.
- Officer dashboards and investigation updates.
- Resolution reports with supporting evidence.
- Mandatory administrator review of resolution reports.
- Citizen objections and reopening rules.
- Feedback ratings.
- In-app and email notifications.
- Deadline monitoring and escalation.
- Complaint search and filtering.
- Related and duplicate complaint handling.
- User and department management.
- Analytics and reports.
- PDF and Excel exports.
- Audit logs.
- Secure attachment storage.
- Database backups and recovery testing.

## 2.2 Features Outside the First Release

The following are not required for the initial version:

- Native Android and iOS applications.
- SMS or WhatsApp notifications.
- Public browsing of individual complaints.
- Automatic AI approval of complaint resolutions.
- Microservices and Kubernetes deployment.
- Guaranteed integration with government identity systems.
- Guaranteed integration with external GIS or official government databases.

These may be considered as future enhancements if time, resources, and project requirements permit.

## 2.3 Scope Boundaries

The system coordinates complaint reporting and administrative handling. It does not itself repair infrastructure, guarantee department staffing, or independently certify that a real-world problem has been fixed.

An approved resolution report means the administrator approved the submitted report under the system's rules. It does not automatically prove that the physical issue has been independently verified.

---

# 3. STAKEHOLDERS AND USER ROLES

The system has exactly three main roles.

## 3.1 Citizen / Public User

A citizen is a registered user who submits and tracks complaints.

### Responsibilities and permissions

- Register and verify an email address.
- Log in and manage permitted profile details.
- Submit new complaints.
- Upload optional supporting evidence.
- View personal complaint history.
- Track complaint status and progress.
- View relevant department and assignment information.
- Respond to requests for additional information.
- View approved resolution reports and appropriate evidence.
- Object to a resolution within seven days.
- Give a feedback rating and optional comment.
- Request reopening after the objection window.
- Request withdrawal of a complaint.
- Request correction of submitted information.
- Receive notifications.

### Restrictions

- Citizens cannot view other citizens' private complaints.
- Citizens cannot directly change official complaint status.
- Citizens cannot assign complaints to officers.
- Citizens cannot approve resolution reports.
- Citizens cannot modify audit logs.

## 3.2 Department Officer

A department officer investigates complaints assigned to them.

### Responsibilities and permissions

- Log in and view assigned complaints.
- Acknowledge assigned work.
- Review complaint descriptions and relevant attachments.
- Investigate reported issues.
- Update investigation progress.
- Request additional information from citizens.
- Record delays or investigation obstacles.
- Submit resolution reports with required evidence.
- Respond to rejected resolution reports.
- View relevant assignment and status history.

### Restrictions

- Officers can access only complaints assigned to them, subject to authorized administrative controls.
- Officers cannot approve their own resolution reports.
- Officers cannot directly mark a complaint as finally resolved or closed.
- Officers cannot delete complaint records or audit history.
- Officers cannot independently change routing or assign cases to themselves without authorization.
- Officers cannot view unnecessary citizen information or confidential records unrelated to their work.

## 3.3 Administrator

The administrator manages and supervises the complete system.

### Responsibilities and permissions

- View all complaints and their histories.
- Manage citizen and officer accounts.
- Create and deactivate officer accounts.
- Manage departments, categories, wards, and zones.
- Configure category-to-department mappings.
- Configure ward/zone-to-service mappings.
- Configure officer eligibility and availability.
- Review automatic assignments and unassigned complaints.
- Assign and reassign complaints.
- Correct category, priority, and routing errors.
- Review every submitted resolution report.
- Approve or reject resolution reports with recorded decisions.
- Handle citizen objections and exceptional cases.
- Approve or reject late reopening and withdrawal requests.
- Approve deadline pauses.
- Monitor critical, overdue, and escalated complaints.
- View audit logs.
- Generate analytics and reports.
- Export reports as PDF and Excel.
- Configure working calendars, response targets, and notification settings.

### Administrative accountability

Important administrative actions must be recorded with the actor, timestamp, reason where applicable, and relevant before-and-after values. Administrators can review audit history but cannot silently rewrite it.

---

# 4. FUNCTIONAL REQUIREMENTS

The following requirements describe the expected behavior of the application.

## FR-01: User Registration

The system shall allow public users to register by providing:

- Full name.
- Email address.
- Phone number.
- Password.

The system shall validate the entered information and prevent duplicate accounts according to the configured uniqueness rules.

The user must verify their email before the account becomes active for normal use.

Email verification proves access to the email address; it does not prove the person's real-world identity.

## FR-02: Authentication and Password Management

The system shall provide:

- Login and logout.
- Secure password storage using an appropriate password-hashing algorithm.
- Password reset through a verified email address.
- Protection against repeated failed login attempts.
- Secure session management.
- Role-based authorization.

Administrators must never be able to view users' original passwords.

## FR-03: Role-Based Access Control

The system shall enforce different permissions for citizens, officers, and administrators.

Authorization must be checked by the backend for every protected request. Hiding a button in the frontend is not sufficient security.

## FR-04: User Profile and Account Management

Citizens may view and update permitted profile information, such as their name and phone number. Email changes require verification.

Administrators may create and manage officer profiles, departments, eligible categories, service areas, and availability.

Deactivating an account disables login but does not automatically erase its complaint history.

## FR-05: Complaint Submission

The complaint form shall contain the following fields.

| Field | Requirement |
|---|---|
| Category | Required |
| Short title | Required |
| Detailed description | Required |
| Ward/zone | Required |
| Exact location, address, or landmark | Required |
| Map pin | Optional |
| Date the issue occurred | Optional |
| Initial evidence | Optional |

The form shall validate required fields and display understandable error messages.

Only authenticated citizens can submit complaints.

## FR-06: Complaint ID Generation

Every successfully saved complaint shall receive a unique tracking ID.

The system must not show a success message or issue a complaint ID before the complaint has been successfully saved.

If submission fails or the result is uncertain, the system shall provide a safe retry or status-check mechanism to reduce duplicate complaints.

## FR-07: Complaint Categories

The system shall initially support these ten categories:

1. Roads and Infrastructure
2. Water Supply and Drainage
3. Sanitation and Waste
4. Streetlights and Electricity
5. Public Safety
6. Parks and Public Spaces
7. Public Transport
8. Noise and Environmental Issues
9. Government Services
10. Other

Administrators can maintain the category list and related routing configuration without changing application code.

## FR-08: Complaint Priority

The system shall support four priority levels.

| Priority | Meaning |
|---|---|
| Critical | Immediate danger or severe public hazard |
| High | Serious issue requiring urgent attention |
| Medium | Routine issue requiring timely action |
| Low | Minor issue with limited immediate impact |

Citizens may indicate perceived urgency, but the system's rules and authorized staff determine the operational priority.

Changes to category or priority must be recorded with a reason and history entry.

## FR-09: Automatic Complaint Assignment

The system shall route complaints using:

- Complaint category.
- Category-to-department mapping.
- Ward/zone-to-service mapping.
- Officer eligibility.
- Officer availability.
- Active officer workload.

Among eligible and available officers, the system shall select the officer with the fewest active complaints.

If several eligible officers have the same workload, a consistent rotating tie-breaker shall be used.

If no eligible officer is available or routing is unclear, the complaint shall enter the administrator's **Unassigned Queue**, and the administrator shall be notified.

## FR-10: Manual Assignment and Reassignment

Administrators may assign or reassign complaints when necessary.

The system shall preserve the previous assignment, record the reason and timestamp, and notify relevant people.

Reassignment shall not automatically reset an existing response deadline.

## FR-11: Citizen Dashboard

The citizen dashboard shall display:

- Complaint ID.
- Title and category.
- Ward/zone and location.
- Priority and current status.
- Responsible department.
- Submission and latest-update times.
- Complaint timeline.
- Appropriate progress updates.
- Approved resolution report and permitted evidence.
- Notifications and required actions.

Citizens shall only see their own complaints.

## FR-12: Officer Dashboard

The officer dashboard shall display:

- Assigned complaints.
- Pending complaints.
- Overdue complaints.
- Resolution reports awaiting administrator review.
- Complaint ID, title, category, ward/zone, priority, status, and deadline.

Officers shall be able to search and filter assigned complaints by status, priority, category, and deadline.

## FR-13: Investigation and Progress Updates

Officers shall be able to acknowledge complaints, record investigation progress, and request additional information from citizens.

Citizen-visible updates must be separated from confidential internal notes.

A request for information must explain what is required. The citizen shall receive a notification.

## FR-14: Resolution Report Submission

An officer must provide the following before submitting a resolution report:

- Resolution description.
- Action taken.
- Completion date.
- At least one appropriate evidence attachment.

Supporting evidence may include a photograph, document, inspection record, service record, or other suitable evidence.

The system shall record the submitting officer and submission timestamp.

## FR-15: Administrator Resolution Review

Every submitted resolution report must be reviewed by an authorized administrator.

The administrator can:

- Approve the report.
- Reject the report with a reason.

If rejected, the report returns to the officer for further work, and the complaint remains open (In Progress).

An officer cannot approve their own report.

An approved report moves the complaint to **Resolved — Awaiting Citizen Feedback** and starts the citizen notification and objection process.

## FR-16: Citizen Objection and Automatic Closure

The citizen has seven days to object after being notified that the administrator approved the resolution report.

- If the citizen objects within seven days, the complaint reopens.
- If no objection is received, the system automatically closes the complaint after the window ends.
- All relevant timestamps and events must be recorded.
- The officer and administrator must be notified when a complaint reopens.

A low rating is feedback and is not equivalent to a formal objection.

## FR-17: Feedback

After the resolution is approved, the citizen may submit:

- A rating from 1 to 5 stars.
- An optional comment.

Feedback shall be stored separately from the formal objection process. A rating must not prevent the citizen from objecting within the seven-day period.

## FR-18: Exceptional Complaint Handling

The system shall support:

- Late reopening requests.
- Withdrawal requests.
- Blocked investigations.
- Citizen non-response.
- Incorrect department or ward/zone routing.
- Multiple reports about the same public issue.
- Officer unavailability.
- Citizen account deactivation.
- Post-submission correction requests.
- Failed or uncertain submissions.
- Out-of-scope complaints.

The rules for these situations are specified in Section 10.

## FR-19: Notifications

The system shall provide in-app and email notifications.

Citizens receive notifications about submission, assignment, progress, requests for information, resolution decisions, objection deadlines, reopening, and closure.

Officers receive notifications about assignment, reassignment, priority changes, citizen replies, deadlines, resolution decisions, and reopened complaints.

Administrators receive notifications about critical complaints, routing failures, overdue cases, pending resolution reviews, objections, and important system alerts.

The system shall maintain notification history, read/unread state for in-app notifications, and email delivery-attempt records.

## FR-20: Deadlines and Escalation

The system shall monitor configured response targets.

It shall send reminders before deadlines, mark missed targets as overdue, and notify the responsible officer and administrator.

Administrators may review delays, contact officers, or reassign complaints.

Deadline events, pauses, reminders, escalation actions, and recorded reasons must be auditable.

## FR-21: Search and Filtering

Citizens can search and filter their own complaints.

Officers can search and filter their assigned complaints.

Administrators can search authorized system-wide records using fields such as complaint ID, title, department, officer, ward/zone, category, priority, status, and date range.

Search must never bypass role-based access restrictions.

## FR-22: Analytics and Reporting

The system shall provide analytics for:

- Total complaints.
- Pending, in-progress, reopened, and closed complaints.
- Overdue and critical complaints.
- Complaint volume by department, category, priority, and ward/zone.
- Response-target compliance.
- Acknowledgement and action-start times.
- Workload and unassigned cases.
- Feedback and related-complaint trends.

Authorized administrators shall be able to export filtered reports as PDF and Excel (XLSX).

## FR-23: File Upload and Evidence Management

The system shall accept only JPG, PNG, and PDF files.

Limits:

- Maximum 10 MB per file.
- Maximum 5 files per upload stage.
- Initial complaint evidence is optional.
- At least one suitable evidence attachment is required for a resolution report.

The backend shall validate file type and size, store files securely, enforce download permissions, and preserve attachment metadata and history.

## FR-24: Duplicate and Spam Prevention

The system shall identify possible duplicate complaints using category, location, and description.

It may warn the citizen and allow the complaint to be linked to an existing related case where appropriate.

The system shall not expose another complainant's identity or private details in duplicate suggestions.

Suspicious submissions may be rate-limited or flagged for authorized review. Similarity alone shall not automatically prove spam or cause a complaint to be deleted.

## FR-25: Audit Logs

The system shall record important actions, including:

- Complaint creation.
- Status changes.
- Assignment and reassignment.
- Category and priority corrections.
- Deadline pause requests and decisions.
- Resolution report submissions and reviews.
- Objections, reopening, and withdrawal decisions.
- Account and role changes.
- Configuration changes.
- Backup and restoration activities.

Audit records shall identify the actor, timestamp, action, reason where applicable, and relevant before-and-after values.

Ordinary users and officers cannot modify or delete audit history. Administrators may view it but cannot silently rewrite it.

## FR-26: Department and Service Configuration

Administrators shall be able to configure, without changing application code:

- Departments.
- Wards and zones.
- Complaint categories.
- Category-to-department mappings.
- Ward/zone-to-service mappings.
- Officer eligibility.
- Officer availability.
- Working calendars.
- Response targets and escalation settings.
- Notification templates.

## FR-27: Backup and Recovery

The system shall perform automated daily database backups and maintain protected backups of evidence files.

Backups shall be encrypted, access-controlled, monitored for failure, and periodically tested through restoration.

Recovery procedures shall aim to restore complaint records, assignments, histories, decisions, and evidence consistently.

## FR-28: Responsive Interface

The application shall work on supported desktop, laptop, tablet, and mobile browsers.

The interface shall provide clear navigation, readable text, labelled forms, keyboard accessibility, understandable errors, and responsive layouts.

## FR-29: Configuration Change Auditing

Every configuration change covered by FR-26, including working calendars, response targets, notification templates, and escalation settings, shall be recorded in the audit log with the actor, timestamp, reason, and before-and-after values.

## FR-30: Testing and Acceptance

The project shall have documented tests for core workflows, permissions, deadlines, attachments, notifications, reporting, failure handling, and recovery.

A feature shall not be considered successfully tested until the relevant tests have actually passed.

---

# 5. NON-FUNCTIONAL REQUIREMENTS

Non-functional requirements describe the quality and operational expectations of the system.

## 5.1 Security

- Use Spring Security and secure password hashing.
- Enforce backend authorization.
- Protect sessions and password-reset flows.
- Validate all inputs.
- Prevent unauthorized complaint and attachment access.
- Do not expose credentials or sensitive information in application logs.

## 5.2 Privacy

- Complaint records are private by default.
- Citizens can access only their own cases.
- Officers can access only the cases assigned to them.
- Personal information must be limited to what is needed for complaint handling.
- Notifications must avoid unnecessary sensitive details.

## 5.3 Performance

Common operations such as opening dashboards, viewing complaint details, and searching should feel responsive under expected project usage.

Measurable response-time and concurrent-user targets must be agreed upon and tested before deployment.

## 5.4 Reliability

The system must handle database, email, and storage failures safely.

It must not falsely confirm a complaint submission when the data has not been saved successfully.

Retry mechanisms should avoid duplicate submissions and duplicate notifications.

## 5.5 Data Integrity

The application shall use relational constraints, transactions, and validated status transitions.

Important corrections and decisions must preserve history rather than silently overwriting previous values.

## 5.6 Usability

The application should have clear labels, consistent navigation, understandable status explanations, helpful validation messages, and accessible layouts.

## 5.7 Maintainability

The codebase shall use modular React components and a structured Spring Boot backend.

Business logic should be separated from controllers, and configuration should be maintained outside hard-coded application rules where appropriate.

## 5.8 Compatibility

The system shall be tested on selected current desktop and mobile browsers. The final project documentation shall identify the browsers used for testing.

## 5.9 Backup and Recovery

Daily database backup, evidence protection, encryption, restricted access, restoration testing, and documented recovery steps are required.

## 5.10 Accessibility

Forms must have labels, interactive elements must support keyboard navigation, and status or priority must not be communicated through color alone.

---

# 6. COMPLAINT CATEGORIES, PRIORITIES AND RESPONSE TARGETS

## 6.1 Priority Definitions

| Priority | Description |
|---|---|
| Critical | Immediate danger or severe public hazard |
| High | Serious issue requiring urgent attention |
| Medium | Routine issue requiring timely action |
| Low | Minor issue with limited immediate impact |

Critical complaints require immediate administrative visibility and 24/7 alert handling.

## 6.2 Initial Response Targets

The following are proposed project targets, not claims about official government service standards.

| Priority | Acknowledge | Begin assessment/action |
|---|---|---|
| Critical | Within 15 minutes | Begin urgent assessment within 1 hour |
| High | Within 4 working hours | Within 1 working day |
| Medium | Within 1 working day | Within 3 working days |
| Low | Within 3 working days | Within 7 working days |

High, Medium, and Low use configured working hours. Critical uses a 24/7 clock.

These are response targets, not promises that the physical problem will be resolved within the same period.

The application must use a configured time zone and working calendar. Holidays, non-working days, and deadline calculations must be defined before implementation.

## 6.3 Deadline and Escalation Rules

1. Start the applicable target clock at the configured complaint event.
2. Send reminders before a deadline.
3. Mark a missed target as overdue.
4. Notify the responsible officer and administrator.
5. Allow the administrator to review delays and reassign when necessary.
6. Preserve the original deadline and assignment history.
7. Do not automatically reset deadlines when a complaint is reassigned.
8. Pause a deadline only after authorized administrator approval.
9. Record pause reason, approver, pause start, and resume time.
10. Continue Critical safety alerts even when an investigation is blocked.

The exact event that starts each acknowledgement and action-start clock must be documented in the detailed workflow design.

---

# 7. COMPLAINT WORKFLOW

## 7.1 Standard Workflow

**Step 1: Submission.** The citizen logs in, fills out the complaint form, and submits it. The system validates and saves the complaint, generates a tracking ID, and records the initial status.

**Step 2: Automatic Assignment.** The system checks category, department mapping, ward/zone, officer eligibility, availability, and workload. If a suitable officer is available, the complaint is assigned. Otherwise, it enters the administrator's Unassigned Queue.

**Step 3: Acknowledgement.** The assigned officer acknowledges the complaint and begins investigation according to its priority and response target.

**Step 4: Investigation.** The officer examines the issue, records progress, and requests further information if needed.

**Step 5: Resolution Report.** The officer submits the action taken, resolution description, completion date, and supporting evidence.

**Step 6: Administrator Review.** The administrator reviews the report and evidence.

- If rejected, the report returns to the officer with a reason, and the complaint returns to In Progress.
- If approved, the complaint moves to Resolved — Awaiting Citizen Feedback.

**Step 7: Citizen Notification.** The citizen is notified of the approved resolution. The seven-day objection period begins at the recorded notification time.

**Step 8: Final Outcome.**

- If the citizen objects within seven days, the complaint reopens.
- If no objection is received within seven days, the system automatically closes the complaint.

## 7.2 Status Definitions

| Status | Meaning |
|---|---|
| Submitted | Complaint successfully received |
| Unassigned | No eligible officer found or routing requires administrative review |
| Assigned | Responsible officer selected |
| Acknowledged | Officer has acknowledged the complaint |
| In Progress | Investigation or corrective work is underway |
| Awaiting Citizen Information | Additional information is requested |
| Resolution Report Submitted / Awaiting Review | Officer has submitted a report for administrator review |
| Resolution Report Rejected | Administrator rejected the submitted report with a reason; the complaint returns to In Progress for further work |
| Resolved — Awaiting Citizen Feedback | Administrator approved the resolution report; objection window is active |
| Reopened | Citizen objected within the permitted period or an authorized reopening decision was made |
| Escalated | Complaint requires additional administrative attention |
| Closed | Complaint reached the configured administrative closure point |
| Withdrawal Request Pending | Citizen requested withdrawal and a decision is pending |
| Withdrawn | An authorized withdrawal decision was approved |

The final implementation should use consistent internal status codes and validate every status transition. Escalation may be implemented as a separate status or a flag, provided its behavior remains clear and consistent.

---

# 8. AUTOMATIC ASSIGNMENT DESIGN

## 8.1 Required Configuration

Administrators maintain:

- Category-to-department mappings.
- Ward/zone-to-service mappings.
- Officer eligibility by department, category, and service area.
- Officer availability.
- Working calendars and response targets.

## 8.2 Assignment Algorithm

When a complaint is submitted:

1. Read the complaint category and ward/zone.
2. Find the responsible department or service team.
3. Find officers eligible for that category and service area.
4. Remove officers marked unavailable.
5. Compare the active complaint workload of the remaining officers.
6. Select an eligible officer with the lowest active workload.
7. Apply a consistent rotating tie-breaker when workloads are equal.
8. Save the assignment and create an assignment-history record.
9. Notify the officer and citizen.
10. If no suitable officer exists, add the complaint to the Unassigned Queue and notify the administrator.

## 8.3 Manual Correction

If the complaint is routed incorrectly, the administrator may correct its category, department, ward/zone, or assigned officer.

The system must preserve the original values and record the correction reason, actor, timestamp, and new values.

The existing deadline must not be silently reset.

---

# 9. NOTIFICATION REQUIREMENTS

## 9.1 Notification Channels

The first release shall support:

- In-app notifications.
- Email notifications.

SMS and WhatsApp are future enhancements.

## 9.2 Citizen Notifications

Citizens receive notifications for:

- Successful complaint submission and tracking ID.
- Assignment or responsible department changes.
- Important investigation updates.
- Requests for additional information.
- Approval of a resolution report.
- Reminders before the objection window ends.
- Complaint reopening and closure.
- Withdrawal or correction decisions.

Rejected resolution reports are handled between the officer and administrator and are not notified to citizens.

## 9.3 Officer Notifications

Officers receive notifications for:

- New assignments and reassignments.
- Priority or category changes.
- Citizen responses.
- Approaching and missed deadlines.
- Resolution report decisions, including rejections with reasons.
- Reopened complaints.
- Relevant administrative requests.

## 9.4 Administrator Notifications

Administrators receive notifications for:

- Critical complaints.
- No eligible officer or unclear routing.
- Overdue complaints.
- Resolution reports awaiting review.
- Citizen objections.
- Late reopening and withdrawal requests.
- Important backup, delivery, or system failures.

## 9.5 Notification Reliability

The system shall record email delivery attempts and failures, retry according to a configurable policy, and prevent duplicate alerts where possible.

Notification content must respect user permissions and avoid unnecessary private information.

---

# 10. EXCEPTIONAL CASES AND BUSINESS RULES

## 10.1 Late Objection

If the citizen requests reopening after the seven-day objection period, the citizen must provide a reason.

The administrator approves or rejects the request and records the decision, reason, actor, and timestamp.

## 10.2 Recurring Issue

A citizen may submit a new complaint about a recurring issue and link it to an earlier complaint.

Both complaints retain their own IDs, histories, owners, and deadlines.

## 10.3 Investigation Blocked

If an officer cannot continue because access, information, or another requirement is missing:

- Record the reason.
- Request the required information or access.
- Notify the citizen where appropriate.
- Request a deadline pause if justified.
- Require administrator approval for the pause.
- Record pause and resume timestamps.

Critical alerts continue 24/7.

## 10.4 Citizen Does Not Respond

The system sends reminders and then flags the complaint for administrator review.

The complaint must not automatically be deleted or closed solely because the citizen did not respond.

A deadline pause requires administrator approval.

## 10.5 Wrong Department or Ward/Zone

The administrator corrects the routing and records the reason.

The system preserves the previous assignment, notifies relevant parties, and does not automatically reset existing deadlines.

## 10.6 Complaint Withdrawal

A citizen may request withdrawal and provide a reason.

The administrator approves or rejects the request. Critical safety complaints require extra caution before withdrawal is approved.

All records must be preserved. Alerts and deadlines must not automatically stop before the withdrawal decision.

## 10.7 Multiple Citizens Report the Same Issue

Authorized staff can link related complaints and coordinate corrective work.

Each citizen retains a separate complaint ID, status history, notifications, and applicable deadline. The system must not expose other complainants' identities or merge/delete their individual records.

## 10.8 Officer Becomes Unavailable

The system attempts reassignment to another eligible available officer with the lowest active workload.

If no eligible officer is available, the complaint enters the Unassigned Queue and the administrator is notified.

Previous assignments and existing deadlines are preserved.

## 10.9 Citizen Account Deactivation

Deactivation prevents login but does not automatically withdraw or close complaints.

Authorized staff may continue handling open complaints. Personal information must remain access-controlled and retained according to the applicable policy.

## 10.10 Citizen Requests a Correction

Citizens may request corrections or submit additional clarification after submission.

Material changes, such as location or category, require authorized review.

The system preserves the original submission and all approved amendments. The complaint ID and existing deadlines remain unchanged unless an explicitly approved policy says otherwise.

## 10.11 System Outage or Failed Submission

The system must display clear errors and allow safe retries.

It shall confirm success only after a successful save and issue a complaint ID only after persistence.

Where the result is uncertain, the citizen should be able to check their dashboard before resubmitting.

## 10.12 Out-of-Scope Complaint

The administrator reviews complaints outside the system's service scope.

If possible, the complaint is redirected appropriately. Otherwise, it is rejected with an explanation or guidance.

The system preserves the record and decision history.

---

# 11. DATABASE REQUIREMENTS AND PRELIMINARY DATA MODEL

The system will use MySQL with Spring Data JPA/Hibernate.

The database design should be normalized, enforce relationships, preserve history, and support the system's main searches and reports.

## 11.1 Proposed Tables

**1. Users.** Stores common account information. Possible fields: user_id, full_name, email, phone, password_hash, role, account_status, email_verified, created_at, updated_at. Email uniqueness and role validation must be enforced.

**2. Officer_Profile.** Stores officer-specific information separately from the shared Users table. Possible fields: officer_profile_id, user_id, employee_id, department_id, availability_status. The employee ID must be unique. Officer eligibility and service-area mappings should be stored separately where appropriate.

**3. Departments.** Possible fields: department_id, department_name, description, active_status.

**4. Wards_Zones.** Stores configured geographic or service areas. Possible fields: zone_id, zone_name, zone_code, description, active_status.

**5. Complaint_Categories.** Stores the complaint category list.

**6. Category_Department_Mapping.** Maps categories to responsible departments.

**7. Zone_Service_Mapping.** Maps wards/zones to departments or service teams.

**8. Officer_Eligibility.** Maps officers to the categories, departments, and service areas they can handle.

**9. Complaints.** Stores the main complaint record. Possible fields: complaint_id, citizen_id, category_id, title, description, priority, status, ward_zone_id, location_description, latitude/longitude if map support is enabled, submitted_at, target/deadline information, and relevant completion or closure timestamps. The exact schema and deadline representation must be confirmed during ERD design.

**10. Complaint_Assignments.** Preserves assignment history. Possible fields: assignment_id, complaint_id, officer_id, assigned_by, assigned_at, unassigned_at, reason, active_assignment_flag.

**11. Complaint_Status_History.** Stores every status transition. Possible fields: history_id, complaint_id, old_status, new_status, changed_by, changed_at, reason.

**12. Progress_Updates.** Stores investigation updates, authorship, timestamps, and whether each update is citizen-visible or internal.

**13. Citizen_Info_Requests.** Stores requests for information, due dates, responses, reminders, and history.

**14. Resolution_Reports.** Stores the officer's resolution description, action taken, completion date, submitting officer, and submission timestamp.

**15. Resolution_Reviews.** Stores administrator review decisions, reasons, reviewer, timestamps, and the report version being reviewed.

**16. Evidence_Attachments.** Stores metadata and secure storage references for uploaded files. Possible fields: attachment_id, complaint_id, resolution_report_id where applicable, original_filename, storage_key, file_type, file_size, uploaded_by, uploaded_at, upload_stage. The database should not expose raw file paths or storage keys to unauthorized users.

**17. Notifications.** Stores recipient, notification type, message metadata, read state, and creation time.

**18. Notification_Delivery_Attempts.** Stores email attempt counts, delivery states, timestamps, and sanitized failure details.

**19. Feedback.** Stores rating, optional comment, citizen, complaint, and submission timestamp.

**20. Audit_Logs.** Stores actor, action, affected entity, timestamp, reason, and relevant before/after values.

**21. Related_Complaints.** Links related complaint records without merging or deleting individual records.

**22. Reopening_Requests.** Stores late reopening requests, reasons, decisions, and timestamps.

**23. Withdrawal_Requests.** Stores withdrawal requests, reasons, administrative decisions, and timestamps.

**24. Deadline_Pauses.** Stores pause requests, reasons, administrator approval, pause start/resume times, and deadline adjustments.

**25. System_Settings.** Stores configurable response targets, working calendars, escalation settings, file limits, and notification configuration.

## 11.2 Database Relationship Principles

- One citizen can submit many complaints.
- Each complaint belongs to one submitting citizen.
- One complaint can have multiple assignment records.
- One complaint can have multiple status-history records.
- One complaint can have multiple progress updates.
- One complaint can have multiple resolution reports over time.
- Each resolution report may have associated evidence and review decisions.
- Officers connect to shared user accounts through Officer_Profile.
- Categories, departments, wards/zones, and officer eligibility use explicit mapping tables.
- Related complaints are linked, not merged.
- Notifications are associated with their recipients and relevant events.

## 11.3 Data Integrity Rules

- Use primary keys and foreign keys.
- Use uniqueness constraints where needed.
- Use transactions for operations that must succeed together.
- Preserve historical assignments and status changes.
- Record correction reasons and timestamps.
- Index fields used frequently for search, filtering, and reporting.
- Use schema migrations/versioning to manage database changes.
- Back up evidence and database metadata consistently.

The tables above are a preliminary logical design, not the final SQL schema. The ERD will establish exact cardinalities, nullable fields, indexes, constraints, and final naming.

---

# 12. SYSTEM ARCHITECTURE AND TECHNOLOGY STACK

## 12.1 Selected Technologies

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React.js | User interface and dashboards |
| UI styling | Tailwind CSS | Responsive design and reusable styling |
| Backend | Java Spring Boot | Business logic and REST APIs |
| Security | Spring Security | Authentication and authorization |
| Database | MySQL | Persistent relational data |
| ORM | Spring Data JPA/Hibernate | Database access and entity relationships |
| Evidence storage | Protected file storage | Secure attachment storage |
| Notifications | In-app and email | User communication |
| Reports | PDF and XLSX generation | Administrative exports |
| Development | VS Code | Development environment |
| Version control | Git/GitHub | Source control and collaboration |

## 12.2 Architecture Style

The system will use a **modular three-tier web architecture**.

**Presentation Tier.** React.js and Tailwind CSS provide registration and login, the citizen, officer, and administrator dashboards, complaint forms, complaint details and timelines, search and filters, notification views, and analytics and reports.

**Application Tier.** Spring Boot provides REST APIs and business services for authentication and user management, complaint submission and tracking, assignment and routing, status transitions, investigation updates, resolution report review, notifications and deadlines, analytics and exports, audit logging, and administrative configuration.

**Data Tier.** MySQL stores structured records. Protected file storage maintains complaint attachments and resolution evidence. Backup processes protect both database records and evidence.

The frontend must not connect directly to MySQL. All protected operations must pass through backend authorization and validation.

## 12.3 Suggested Backend Modules

1. Authentication and User Management.
2. Complaint Management.
3. Assignment and Routing.
4. Complaint Workflow and Status History.
5. Resolution Reports and Reviews.
6. Notifications and Deadline Processing.
7. Department and Service Configuration.
8. Search, Analytics, and Reporting.
9. Audit and Operational Monitoring.

## 12.4 API Design Principles

- Use REST endpoints with clear resource names.
- Validate inputs on the backend.
- Enforce role, ownership, and assignment checks on every protected request.
- Use pagination for large lists.
- Provide consistent error responses.
- Avoid exposing stack traces and internal storage paths.
- Protect submission and retry operations against duplicate processing.
- Record important workflow changes transactionally.

Microservices and Kubernetes are not required for this project. A modular Spring Boot application is more appropriate for the intended scope.

---

# 13. USER INTERFACE AND APPLICATION PAGES

## 13.1 Public Pages

**Registration Page.** Name, email, phone, password, validation messages, and email verification instructions.

**Login Page.** Email or login identifier, password, password-reset link, and clear authentication errors.

**Password Reset Page.** Verified email workflow, secure reset process, and confirmation message.

## 13.2 Citizen Pages

**Citizen Dashboard.** Displays complaint totals, recent updates, action-required requests, and notifications.

**Submit Complaint.** Includes category, title, description, ward/zone, location, optional map pin, date, evidence, and validation.

**Complaint Details.** Displays complaint ID, current status, timeline, department, permitted progress updates, approved resolution report and evidence, objection controls, and feedback.

**Notifications.** Displays in-app notifications, read/unread status, and notification history.

**Profile.** Allows updates to permitted profile fields and secure account management.

## 13.3 Officer Pages

**Officer Dashboard.** Displays assigned, pending, overdue, and awaiting-review counts.

**Assigned Complaints.** Provides searchable and filterable lists of assigned cases.

**Investigation Details.** Displays complaint information, location, permitted citizen details, attachments, timeline, and status-specific actions.

**Resolution Report Form.** Collects action taken, resolution description, completion date, and required evidence.

## 13.4 Administrator Pages

**Admin Dashboard.** Displays total complaints, pending cases, critical and overdue cases, and resolution reports awaiting review.

**Complaint Management.** Provides system-wide complaint lists, search, filters, routing corrections, priority and category corrections, assignment, and reassignment.

**Unassigned Queue.** Shows complaints that could not be automatically routed or require administrative routing review.

**Resolution Review.** Displays resolution reports, evidence, and approve or reject actions with required decisions.

**User and Officer Management.** Provides account activation and deactivation, officer profile management, department assignment, eligibility, and availability controls.

**Department and Zone Management.** Provides category mappings, ward/zone configuration, and service-area management.

**Analytics and Reports.** Provides filters, tables, charts, and PDF/XLSX exports.

**Audit Logs and Settings.** Provides searchable history, response-target settings, working calendars, notification settings, and escalation configuration.

## 13.5 UI/UX Principles

- Responsive layout for supported devices.
- Consistent navigation and visual hierarchy.
- Clear status and priority labels.
- Readable typography and accessible contrast.
- Helpful validation and error messages.
- Confirmation for consequential actions.
- Separation of citizen-visible updates from internal notes.
- Clear explanation of deadlines and required actions.

---

# 14. SECURITY, PRIVACY AND DATA RETENTION

## 14.1 Authentication Security

The application shall use secure password hashing, verified-email password reset, protected sessions, and controls against repeated failed login attempts.

Secrets and credentials must not be committed to GitHub or exposed in frontend code.

## 14.2 Authorization

- Citizens access only their own complaints.
- Officers access only assigned complaints.
- Administrators access system-wide records according to their authorized role.
- Backend checks apply to pages, APIs, attachments, exports, and history.
- Important administrative actions are audited.

## 14.3 Complaint Privacy

Individual complaint records shall not be publicly browsable.

Citizen information must only be available to authorized people who need it to handle the complaint.

Notifications and exports must not disclose unnecessary private information.

## 14.4 Attachment Security

The system shall validate actual file type and size, use safe storage names, store files privately, and authorize every download.

A guessed or copied file URL must not bypass permissions.

## 14.5 Audit Integrity

Ordinary users and officers cannot modify or delete audit history. Administrators can inspect logs but cannot silently rewrite past actions.

## 14.6 Retention Policy

Complaint records, evidence, decisions, and audit history shall be retained according to the applicable approved retention policy.

The project shall not invent a fixed retention period without confirmation of applicable requirements.

When an approved retention policy permits archival, anonymization, or deletion, those processes must be authorized and auditable.

## 14.7 Backup Security

Backups shall be encrypted and access-controlled. Restoration tests must verify that complaint data, histories, assignments, and evidence can be recovered consistently.

---

# 15. ANALYTICS AND REPORTING

## 15.1 Main Metrics

The administrator dashboard and reports shall include:

- Total complaints.
- Submitted and pending complaints.
- Assigned and in-progress complaints.
- Critical and overdue complaints.
- Reports awaiting review.
- Reopened and closed complaints.
- Complaints by department.
- Complaints by category and priority.
- Complaints by ward/zone.
- Acknowledgement and action-start times.
- Response-target compliance.
- Active officer workload.
- Unassigned complaint count.
- Citizen feedback trends.
- Related and recurring complaint trends.

## 15.2 Filters

Reports can be filtered by:

- Date range.
- Department.
- Ward/zone.
- Category.
- Priority.
- Status.

Additional filters may include assigned officer when appropriate.

## 15.3 Export Formats

The first release shall support PDF and Excel (XLSX).

Exports should include generation time, applied filters, and clear metric definitions.

Only authorized administrators may generate system-wide reports.

## 15.4 Correct Interpretation

Administrative closure is not independent proof of real-world resolution.

Response-target compliance must account for approved deadline pauses and documented exceptions. Workload figures should not automatically be treated as evidence of individual officer fault.

---

# 16. TESTING AND ACCEPTANCE CRITERIA

Testing must verify both normal operation and failure conditions.

## 16.1 Unit Testing

Test individual business rules, such as:

- Priority target calculations.
- Status transition validation.
- Assignment selection.
- File size and type limits.
- Role permission checks.
- Objection-window calculations.

## 16.2 Integration Testing

Test interactions among:

- Spring Boot services.
- MySQL database.
- Evidence storage.
- Notification delivery.
- Deadline processing.
- PDF/XLSX generation.

For example, saving a complaint and creating its initial status-history record should succeed together or fail safely.

## 16.3 Security Testing

Test whether:

- One citizen can access another citizen's complaint.
- An officer can access an unassigned complaint.
- An officer can approve their own resolution report.
- An unauthorized user can download an attachment.
- An unauthorized role can modify administrative settings.
- A guessed complaint ID can bypass access controls.

All such unauthorized operations must be denied.

## 16.4 End-to-End Testing

Test the complete lifecycle:

1. Citizen registers and verifies email.
2. Citizen submits a complaint.
3. System assigns an eligible officer or queues the complaint.
4. Officer acknowledges and investigates.
5. Officer submits a resolution report with evidence.
6. Administrator approves or rejects the report.
7. Citizen receives notification.
8. Citizen objects or the objection window expires.
9. System reopens or closes the complaint according to the rules.
10. Audit history and notifications reflect the events.

## 16.5 Failure and Recovery Testing

Test:

- Database save failure.
- Email delivery failure.
- Evidence upload failure.
- Duplicate submission retry.
- Backup failure alerts.
- Backup restoration.
- Unexpected session expiry.
- Invalid or unsupported files.

## 16.6 Usability Testing

Test:

- Responsive pages.
- Form validation.
- Search and filtering.
- Clear status explanations.
- Keyboard navigation.
- Error and retry messages.
- PDF/XLSX exports.

## 16.7 Acceptance Checklist

The project is ready for its first release when:

- [ ] Registration, email verification, login, and password reset work.
- [ ] Citizens can submit complaints and receive IDs only after successful save.
- [ ] Citizens cannot access other citizens' complaints.
- [ ] Automatic assignment and the Unassigned Queue work correctly.
- [ ] Officers can access only assigned complaints.
- [ ] Officers cannot approve their own resolution reports.
- [ ] Resolution reports require all mandatory information and appropriate evidence.
- [ ] Administrators can approve or reject resolution reports with recorded decisions.
- [ ] The seven-day objection window works correctly.
- [ ] Automatic closure and reopening follow the approved workflow.
- [ ] Response targets, reminders, overdue flags, and escalations work.
- [ ] Reassignment preserves history and does not silently reset deadlines.
- [ ] Upload restrictions are enforced.
- [ ] Notifications respect permissions and handle delivery failures.
- [ ] Audit logs cannot be silently rewritten.
- [ ] Analytics and PDF/XLSX exports respect access controls.
- [ ] Database and evidence restoration have been tested.
- [ ] No unresolved critical security or data-loss defects remain.

A checklist item must not be marked complete until the feature has actually been tested.

---

# 17. PROJECT RISKS AND MITIGATIONS

| Risk | Mitigation |
|---|---|
| Incorrect automatic assignment | Maintain validated mappings and provide an Unassigned Queue |
| No eligible officer | Alert administrator and preserve the complaint in the queue |
| Incorrect deadline calculations | Configure working calendars and test deadline logic |
| False confidence in resolution | Require administrator review and suitable evidence |
| Email delivery failure | Maintain in-app notifications and retry delivery safely |
| Unauthorized data access | Enforce backend authorization and test direct API access |
| Evidence loss | Back up protected storage and test restoration |
| Duplicate submissions | Use safe retries and duplicate detection |
| Scope expansion | Treat this document as a baseline and record changes formally |
| Inconsistent histories | Use transactions and separate history tables |
| Data retention uncertainty | Confirm applicable retention policy before production deployment |

---

# 18. PROJECT DEVELOPMENT PLAN

Development begins only after the requirements and design have been reviewed.

**Phase 1: Requirements Finalization.** Review this SRS with the team, resolve remaining operational questions, and confirm the project scope and acceptance criteria.

**Phase 2: System Design.** Create the use case diagram, context diagram, Level 0 and Level 1 data flow diagrams, entity relationship diagram, three-tier architecture diagram, complaint status transition diagram, and initial API and database specifications.

**Phase 3: Project Setup.** Create the GitHub repository, set up the React frontend and Spring Boot backend, configure MySQL, establish environment configuration and secret handling, and define database migration and versioning practices.

**Phase 4: Authentication and Core Data Model.** Implement registration and email verification, login and logout, password reset, role-based authorization, user and officer profiles, and core database relationships. Security and role restrictions should be tested before adding complex workflow features.

**Phase 5: Complaint Management.** Implement complaint submission, complaint IDs, complaint details and timelines, status history, attachments and validation, and the citizen dashboard.

**Phase 6: Assignment and Officer Workflow.** Implement category and service-area mapping, automatic assignment, the Unassigned Queue, manual reassignment, the officer dashboard, and investigation updates and information requests.

**Phase 7: Resolution and Administrative Review.** Implement resolution reports, evidence submission, administrator review, citizen notification, the seven-day objection window, reopening and automatic closure, and feedback.

**Phase 8: Notifications, Deadlines and Exceptions.** Implement in-app and email notifications, reminder and escalation processing, deadline pauses and approval, withdrawal and late reopening requests, related complaint linking, and other exceptional-case handling.

**Phase 9: Analytics and Reports.** Implement administrative dashboards, search and filters, performance and workload metrics, and PDF and XLSX exports.

**Phase 10: Testing and Deployment.** Run unit, integration, security, and end-to-end tests. Test backup restoration, fix critical defects, deploy the application, configure production secrets, HTTPS, database access, and file storage, and document the deployment and final test results.

---

# 19. REMAINING DECISIONS TO CONFIRM BEFORE CODING

The principal requirements and technology choices are established. The following operational details must still be confirmed with the team or supervisor.

1. **Working calendar:** Exact working hours, holidays, time zone, and treatment of weekends.
2. **Deadline start events:** Exact event that starts each acknowledgement and action-start target.
3. **Email provider:** Sender account, credentials, and delivery and retry policy.
4. **Deployment environment:** Hosting platform, domain, HTTPS, database hosting, and protected file storage.
5. **Retention policy:** Applicable rules for retaining, archiving, anonymizing, or deleting records.
6. **Institution-specific integration:** Whether official identity verification, maps, or external departmental data is required.
7. **Expected usage:** Approximate concurrent users and measurable performance targets.
8. **Final workflow matrix:** Exact permitted status transitions and the internal representation of escalation.
9. **Correction and feedback policy:** Whether feedback can be edited and how repeated resolution cycles are represented.

These decisions should be documented rather than assumed during coding.

---

# 20. CONCLUSION

The Public Complaint System is intended to provide a centralized, traceable, and secure process for handling public complaints.

The project has three clearly defined roles: Citizen, Department Officer, and Administrator. Its central workflow covers complaint submission, automatic assignment, investigation, resolution reporting, mandatory administrator review, citizen feedback, objection, reopening, and closure.

The proposed React, Tailwind CSS, Spring Boot, Spring Security, and MySQL stack supports the requirements while keeping the architecture manageable for a college project.

The most important design principles are:

- Citizens can access only their own complaints.
- Officers handle only authorized assigned cases.
- Administrators review every resolution report.
- Every important action is recorded in history.
- Response deadlines and exceptions are auditable.
- Evidence supports a resolution report but does not independently prove a physical repair.
- Backups, permissions, and privacy are part of the system design from the beginning.

**This SRS is the requirements baseline for the next phase.** Before implementation, the team should review it, resolve the remaining operational decisions, and derive the detailed diagrams, database schema, API contracts, and test cases from it.

No functionality described here should be considered implemented or verified until it has been developed and tested.

---

# APPENDIX A: REQUIREMENT SUMMARY

| Area | Finalized direction |
|---|---|
| Roles | Citizen, Department Officer, Administrator |
| Frontend | React.js + Tailwind CSS |
| Backend | Java Spring Boot + Spring Security |
| Database | MySQL + Spring Data JPA/Hibernate |
| Architecture | Modular three-tier web application |
| Complaint categories | 10 configurable categories |
| Priority levels | Critical, High, Medium, Low |
| Assignment | Category + department + ward/zone + eligibility + availability + workload |
| Resolution | Officer submits evidence; administrator reviews every report |
| Citizen objection | Seven days after notification of approved resolution |
| Notifications | In-app and email |
| File limits | JPG/PNG/PDF; 10 MB per file; 5 files per upload stage |
| Reports | PDF and XLSX |
| Audit | Important actions and decisions preserved |
| Backups | Automated daily database backup and protected evidence backup |
| Development tools | VS Code + Git/GitHub |
| Development approach | Requirements → Design → Implementation → Testing → Deployment |

# APPENDIX B: GLOSSARY

**Citizen:** Registered person who submits and tracks complaints.

**Department Officer:** Staff member authorized to investigate assigned complaints.

**Administrator:** Authorized user responsible for system configuration, routing, review, and oversight.

**Complaint ID:** Stable identifier generated after a complaint is successfully saved.

**Ward/Zone:** Configured geographic or service area used for complaint routing.

**Acknowledgement Target:** Time allowed for the responsible team to acknowledge a complaint.

**Action-Start Target:** Time allowed to begin assessment or routine action; it is not a promise of completion.

**Resolution Report:** Officer-submitted description of the work performed, supported by appropriate evidence.

**Objection Window:** Seven-day period after the citizen is notified that a resolution report has been approved.

**Unassigned Queue:** Administrator-visible queue for complaints that cannot be routed automatically.

**Audit Log:** Protected record of important actions and decisions.

**Related Complaint:** A separately retained complaint linked to another complaint because they concern the same or a related public issue.

**SRS:** Software Requirements Specification, a document describing what a software system must do and the constraints under which it operates.
