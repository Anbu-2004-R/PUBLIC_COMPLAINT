/**
 * Reference Data: Categories, Wards/Zones, Departments, Mappings
 * Source of Truth: SRS v1.1 FR-07, FR-08, FR-09, Section 6.2
 */

export interface Category {
  id: string;
  name: string;
  description: string;
  defaultPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  departmentId: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  headOfficerName: string;
  activeStatus: boolean;
}

export interface WardZone {
  id: string;
  name: string;
  code: string;
  zone: 'North' | 'South' | 'East' | 'West' | 'Central';
  description: string;
  activeStatus: boolean;
}

export const DEPARTMENTS: Department[] = [
  {
    id: 'dept-pwd',
    name: 'Public Works Department',
    code: 'PWD',
    description: 'Roads, bridges, stormwater drains, and civil infrastructure maintenance',
    headOfficerName: 'Er. Rajesh Kumar',
    activeStatus: true,
  },
  {
    id: 'dept-water',
    name: 'Water Supply and Sewerage Board',
    code: 'WSSB',
    description: 'Potable water supply pipeline networks and sewerage clearing',
    headOfficerName: 'Er. Anita Desai',
    activeStatus: true,
  },
  {
    id: 'dept-sanitation',
    name: 'Solid Waste Management & Sanitation',
    code: 'SWMS',
    description: 'Garbage collection, street sweeping, dump yards, and sanitation',
    headOfficerName: 'Dr. Suresh Patil',
    activeStatus: true,
  },
  {
    id: 'dept-electricity',
    name: 'Street Lighting & Electricity',
    code: 'SLE',
    description: 'Public illumination, lampposts, cables, and feeder boxes',
    headOfficerName: 'Er. Vikram Rao',
    activeStatus: true,
  },
  {
    id: 'dept-safety',
    name: 'Public Safety & Vigilance',
    code: 'PSV',
    description: 'Civil protection, structural hazards, open pits, and public danger mitigation',
    headOfficerName: 'Insp. Meera Nair',
    activeStatus: true,
  },
  {
    id: 'dept-parks',
    name: 'Parks & Public Spaces',
    code: 'PPS',
    description: 'Municipal gardens, tree pruning, playground equipment, and public greens',
    headOfficerName: 'Hort. Aruna Bose',
    activeStatus: true,
  },
  {
    id: 'dept-transport',
    name: 'Public Transport & Traffic Infra',
    code: 'PTTI',
    description: 'Bus stops, traffic signals, road signages, and transit coordination',
    headOfficerName: 'Mohan Lal',
    activeStatus: true,
  },
  {
    id: 'dept-env',
    name: 'Noise & Environmental Control',
    code: 'NEC',
    description: 'Noise pollution, industrial emissions, and lake water quality monitoring',
    headOfficerName: 'Dr. Sunita Sen',
    activeStatus: true,
  },
  {
    id: 'dept-civic',
    name: 'Civic Administration & Services',
    code: 'CAS',
    description: 'Trade licenses, birth/death records, and general citizen queries',
    headOfficerName: 'Praveen Joshi',
    activeStatus: true,
  },
];

export const CATEGORIES: Category[] = [
  {
    id: 'cat-roads',
    name: 'Roads and Infrastructure',
    description: 'Potholes, broken footpaths, damaged bridges, or cave-ins',
    defaultPriority: 'HIGH',
    departmentId: 'dept-pwd',
  },
  {
    id: 'cat-water',
    name: 'Water Supply and Drainage',
    description: 'Pipe leaks, contaminated water supply, sewage overflow, blocked culverts',
    defaultPriority: 'HIGH',
    departmentId: 'dept-water',
  },
  {
    id: 'cat-sanitation',
    name: 'Sanitation and Waste',
    description: 'Garbage dump overflow, uncollected refuse, animal waste, public urinal cleaning',
    defaultPriority: 'MEDIUM',
    departmentId: 'dept-sanitation',
  },
  {
    id: 'cat-streetlights',
    name: 'Streetlights and Electricity',
    description: 'Non-functional street lamps, dangling overhead wires, sparking junction boxes',
    defaultPriority: 'HIGH',
    departmentId: 'dept-electricity',
  },
  {
    id: 'cat-safety',
    name: 'Public Safety',
    description: 'Uncovered manholes, collapsing compound walls, hazardous stray animals',
    defaultPriority: 'CRITICAL',
    departmentId: 'dept-safety',
  },
  {
    id: 'cat-parks',
    name: 'Parks and Public Spaces',
    description: 'Damaged play rides, broken park benches, fallen trees, overgrown bushes',
    defaultPriority: 'LOW',
    departmentId: 'dept-parks',
  },
  {
    id: 'cat-transport',
    name: 'Public Transport',
    description: 'Broken bus shelter glass, faulty signal timers, missing pedestrian crossing signs',
    defaultPriority: 'MEDIUM',
    departmentId: 'dept-transport',
  },
  {
    id: 'cat-env',
    name: 'Noise and Environmental Issues',
    description: 'Industrial smoke discharge, loud construction past curfew, lake water dumping',
    defaultPriority: 'MEDIUM',
    departmentId: 'dept-env',
  },
  {
    id: 'cat-govt',
    name: 'Government Services',
    description: 'Delays in certificates, billing disputes, municipal counter issues',
    defaultPriority: 'LOW',
    departmentId: 'dept-civic',
  },
  {
    id: 'cat-other',
    name: 'Other',
    description: 'General civic grievances not falling into specific departments',
    defaultPriority: 'LOW',
    departmentId: 'dept-civic',
  },
];

export const WARDS_ZONES: WardZone[] = [
  { id: 'w-1', name: 'Ward 1 - Gandhi Nagar', code: 'W-01', zone: 'North', description: 'Northern residential and educational zone', activeStatus: true },
  { id: 'w-2', name: 'Ward 2 - Malleshwaram Extn', code: 'W-02', zone: 'North', description: 'North-western commercial transit hub', activeStatus: true },
  { id: 'w-3', name: 'Ward 3 - Shivaji Commercial', code: 'W-03', zone: 'Central', description: 'Central business and government secretariat area', activeStatus: true },
  { id: 'w-4', name: 'Ward 4 - Rajaji Heritage', code: 'W-04', zone: 'Central', description: 'Central historic market and dense housing', activeStatus: true },
  { id: 'w-5', name: 'Ward 5 - Jayanagar South', code: 'W-05', zone: 'South', description: 'Southern planned residential avenues', activeStatus: true },
  { id: 'w-6', name: 'Ward 6 - Koramangala Outer', code: 'W-06', zone: 'South', description: 'Southern tech hub and dining corridor', activeStatus: true },
  { id: 'w-7', name: 'Ward 7 - Indiranagar East', code: 'W-07', zone: 'East', description: 'Eastern residential and commercial belt', activeStatus: true },
  { id: 'w-8', name: 'Ward 8 - Rajarajeshwari West', code: 'W-08', zone: 'West', description: 'Western suburban and light industrial zone', activeStatus: true },
];
