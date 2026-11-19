import {
  User,
  Hospital,
  ResourceItem,
  AccessPolicy,
  AuditLog,
  SecurityIncident,
  ComplianceControlItem,
  IncidentStatus,
  UserRole,
} from "@/types";
import {
  INITIAL_HOSPITALS,
  INITIAL_USERS,
  INITIAL_RESOURCES,
  INITIAL_POLICIES,
  INITIAL_AUDIT_LOGS,
  INITIAL_INCIDENTS,
  INITIAL_COMPLIANCE_CONTROLS,
} from "@/services/mockData";

const STORAGE_KEYS = {
  HOSPITALS: "hs_hospitals",
  USERS: "hs_users",
  RESOURCES: "hs_resources",
  POLICIES: "hs_policies",
  AUDIT_LOGS: "hs_audit_logs",
  INCIDENTS: "hs_incidents",
  COMPLIANCE: "hs_compliance",
  CURRENT_USER: "hs_current_user",
  AUTH_TOKEN: "hs_auth_token",
  SELECTED_HOSPITAL: "hs_selected_hospital",
  FORCE_DEMO_MODE: "hs_force_demo_mode",
};

function getStoredItem<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.warn(`Error reading localStorage for key ${key}`, e);
    return fallback;
  }
}

function setStoredItem<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error setting localStorage for key ${key}`, e);
  }
}

export class LocalStore {
  // Hospitals
  static getHospitals(): Hospital[] {
    return getStoredItem<Hospital[]>(STORAGE_KEYS.HOSPITALS, INITIAL_HOSPITALS);
  }

  static getHospitalById(id: string): Hospital | undefined {
    return this.getHospitals().find((h) => h.id === id);
  }

  // Users
  static getUsers(): User[] {
    return getStoredItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  static getUserById(id: string): User | undefined {
    return this.getUsers().find((u) => u.id === id);
  }

  static getUserByEmail(email: string): User | undefined {
    return this.getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  static createUser(user: Omit<User, "id">): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `usr-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
    };
    users.unshift(newUser);
    setStoredItem(STORAGE_KEYS.USERS, users);
    return newUser;
  }

  static updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    setStoredItem(STORAGE_KEYS.USERS, users);
    return users[idx];
  }

  static updateUserStatus(id: string, isActive: boolean): User | null {
    return this.updateUser(id, { isActive });
  }

  // Resources
  static getResources(): ResourceItem[] {
    return getStoredItem<ResourceItem[]>(STORAGE_KEYS.RESOURCES, INITIAL_RESOURCES);
  }

  static getResourceById(id: string): ResourceItem | undefined {
    return this.getResources().find((r) => r.id === id);
  }

  // Policies
  static getPolicies(): AccessPolicy[] {
    return getStoredItem<AccessPolicy[]>(STORAGE_KEYS.POLICIES, INITIAL_POLICIES);
  }

  static getPolicyById(id: string): AccessPolicy | undefined {
    return this.getPolicies().find((p) => p.id === id);
  }

  static createPolicy(policy: Omit<AccessPolicy, "id">): AccessPolicy {
    const policies = this.getPolicies();
    const newPolicy: AccessPolicy = {
      ...policy,
      id: `pol-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    policies.unshift(newPolicy);
    setStoredItem(STORAGE_KEYS.POLICIES, policies);
    return newPolicy;
  }

  static updatePolicy(id: string, updates: Partial<AccessPolicy>): AccessPolicy | null {
    const policies = this.getPolicies();
    const idx = policies.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    policies[idx] = { ...policies[idx], ...updates, updatedAt: new Date().toISOString() };
    setStoredItem(STORAGE_KEYS.POLICIES, policies);
    return policies[idx];
  }

  // Audit Logs
  static getAuditLogs(): AuditLog[] {
    return getStoredItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  }

  static getAuditLogById(id: string): AuditLog | undefined {
    return this.getAuditLogs().find((a) => a.id === id || a.eventId === id);
  }

  static addAuditLog(log: Omit<AuditLog, "id" | "eventId">): AuditLog {
    const logs = this.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `aud-${Date.now().toString(36)}`,
      eventId: `EVT-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setStoredItem(STORAGE_KEYS.AUDIT_LOGS, logs);
    return newLog;
  }

  // Incidents
  static getIncidents(): SecurityIncident[] {
    return getStoredItem<SecurityIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_INCIDENTS);
  }

  static getIncidentById(id: string): SecurityIncident | undefined {
    return this.getIncidents().find((i) => i.id === id || i.incidentNumber === id);
  }

  static addIncident(incident: Omit<SecurityIncident, "id" | "incidentNumber">): SecurityIncident {
    const incidents = this.getIncidents();
    const newIncident: SecurityIncident = {
      ...incident,
      id: `inc-${Date.now().toString(36)}`,
      incidentNumber: `HS-INC-2026-${String(incidents.length + 90).padStart(3, "0")}`,
      timestamp: new Date().toISOString(),
    };
    incidents.unshift(newIncident);
    setStoredItem(STORAGE_KEYS.INCIDENTS, incidents);
    return newIncident;
  }

  static updateIncidentStatus(
    id: string,
    status: IncidentStatus,
    resolutionNotes?: string,
    investigatedBy?: string
  ): SecurityIncident | null {
    const incidents = this.getIncidents();
    const idx = incidents.findIndex((i) => i.id === id || i.incidentNumber === id);
    if (idx === -1) return null;
    incidents[idx] = {
      ...incidents[idx],
      status,
      resolutionNotes: resolutionNotes !== undefined ? resolutionNotes : incidents[idx].resolutionNotes,
      investigatedBy: investigatedBy !== undefined ? investigatedBy : incidents[idx].investigatedBy,
      updatedAt: new Date().toISOString(),
    };
    setStoredItem(STORAGE_KEYS.INCIDENTS, incidents);
    return incidents[idx];
  }

  // Compliance
  static getComplianceControls(): ComplianceControlItem[] {
    return getStoredItem<ComplianceControlItem[]>(STORAGE_KEYS.COMPLIANCE, INITIAL_COMPLIANCE_CONTROLS);
  }

  // Current session & token
  static getCurrentUser(): User {
    // Default logged in user is Security Admin Rahul Sharma
    return getStoredItem<User>(STORAGE_KEYS.CURRENT_USER, INITIAL_USERS[0]);
  }

  static setCurrentUser(user: User): void {
    setStoredItem(STORAGE_KEYS.CURRENT_USER, user);
  }

  static getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
  }

  static setAuthToken(token: string | null): void {
    if (typeof window === "undefined") return;
    if (token) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  }

  static getSelectedHospital(): string {
    return getStoredItem<string>(STORAGE_KEYS.SELECTED_HOSPITAL, "ALL");
  }

  static setSelectedHospital(hospId: string): void {
    setStoredItem(STORAGE_KEYS.SELECTED_HOSPITAL, hospId);
  }

  static getForceDemoMode(): boolean {
    return getStoredItem<boolean>(STORAGE_KEYS.FORCE_DEMO_MODE, false);
  }

  static setForceDemoMode(val: boolean): void {
    setStoredItem(STORAGE_KEYS.FORCE_DEMO_MODE, val);
  }

  static resetToDefault(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEYS.HOSPITALS);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.RESOURCES);
    localStorage.removeItem(STORAGE_KEYS.POLICIES);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.COMPLIANCE);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  }
}
