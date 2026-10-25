-- CivicConnect MySQL Schema Initialization (Flyway V1)
-- Production Grade RDBMS Definition with Foreign Keys, Constraints, and Performance Indexes

CREATE TABLE IF NOT EXISTS departments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    description TEXT,
    head_officer_name VARCHAR(255),
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ward_zones (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(32) NOT NULL UNIQUE,
    zone VARCHAR(64) NOT NULL,
    description TEXT,
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    default_priority VARCHAR(32) NOT NULL DEFAULT 'MEDIUM',
    department_id VARCHAR(64) NOT NULL,
    active_status BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_categories_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(32) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    account_status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
    employee_id VARCHAR(64),
    department_id VARCHAR(64),
    department_name VARCHAR(255),
    availability_status VARCHAR(32) DEFAULT 'AVAILABLE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS officer_eligible_categories (
    officer_id VARCHAR(64) NOT NULL,
    category_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (officer_id, category_id),
    CONSTRAINT fk_oec_officer FOREIGN KEY (officer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_oec_category FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS officer_eligible_zones (
    officer_id VARCHAR(64) NOT NULL,
    zone_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (officer_id, zone_id),
    CONSTRAINT fk_oez_officer FOREIGN KEY (officer_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_oez_zone FOREIGN KEY (zone_id) REFERENCES ward_zones (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token VARCHAR(128) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_evt_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id VARCHAR(64) PRIMARY KEY,
    token VARCHAR(128) NOT NULL UNIQUE,
    user_id VARCHAR(64) NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_prt_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    exact_location TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    incident_date VARCHAR(64),
    priority VARCHAR(32) NOT NULL,
    status VARCHAR(64) NOT NULL,
    assigned_officer_id VARCHAR(64),
    assigned_officer_name VARCHAR(255),
    assigned_at TIMESTAMP NULL,
    ack_deadline TIMESTAMP NULL,
    action_deadline TIMESTAMP NULL,
    acknowledged_at TIMESTAMP NULL,
    action_started_at TIMESTAMP NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    objection_window_end TIMESTAMP NULL,
    closed_at TIMESTAMP NULL,
    is_paused BOOLEAN NOT NULL DEFAULT FALSE,
    pause_reason TEXT,
    pending_withdrawal_reason TEXT,
    pending_reopen_reason TEXT,
    idempotency_key VARCHAR(128) UNIQUE,
    CONSTRAINT fk_complaints_citizen FOREIGN KEY (citizen_id) REFERENCES users (id),
    CONSTRAINT fk_complaints_department FOREIGN KEY (department_id) REFERENCES departments (id),
    CONSTRAINT fk_complaints_category FOREIGN KEY (category_id) REFERENCES categories (id),
    CONSTRAINT fk_complaints_zone FOREIGN KEY (ward_zone_id) REFERENCES ward_zones (id),
    INDEX idx_complaints_citizen (citizen_id),
    INDEX idx_complaints_officer (assigned_officer_id),
    INDEX idx_complaints_status (status),
    INDEX idx_complaints_priority (priority),
    INDEX idx_complaints_department (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS status_history (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    old_status VARCHAR(64),
    new_status VARCHAR(64) NOT NULL,
    changed_by VARCHAR(64) NOT NULL,
    changed_by_name VARCHAR(255) NOT NULL,
    changed_by_role VARCHAR(32) NOT NULL,
    changed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    reason TEXT,
    CONSTRAINT fk_sh_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    INDEX idx_sh_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS progress_updates (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    officer_id VARCHAR(64) NOT NULL,
    officer_name VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    note TEXT NOT NULL,
    visibility VARCHAR(32) NOT NULL DEFAULT 'CITIZEN_VISIBLE',
    CONSTRAINT fk_pu_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    INDEX idx_pu_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS citizen_info_requests (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL,
    requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    officer_name VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    response TEXT,
    responded_at TIMESTAMP NULL,
    CONSTRAINT fk_cir_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    INDEX idx_cir_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
    reviewer_decision VARCHAR(32),
    reviewer_name VARCHAR(255),
    reviewed_at TIMESTAMP NULL,
    reviewer_reason TEXT,
    CONSTRAINT fk_rr_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    INDEX idx_rr_complaint (complaint_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS evidence_attachments (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64),
    resolution_report_id VARCHAR(64),
    filename VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(128) NOT NULL,
    uploaded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    uploaded_by VARCHAR(255) NOT NULL,
    file_url TEXT NOT NULL,
    INDEX idx_ea_complaint (complaint_id),
    INDEX idx_ea_report (resolution_report_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS feedbacks (
    id VARCHAR(64) PRIMARY KEY,
    complaint_id VARCHAR(64) NOT NULL UNIQUE,
    citizen_id VARCHAR(64) NOT NULL,
    rating INT NOT NULL,
    comment TEXT,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_feedback_complaint FOREIGN KEY (complaint_id) REFERENCES complaints (id) ON DELETE CASCADE,
    CONSTRAINT fk_feedback_citizen FOREIGN KEY (citizen_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    recipient_id VARCHAR(64) NOT NULL,
    recipient_role VARCHAR(32) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(64) NOT NULL,
    related_complaint_id VARCHAR(64),
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    email_delivery_status VARCHAR(32) DEFAULT 'SENT',
    INDEX idx_notif_recipient (recipient_id),
    INDEX idx_notif_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor_id VARCHAR(64) NOT NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(32) NOT NULL,
    action VARCHAR(255) NOT NULL,
    entity_type VARCHAR(64) NOT NULL,
    entity_id VARCHAR(64) NOT NULL,
    reason TEXT,
    before_value TEXT,
    after_value TEXT,
    INDEX idx_audit_entity (entity_type, entity_id),
    INDEX idx_audit_actor (actor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
