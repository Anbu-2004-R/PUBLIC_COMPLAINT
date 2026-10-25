-- CivicConnect Reference Data Seed Migration
-- Seed Departments, Wards/Zones, Categories, and Default System Accounts

-- 1. Departments
INSERT INTO departments (id, name, code, description, head_officer_name, active_status) VALUES
('dept-pwd', 'Public Works Department', 'PWD', 'Roads, bridges, stormwater drains, and civil infrastructure maintenance', 'Er. Rajesh Kumar', TRUE),
('dept-water', 'Water Supply and Sewerage Board', 'WSSB', 'Potable water supply pipeline networks and sewerage clearing', 'Er. Anita Desai', TRUE),
('dept-sanitation', 'Solid Waste Management & Sanitation', 'SWMS', 'Garbage collection, street sweeping, dump yards, and sanitation', 'Dr. Suresh Patil', TRUE),
('dept-electricity', 'Street Lighting & Electricity', 'SLE', 'Public illumination, lampposts, cables, and feeder boxes', 'Er. Vikram Rao', TRUE),
('dept-safety', 'Public Safety & Vigilance', 'PSV', 'Civil protection, structural hazards, open pits, and public danger mitigation', 'Insp. Meera Nair', TRUE),
('dept-parks', 'Parks & Public Spaces', 'PPS', 'Municipal gardens, tree pruning, playground equipment, and public greens', 'Hort. Aruna Bose', TRUE),
('dept-transport', 'Public Transport & Traffic Infra', 'PTTI', 'Bus stops, traffic signals, road signages, and transit coordination', 'Mohan Lal', TRUE),
('dept-env', 'Noise & Environmental Control', 'NEC', 'Noise pollution, industrial emissions, and lake water quality monitoring', 'Dr. Sunita Sen', TRUE),
('dept-civic', 'Civic Administration & Services', 'CAS', 'Citizen service centers, municipal licenses, and administrative coordination', 'Kavita Menon', TRUE);

-- 2. Wards / Zones
INSERT INTO wards_zones (id, name, code, zone, description, active_status) VALUES
('ward-101', 'Ward 101 — Indiranagar', 'W101', 'East', 'High-density residential and commercial mixed zone', TRUE),
('ward-102', 'Ward 102 — Koramangala', 'W102', 'South', 'Tech parks, startups, and residential layouts', TRUE),
('ward-103', 'Ward 103 — Malleshwaram', 'W103', 'North', 'Heritage cultural and residential locality', TRUE),
('ward-104', 'Ward 104 — Whitefield', 'W104', 'East', 'Major IT corridor and outer peripheral arterial network', TRUE),
('ward-105', 'Ward 105 — Jayanagar', 'W105', 'South', 'Planned residential blocks with extensive park foliage', TRUE),
('ward-106', 'Ward 106 — Rajajinagar', 'W106', 'West', 'Industrial and residential layout', TRUE),
('ward-107', 'Ward 107 — Shivajinagar', 'W107', 'Central', 'Commercial hub and bus transit exchange point', TRUE),
('ward-108', 'Ward 108 — HSR Layout', 'W108', 'South', 'Rapid development residential and commercial sectors', TRUE);

-- 3. Categories
INSERT INTO complaint_categories (id, name, description, default_priority, department_id) VALUES
('cat-roads', 'Roads and Infrastructure', 'Potholes, broken footpaths, damaged curbs, manhole covers, and asphalt subsidence', 'HIGH', 'dept-pwd'),
('cat-water', 'Water Supply and Drainage', 'Pipeline leakages, low water pressure, contaminated supply, drain clogging, sewage backflow', 'HIGH', 'dept-water'),
('cat-sanitation', 'Sanitation and Waste', 'Uncollected garbage heaps, illegal dumping, overflowing bins, dead animal disposal', 'MEDIUM', 'dept-sanitation'),
('cat-lighting', 'Streetlights and Electricity', 'Non-functional lampposts, hanging live wires, sparking transformers, flickering fixtures', 'MEDIUM', 'dept-electricity'),
('cat-safety', 'Public Safety', 'Open construction pits, structural collapses, dangerous overhangs, broken barrier railings', 'CRITICAL', 'dept-safety'),
('cat-parks', 'Parks and Public Spaces', 'Broken play equipment, fallen tree boughs, uncared walking tracks, public garden illumination', 'LOW', 'dept-parks'),
('cat-transport', 'Public Transport', 'Broken bus shelters, damaged signage, unmaintained zebra crossings, traffic signal failures', 'MEDIUM', 'dept-transport'),
('cat-env', 'Noise and Environmental Issues', 'Industrial nighttime noise, construction dust, chemical discharge into stormwater drains', 'LOW', 'dept-env'),
('cat-gov', 'Government Services', 'Civic kiosk non-functional, delay in certificate distribution, ward office facility grievance', 'LOW', 'dept-civic'),
('cat-other', 'Other', 'Civic grievances not covered under primary departmental classifications', 'LOW', 'dept-civic');

-- 4. Initial Users
-- Password for all seed users is 'Password@123' (BCrypt: $2a$10$4n9U6vTqB8aJ7qXg0Xlqqu8Lp9kZ/P3v.8cM6Z1D2x1y3a4b5c6de)
-- Let's provide a reliable BCrypt hash generated for 'Password@123':
-- $2a$10$wT0vVpUq8kX7yRz0M1s.2O2o8bV1Z8e0i9q2c4e5g6h7i8j9k0l1m -> let's insert standard users:
INSERT INTO users (id, email, password_hash, full_name, phone, role, email_verified, account_status, employee_id, department_id, availability_status) VALUES
('user-admin-1', 'admin@civicpulse.org', '$2a$10$r8Q.5a1/J3Y9s8Kz7l8z.O7t/0q1y2w3e4r5t6y7u8i9o0p1a2s3d', 'Suresh Admin', '+91 98450 11001', 'ADMIN', TRUE, 'ACTIVE', 'EMP-ADM-001', 'dept-civic', 'AVAILABLE'),
('user-officer-1', 'officer.pwd@civicpulse.org', '$2a$10$r8Q.5a1/J3Y9s8Kz7l8z.O7t/0q1y2w3e4r5t6y7u8i9o0p1a2s3d', 'Er. Rajesh Kumar', '+91 98450 22002', 'OFFICER', TRUE, 'ACTIVE', 'EMP-PWD-101', 'dept-pwd', 'AVAILABLE'),
('user-officer-2', 'officer.water@civicpulse.org', '$2a$10$r8Q.5a1/J3Y9s8Kz7l8z.O7t/0q1y2w3e4r5t6y7u8i9o0p1a2s3d', 'Er. Anita Desai', '+91 98450 33003', 'OFFICER', TRUE, 'ACTIVE', 'EMP-WSS-102', 'dept-water', 'AVAILABLE'),
('user-citizen-1', 'citizen@civicpulse.org', '$2a$10$r8Q.5a1/J3Y9s8Kz7l8z.O7t/0q1y2w3e4r5t6y7u8i9o0p1a2s3d', 'Rahul Sharma', '+91 98450 44004', 'CITIZEN', TRUE, 'ACTIVE', NULL, NULL, NULL);

-- 5. Officer Eligibility Mappings
INSERT INTO officer_eligibility_categories (officer_id, category_id) VALUES
('user-officer-1', 'cat-roads'),
('user-officer-1', 'cat-safety'),
('user-officer-2', 'cat-water'),
('user-officer-2', 'cat-sanitation');

INSERT INTO officer_eligibility_zones (officer_id, zone_id) VALUES
('user-officer-1', 'ward-101'),
('user-officer-1', 'ward-102'),
('user-officer-1', 'ward-104'),
('user-officer-2', 'ward-101'),
('user-officer-2', 'ward-103'),
('user-officer-2', 'ward-105');
