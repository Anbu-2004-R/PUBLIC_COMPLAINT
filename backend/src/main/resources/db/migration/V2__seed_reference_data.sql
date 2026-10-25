-- CivicConnect Reference Data & Default Accounts Seed (Flyway V2)
-- Default Departments
INSERT INTO departments (id, name, code, description, head_officer_name, active_status) VALUES
('dept-pwd', 'Public Works Department', 'PWD', 'Roads, bridges, stormwater drains, and civil infrastructure maintenance', 'Er. Rajesh Kumar', true),
('dept-water', 'Water Supply and Sewerage Board', 'WSSB', 'Potable water supply pipeline networks and sewerage clearing', 'Er. Anita Desai', true),
('dept-sanitation', 'Solid Waste Management & Sanitation', 'SWMS', 'Garbage collection, street sweeping, dump yards, and sanitation', 'Dr. Suresh Patil', true),
('dept-electricity', 'Street Lighting & Electricity', 'SLE', 'Public illumination, lampposts, cables, and feeder boxes', 'Er. Vikram Rao', true),
('dept-safety', 'Public Safety & Vigilance', 'PSV', 'Civil protection, structural hazards, open pits, and public danger mitigation', 'Insp. Meera Nair', true),
('dept-parks', 'Parks & Public Spaces', 'PPS', 'Municipal gardens, tree pruning, playground equipment, and public greens', 'Hort. Aruna Bose', true),
('dept-transport', 'Public Transport & Traffic Infra', 'PTTI', 'Bus stops, traffic signals, road signages, and transit coordination', 'Mohan Lal', true),
('dept-env', 'Noise & Environmental Control', 'NEC', 'Noise pollution, industrial emissions, and lake water quality monitoring', 'Dr. Sunita Sen', true),
('dept-civic', 'Civic Administration & Services', 'CAS', 'Birth/death certificates, trade licensing, municipal property taxes', 'Govind Prasad', true);

-- Default Ward Zones
INSERT INTO ward_zones (id, name, code, zone, description, active_status) VALUES
('ward-z1-01', 'Ward 1 - Ashok Nagar', 'WZ-N01', 'North', 'Ashok Nagar, Shivajinagar north fringe, residential and market', true),
('ward-z1-02', 'Ward 2 - Malleshwaram', 'WZ-N02', 'North', 'Malleshwaram heritage commercial and residential residential belts', true),
('ward-z1-03', 'Ward 3 - Hebbal Outer', 'WZ-N03', 'North', 'Hebbal flyover junction, Bellary Road arterial corridor', true),
('ward-z2-04', 'Ward 4 - Jayanagar Core', 'WZ-S04', 'South', 'Jayanagar blocks 1 to 9, residential tree-lined boulevards', true),
('ward-z2-05', 'Ward 5 - JP Nagar', 'WZ-S05', 'South', 'JP Nagar phases 1 to 7, lake fringe residential zone', true),
('ward-z2-06', 'Ward 6 - Banashankari', 'WZ-S06', 'South', 'Banashankari stage 2 & 3, temple hub and transit terminus', true),
('ward-z3-07', 'Ward 7 - Indiranagar', 'WZ-E07', 'East', 'Indiranagar 100ft road commercial strip, CMH Road retail', true),
('ward-z3-08', 'Ward 8 - Whitefield IT Hub', 'WZ-E08', 'East', 'ITPB, EPIP zone, transit spine with high commuter density', true),
('ward-z4-09', 'Ward 9 - Rajajinagar Industrial', 'WZ-W09', 'West', 'Rajajinagar 1st block to industrial estate belt', true),
('ward-z5-10', 'Ward 10 - MG Road Central', 'WZ-C10', 'Central', 'MG Road, Brigade Road, Vidhana Soudha administrative precinct', true);

-- Default Complaint Categories
INSERT INTO categories (id, name, description, default_priority, department_id, active_status) VALUES
('cat-pothole', 'Pothole & Damaged Road Surface', 'Dangerous potholes, road cave-ins, and uneven asphalt on municipal roads', 'HIGH', 'dept-pwd', true),
('cat-drainage', 'Overflowing Storm Drain & Waterlogging', 'Blocked storm drains, open culverts, and street flooding during rain', 'HIGH', 'dept-pwd', true),
('cat-footpath', 'Broken Footpath & Encroachment', 'Damaged pedestrian pavements, missing slabs, and illegal sidewalk obstructions', 'MEDIUM', 'dept-pwd', true),
('cat-water-pipe', 'Drinking Water Main Leakage', 'Broken municipal pipe burst, low water pressure, or muddy tap water', 'HIGH', 'dept-water', true),
('cat-sewage', 'Open Sewage Overflow & Choked Line', 'Manhole overflow, sewage backflow into homes or street stench', 'CRITICAL', 'dept-water', true),
('cat-garbage', 'Uncollected Garbage Dump & Overflow', 'Public trash dump uncleared for >24hrs, overflowing community bins', 'MEDIUM', 'dept-sanitation', true),
('cat-street-light', 'Faulty Street Light / Dark Stretch', 'Non-functional lampposts, exposed wiring, dark unsafe roadway sections', 'HIGH', 'dept-electricity', true),
('cat-open-manhole', 'Uncovered / Broken Manhole Hazard', 'Missing manhole lid on road or sidewalk posing imminent life safety threat', 'CRITICAL', 'dept-safety', true),
('cat-tree-hazard', 'Fallen / Dangerous Tree Branch', 'Overhanging branches touching live power cables or fallen trees blocking traffic', 'HIGH', 'dept-parks', true),
('cat-traffic-signal', 'Defective Traffic Signal / Signage', 'Non-functional intersection traffic lights or broken regulatory road signs', 'HIGH', 'dept-transport', true),
('cat-air-noise', 'Illegal Loudspeaker / Industrial Noise', 'Prohibited nighttime noise above threshold or illegal industrial emissions', 'LOW', 'dept-env', true),
('cat-civic-records', 'Municipal Property Tax / Certificate Delay', 'Delay in issuance of death/birth certificates or tax assessment dispute', 'LOW', 'dept-civic', true);

-- Seed System Accounts (BCrypt hash for "password123": $2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.)
INSERT INTO users (id, full_name, email, phone, password_hash, role, email_verified, account_status, employee_id, department_id, department_name, availability_status) VALUES
('usr-adm-01', 'Dr. Radhakrishnan IAS', 'admin@civicpulse.gov', '+91 98450 11001', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'ADMIN', true, 'ACTIVE', 'ADM-2024-001', 'dept-civic', 'Civic Administration & Services', 'AVAILABLE'),
('usr-off-01', 'Er. Vikram Rao', 'officer@civicpulse.gov', '+91 98450 22002', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'OFFICER', true, 'ACTIVE', 'OFF-PWD-104', 'dept-pwd', 'Public Works Department', 'AVAILABLE'),
('usr-cit-01', 'Priya Sundaram', 'citizen@civicpulse.gov', '+91 98450 33003', '$2a$10$EblZqNptyYvcLm/VwDCVAuBjzZOI7khzdyGPBr08PpIi0na624b8.', 'CITIZEN', true, 'ACTIVE', NULL, NULL, NULL, NULL);

-- Officer Eligibility for Er. Vikram Rao
INSERT INTO officer_eligible_categories (officer_id, category_id) VALUES
('usr-off-01', 'cat-pothole'),
('usr-off-01', 'cat-drainage'),
('usr-off-01', 'cat-footpath');

INSERT INTO officer_eligible_zones (officer_id, zone_id) VALUES
('usr-off-01', 'ward-z1-01'),
('usr-off-01', 'ward-z1-02'),
('usr-off-01', 'ward-z3-07');
