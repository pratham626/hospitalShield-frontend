import { apiRequest } from "@/lib/apiClient";
import { LocalStore } from "@/lib/localStore";
import { ResourceItem, AccessResult } from "@/types";

export interface AccessAttemptResult {
  allowed: boolean;
  resource: ResourceItem;
  reason?: string;
  auditEventId?: string;
  incidentCreated?: boolean;
  incidentId?: string;
  riskScore: number;
}

export const resourceService = {
  async getResources(): Promise<{ data: ResourceItem[]; isFallback: boolean }> {
    try {
      const res = await apiRequest<ResourceItem[]>("/api/v1/resources");
      if (!res.isFallback && res.data) {
        return { data: res.data, isFallback: false };
      }
    } catch {
      // offline fallback
    }
    return { data: LocalStore.getResources(), isFallback: true };
  },

  async attemptAccess(resourceId: string, action: "READ" | "WRITE" | "EXPORT" = "READ"): Promise<AccessAttemptResult> {
    const user = LocalStore.getCurrentUser();
    const resource = LocalStore.getResourceById(resourceId) || LocalStore.getResources()[0];

    // Try calling backend endpoint if available
    try {
      const res = await apiRequest<AccessAttemptResult>(`/api/v1/resources/${resourceId}/access`, {
        method: "POST",
        body: JSON.stringify({ action, userId: user.id }),
      });
      if (!res.isFallback && res.data) {
        return res.data;
      }
    } catch (err: any) {
      if (err.status === 403) {
        // Backend actively returned 403 Forbidden!
        return {
          allowed: false,
          resource,
          reason: err.data?.message || err.message || "403 Forbidden: Access Denied by Backend RBAC Engine",
          riskScore: 92,
        };
      }
    }

    // Local evaluation engine
    const policies = LocalStore.getPolicies().filter((p) => p.isActive);
    const applicablePolicy = policies.find(
      (p) =>
        p.resourceClassification === resource.classification &&
        (p.hospitalScope === "ALL" || p.hospitalScope === user.hospitalId)
    );

    const isRoleAllowed = applicablePolicy?.applicableRoles.includes(user.role);
    const isActionAllowed = applicablePolicy?.allowedActions.includes(action);

    const isAllowed = Boolean(isRoleAllowed && isActionAllowed);
    const riskScore = isAllowed ? 15 : (resource.classification === "L4" ? 92 : 65);
    const reason = isAllowed
      ? `Access granted under policy: ${applicablePolicy?.name || "Standard Read"}`
      : `RBAC Violation: Role ${user.role} is strictly unauthorized to perform ${action} on ${resource.classification} classified resource: "${resource.name}".`;

    // Record in audit log
    const auditLog = LocalStore.addAuditLog({
      timestamp: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
      userRole: user.role,
      hospitalId: user.hospitalId || "hosp-1",
      hospitalName: user.hospitalName || "AIIMS Apex Medical Center",
      resourceId: resource.id,
      resourceName: resource.name,
      resourceType: resource.type,
      classification: resource.classification,
      action,
      result: isAllowed ? "ALLOWED" : "DENIED",
      denialReason: isAllowed ? undefined : reason,
      riskScore,
      ipAddress: "10.14.2.89",
      deviceInfo: `Client Terminal (${user.department})`,
      metadata: {
        enforcedPolicyId: applicablePolicy?.id || "NONE",
        timestampUtc: new Date().toUTCString(),
      },
    });

    let incidentCreated = false;
    let incidentId: string | undefined = undefined;

    // If denied and risk score >= 75, create Security Incident automatically
    if (!isAllowed && riskScore >= 75) {
      const incident = LocalStore.addIncident({
        title: `Unauthorized ${resource.classification} Access Attempt by ${user.role}`,
        description: `User ${user.name} (${user.role}) initiated unauthorized ${action} query towards protected healthcare record "${resource.name}". Request was intercepted and denied by HospitalShield Policy Enforcement Point.`,
        severity: resource.classification === "L4" ? "CRITICAL" : "HIGH",
        riskScore,
        status: "OPEN",
        affectedUserId: user.id,
        affectedUserName: user.name,
        affectedUserRole: user.role,
        detectionRule: `RULE-HS-RBAC-${resource.classification}: Unauthorized Clinical Record Traversal`,
        hospitalId: user.hospitalId || "hosp-1",
        hospitalName: user.hospitalName || "AIIMS Apex Medical Center",
        resourceName: resource.name,
        timestamp: new Date().toISOString(),
        auditLogId: auditLog.id,
      });
      incidentCreated = true;
      incidentId = incident.id;
    }

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("telemetry-updated"));
    }

    return {
      allowed: isAllowed,
      resource,
      reason,
      auditEventId: auditLog.eventId,
      incidentCreated,
      incidentId,
      riskScore,
    };
  },
};
