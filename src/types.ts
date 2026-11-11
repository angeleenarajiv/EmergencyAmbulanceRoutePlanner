export type UserRole = 'citizen' | 'hospital' | 'admin';
export type UserRoleType = UserRole;

export interface UserProfile {
  role: UserRole;
  name: string;
  email: string;
  badge: string;
  hospitalId?: string;
  ambulanceId?: string;
}

export type AmbulanceStatus = 'IDLE' | 'ACTIVE_EN_ROUTE' | 'ON_SCENE' | 'HOSPITAL_TRANSIT' | 'MAINTENANCE';

export interface AmbulanceUnit {
  id: string;
  name: string;
  code: string;
  status: AmbulanceStatus;
  currentLocationNodeId: string;
  assignedIncidentId?: string;
  lead: string;
  driver: string;
  level: string; // e.g. Mobile ICU Trauma Unit, Advanced Life Support (ALS), Basic Life Support (BLS)
  fuelPercent: number;
}

export type DiversionStatus = 'operational' | 'advisory' | 'divert';

export interface GraphNode {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  lat: number;
  lng: number;
  type: 'hospital' | 'ambulance_station' | 'incident' | 'junction';
  beds?: { free: number; total: number };
  icuAvailable?: number;
  traumaLevel?: string;
  emergencyPhone?: string;
  diversionStatus?: DiversionStatus;
  ventilatorsAvailable?: number;
  oxygenReservePercent?: number;
  lastUpdatedTime?: string;
  stationUnit?: {
    name: string;
    code: string;
    lead: string;
    driver: string;
    level: string;
    status: string;
  };
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  distanceKm: number;
  congestion: 1.0 | 2.2 | 4.0 | 999.0; // 1 = Normal, 2.2 = Moderate, 4.0 = Heavy Jam, 999 = Closed
  name?: string;
}

export interface DispatchLog {
  id: string;
  time: string;
  title: string;
  description: string;
  author: string;
}

export interface SceneDocument {
  id: string;
  name: string;
  size: string;
  type: 'image' | 'pdf';
  url?: string;
}

export interface AiVerificationDetails {
  verified: boolean;
  confidenceScore: number; // e.g. 98.4
  severityConfirmed: 'Code Red • Critical' | 'Code Yellow • High' | 'Code Green • Moderate';
  reasoning: string;
  timestamp: string;
  model: string;
  suggestedAction: string;
  triagePriority: 'IMMEDIATE' | 'URGENT' | 'DELAYED';
  detectedRisks?: string[];
}

export interface AdminNotification {
  id: string;
  incidentId: string;
  incidentCode: string;
  title: string;
  location: string;
  severity: string;
  confidence: number;
  timestamp: string;
  isRead: boolean;
  ambulanceName?: string;
  hospitalName?: string;
  routeEtaMinutes?: number;
}

export interface IncidentReport {
  id: string;
  code: string;
  title: string;
  locationDetails: string;
  severity: 'Code Red • Critical' | 'Code Yellow • High' | 'Code Green • Moderate';
  timestamp: string;
  nodeId: string;
  assignedAmbulanceId: string;
  assignedStationId?: string;
  targetHospitalId: string;
  casualties: number;
  vehiclesInvolved: number;
  tags: string[];
  isVerifiedByAdmin: boolean;
  isVerifiedByAi?: boolean;
  aiVerification?: AiVerificationDetails;
  statusStep: number; // 1: Reported, 2: Verified, 3: Ambulance En Route, 4: On Scene, 5: Hospital Transit, 6: Resolved
  sceneDocuments: SceneDocument[];
  logs: DispatchLog[];
}

