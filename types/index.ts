export type UserRole =
  | "SUPER_ADMIN"
  | "HOSPITAL_ADMIN"
  | "SECURITY_ADMIN"
  | "DOCTOR"
  | "NURSE"
  | "RECEPTIONIST"
  | "LAB_TECHNICIAN"
  | "PHARMACIST"
  | "BILLING_EXECUTIVE";

export type IncidentStatus = "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE";

export type SeverityLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type DataClassificationLevel = "L1" | "L2" | "L3" | "L4";

export type ComplianceStatus = "IMPLEMENTED" | "PARTIAL" | "NOT_IMPLEMENTED" | "NEEDS_REVIEW";

export type AccessResult = "ALLOWED" | "DENIED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  hospitalId: string;
  hospitalName?: string;
  department: string;
  employeeId?: string;
  isActive: boolean;
  lastActive?: string;
  createdAt?: string;
}

export interface Hospital {
  id: string;
  name: string;
  code: string;
  location: string;
  city: string;
  state: string;
  status: "ACTIVE" | "INACTIVE" | "MAINTENANCE";
  bedsCount: number;
  userCount: number;
  openIncidentsCount: number;
  complianceScore: number;
  lastAudit?: string;
  createdAt?: string;
}

export interface ResourceItem {
  id: string;
  name: string;
  type: "PATIENT_RECORD" | "DIAGNOSIS" | "LAB_RESULT" | "PRESCRIPTION" | "BILLING" | "AUDIT_STORE";
  classification: DataClassificationLevel;
  description: string;
  hospitalId?: string;
}

export interface AccessPolicy {
  id: string;
  name: string;
  description: string;
  applicableRoles: UserRole[];
  resourceClassification: DataClassificationLevel;
  allowedActions: ("READ" | "WRITE" | "EXPORT" | "DELETE" | "UPDATE")[];
  hospitalScope: string; // "ALL" or specific hospitalId
  hospitalName?: string;
  isActive: boolean;
  riskThreshold?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuditLog {
  id: string;
  eventId: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  hospitalId: string;
  hospitalName: string;
  resourceId: string;
  resourceName: string;
  resourceType?: string;
  classification: DataClassificationLevel;
  action: "READ" | "WRITE" | "EXPORT" | "DELETE" | "UPDATE";
  result: AccessResult;
  denialReason?: string;
  riskScore: number;
  ipAddress: string;
  userAgent?: string;
  deviceInfo?: string;
  metadata?: Record<string, any>;
}

export interface SecurityIncident {
  id: string;
  incidentNumber: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  riskScore: number;
  status: IncidentStatus;
  affectedUserId: string;
  affectedUserName: string;
  affectedUserRole: UserRole;
  detectionRule: string;
  hospitalId: string;
  hospitalName: string;
  resourceName?: string;
  timestamp: string;
  investigatedBy?: string;
  resolutionNotes?: string;
  updatedAt?: string;
  auditLogId?: string;
}

export interface DashboardSummary {
  totalAccessEvents: number;
  authorizedRequests: number;
  deniedRequests: number;
  openIncidents: number;
  criticalIncidents: number;
  highRiskActivity: number;
  monitoredHospitals: number;
  lastUpdated?: string;
}

export interface ActivityOverTimeItem {
  timestamp: string;
  allowed: number;
  denied: number;
  suspicious: number;
}

export interface SeverityBreakdownItem {
  severity: SeverityLevel;
  count: number;
  color: string;
}

export interface HospitalActivityItem {
  hospitalId: string;
  hospitalName: string;
  totalEvents: number;
  deniedEvents: number;
  incidents: number;
  riskScore: number;
}

export interface ComplianceControlItem {
  id: string;
  framework: "DPDP_ACT" | "CERT_IN" | "ABDM_HDMP" | "HEALTHCARE_ISO";
  controlCode: string;
  title: string;
  description: string;
  status: ComplianceStatus;
  evidenceSummary: string;
  lastReviewed: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM";
}

export interface AuthResponse {
  token: string;
  user: User;
}
