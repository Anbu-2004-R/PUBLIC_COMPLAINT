-- V2__seed_reference_data.sql
-- Seed Departments, Ward Zones, Categories, and Initial System Users

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
('dept-civic', 'Civic Administration & Services', 'CAS', 'Trade licenses, birth/death records, and general citizen queries', 'Praveen Joshi', TRUE);

-- 2. Ward Zones
INSERT INTO ward_zones (id, name, code, zone, description, active_status) VALUES
('w-1', 'Ward 1 - Gandhi Nagar', 'W-01', 'North', 'Northern residential and educational zone', TRUE),
('w-2', 'Ward 2 - Malleshwaram Extn', 'W-02', 'North', 'North-western commercial transit hub', TRUE),
('w-3', 'Ward 3 - Shivaji Commercial', 'W-03', 'Central', 'Central business and government secretariat area', TRUE),
('w-4', 'Ward 4 - Rajaji Heritage', 'W-04', 'Central', 'Central historic market and dense housing', TRUE),
('w-5', 'Ward 5 - Jayanagar South', 'W-05', 'South', 'Southern planned residential avenues', TRUE),
('w-6', 'Ward 6 - Koramangala Outer', 'W-06', 'South', 'Southern tech hub and dining corridor', TRUE),
('w-7', 'Ward 7 - Indiranagar East', 'W-07', 'East', 'Eastern residential and commercial belt', TRUE),
('w-8', 'Ward 8 - Rajarajeshwari West', 'W-08', 'West', 'Western suburban and light industrial zone', TRUE);

-- 3. Categories
INSERT INTO categories (id, name, description, default_priority, department_id) VALUES
('cat-roads', 'Roads and Infrastructure', 'Potholes, broken footpaths, damaged bridges, or cave-ins', 'HIGH', 'dept-pwd'),
('cat-water', 'Water Supply and Drainage', 'Pipe leaks, contaminated water supply, sewage overflow, blocked culverts', 'HIGH', 'dept-water'),
('cat-sanitation', 'Sanitation and Waste', 'Garbage dump overflow, uncollected refuse, animal waste, public urinal cleaning', 'MEDIUM', 'dept-sanitation'),
('cat-streetlights', 'Streetlights and Electricity', 'Non-functional street lamps, dangling overhead wires, sparking junction boxes', 'HIGH', 'dept-electricity'),
('cat-safety', 'Public Safety', 'Uncovered manholes, collapsing compound walls, hazardous stray animals', 'CRITICAL', 'dept-safety'),
('cat-parks', 'Parks and Public Spaces', 'Damaged play rides, broken park benches, fallen trees, overgrown bushes', 'LOW', 'dept-parks'),
('cat-transport', 'Public Transport', 'Broken bus shelter glass, faulty signal timers, missing pedestrian crossing signs', 'MEDIUM', 'dept-transport'),
('cat-env', 'Noise and Environmental Issues', 'Industrial smoke discharge, loud construction past curfew, lake water dumping', 'MEDIUM', 'dept-env'),
('cat-govt', 'Government Services', 'Delays in certificates, billing disputes, municipal counter issues', 'LOW', 'dept-civic'),
('cat-other', 'Other', 'General civic grievances not falling into specific departments', 'LOW', 'dept-civic');

-- 4. Initial Users
-- Password hash corresponds to BCrypt encoded passwords (e.g., 'Admin@123', 'Officer@123', 'Citizen@123')
INSERT INTO users (id, full_name, email, phone, password_hash, role, email_verified, account_status, employee_id, department_id, availability_status) VALUES
('usr-admin-1', 'Dr. Alok Verma', 'admin@civicpulse.org', '+91 98765 00001', '$2a$10$w8.1PzTzLdE2vYh.4K7Z6L2eF1/G8B7uF.xS2o2Lp1/pZ4K7Z6L2e', 'ADMIN', TRUE, 'ACTIVE', 'ADM-001', NULL, 'AVAILABLE'),
('usr-off-pwd-1', 'Er. Rajesh Kumar', 'officer.pwd@civicpulse.org', '+91 98765 11001', '$2a$10$w8.1PzTzLdE2vYh.4K7Z6L2eF1/G8B7uF.xS2o2Lp1/pZ4K7Z6L2e', 'OFFICER', TRUE, 'ACTIVE', 'EMP-PWD-101', 'dept-pwd', 'AVAILABLE'),
('usr-off-water-1', 'Er. Anita Desai', 'officer.water@civicpulse.org', '+91 98765 11002', '$2a$10$w8.1PzTzLdE2vYh.4K7Z6L2eF1/G8B7uF.xS2o2Lp1/pZ4K7Z6L2e', 'OFFICER', TRUE, 'ACTIVE', 'EMP-WSSB-102', 'dept-water', 'AVAILABLE'),
('usr-cit-1', 'Priya Sharma', 'citizen.priya@gmail.com', '+91 98765 43210', '$2a$10$w8.1PzTzLdE2vYh.4K7Z6L2eF1/G8B7uF.xS2o2Lp1/pZ4K7Z6L2e', 'CITIZEN', TRUE, 'ACTIVE', NULL, NULL, 'AVAILABLE'),
('usr-cit-2', 'Arun Kumar', 'citizen.arun@gmail.com', '+91 98765 43211', '$2a$10$w8.1PzTzLdE2vYh.4K7Z6L2eF1/G8B7uF.xS2o2Lp1/pZ4K7Z6L2e', 'CITIZEN', TRUE, 'ACTIVE', NULL, NULL, 'AVAILABLE');

-- 5. Officer Eligibility Mappings
INSERT INTO officer_eligible_categories (officer_id, category_id) VALUES
('usr-off-pwd-1', 'cat-roads'),
('usr-off-water-1', 'cat-water');

INSERT INTO officer_eligible_zones (officer_id, ward_zone_id) VALUES
('usr-off-pwd-1', 'w-1'),
('usr-off-pwd-1', 'w-2'),
('usr-off-pwd-1', 'w-3'),
('usr-off-water-1', 'w-1'),
('usr-off-water-1', 'w-2'),
('usr-off-water-1', 'w-4');
