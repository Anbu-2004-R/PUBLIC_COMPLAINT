-- V1__init_schema.sql
-- CivicConnect Public Complaint System Schema

-- 1. Departments
CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    head_officer_name VARCHAR(255),
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Ward Zones
CREATE TABLE IF NOT EXISTS ward_zones (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    zone VARCHAR(32) NOT NULL,
    description TEXT,
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 3. Categories
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    department_id VARCHAR(64) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
);

-- 4. Users
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    employee_id VARCHAR(64) NULL,
    department_id VARCHAR(64) NULL,
    availability_status VARCHAR(32) NOT NULL DEFAULT 'AVAILABLE',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- 5. Officer Eligibility Mappings
CREATE TABLE IF NOT EXISTS officer_eligible_categories (
    officer_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (officer_id, category_id),
    CONSTRAINT fk_oec_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_oec_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS officer_eligible_zones (
    officer_id VARCHAR(64) NOT NULL,
    ward_zone_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (officer_id, ward_zone_id),
    CONSTRAINT fk_oez_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_oez_zone FOREIGN KEY (ward_zone_id) REFERENCES ward_zones(id) ON DELETE CASCADE
);

-- 6. Authentication Tokens
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 7. Complaints
CREATE TABLE IF NOT EXISTS complaints (
    id VARCHAR(64) PRIMARY KEY,
    citizen_id VARCHAR(64) NOT NULL,
    citizen_name VARCHAR(255) NOT NULL,
    citizen_phone VARCHAR(32) NOT NULL,
    citizen_email VARCHAR(255) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    category_name VARCHAR(255) NOT NULL,
    department_id VARCHAR(64) NOT NULL,
    department_name VARCHAR(255) NOT NULL,
    ward_zone_id VARCHAR(64) NOT NULL,
    ward_zone_name VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    exact_location VARCHAR(500) NOT NULL,
    incident_date VARCHAR(64) NULL,
    priority VARCHAR(32) NOT NULL,
    status VARCHAR(64) NOT NULL,
    assigned_officer_id VARCHAR(64) NULL,
    assigned_officer_name VARCHAR(255) NULL,
    assigned_at TIMESTAMP NULL,
    ack_deadline TIMESTAMP NULL,
    action_deadline TIMESTAMP NULL,
    acknowledged_at TIMESTAMP NULL,
    action_started_at TIMESTAMP NULL,
    objection_window_end TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    is_paused BOOLEAN NOT NULL DEFAULT FALSE,
    pause_reason TEXT NULL,
    pending_withdrawal_reason TEXT NULL,
    pending_reopen_reason TEXT NULL,
    idempotency_key VARCHAR(128) NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_complaint_citizen FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_officer FOREIGN KEY (assigned_officer_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_complaint_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_dept FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    CONSTRAINT fk_complaint_ward FOREIGN KEY (ward_zone_id) REFERENCES ward_zones(id) ON DELETE RESTRICT
);

-- Indexes for complaints queries
CREATE INDEX idx_complaints_citizen ON complaints(citizen_id);
CREATE INDEX idx_complaints_officer ON complaints(assigned_officer_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_dept ON complaints(department_id);
CREATE INDEX idx_complaints_submitted_at ON complaints(submitted_at);

-- 8. Resolution Reports
CREATE TABLE IF NOT EXISTS resolution_reports (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    officer_id VARCHAR(64) NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    actions_taken TEXT NOT NULL,
    outcome_description TEXT NOT NULL,
    completion_date VARCHAR(64) NOT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    review_status VARCHAR(32) NOT NULL DEFAULT 'PENDING_REVIEW',
    reviewer_name VARCHAR(255) NULL,
    reviewed_at TIMESTAMP NULL,
    admin_reason TEXT NULL,
    CONSTRAINT fk_res_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_res_officer FOREIGN KEY (officer_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 9. Complaint Attachments
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    resolution_report_id VARCHAR(64) NULL,
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(128) NOT NULL,
    url LONGTEXT NOT NULL,
    uploaded_by VARCHAR(64) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_att_resolution FOREIGN KEY (resolution_report_id) REFERENCES resolution_reports(id) ON DELETE SET NULL
);

-- 10. Complaint Status History
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    old_status VARCHAR(64) NULL,
    new_status VARCHAR(64) NOT NULL,
    changed_by VARCHAR(64) NOT NULL,
    changed_by_name VARCHAR(255) NOT NULL,
    changed_by_role VARCHAR(32) NOT NULL,
    reason TEXT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_csh_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 11. Complaint Progress Updates
CREATE TABLE IF NOT EXISTS complaint_progress_updates (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    officer_id VARCHAR(64) NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    note TEXT NOT NULL,
    visibility VARCHAR(32) NOT NULL DEFAULT 'CITIZEN_VISIBLE',
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cpu_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 12. Citizen Info Requests
CREATE TABLE IF NOT EXISTS citizen_info_requests (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at TIMESTAMP NULL,
    CONSTRAINT fk_cir_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE
);

-- 13. Complaint Feedback
CREATE TABLE IF NOT EXISTS complaint_feedback (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    citizen_id VARCHAR(64) NOT NULL,
    rating INT NOT NULL,
    comment TEXT NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cf_complaint FOREIGN KEY (complaint_id) REFERENCES complaints(id) ON DELETE CASCADE,
    CONSTRAINT fk_cf_citizen FOREIGN KEY (citizen_id) REFERENCES users(id) ON DELETE RESTRICT
);

-- 14. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_id VARCHAR(64) NOT NULL,
    recipient_role VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) NOT NULL,
    related_complaint_id VARCHAR(64) NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    email_delivery_status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);

-- 15. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(128) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    reason TEXT NULL,
    before_value TEXT NULL,
    after_value TEXT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
