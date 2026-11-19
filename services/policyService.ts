import { apiRequest } from "@/lib/apiClient";
import { LocalStore } from "@/lib/localStore";
import { AccessPolicy, DataClassificationLevel, UserRole } from "@/types";

export const policyService = {
  async getPolicies(): Promise<{ data: AccessPolicy[]; isFallback: boolean }> {
    try {
      const res = await apiRequest<AccessPolicy[]>("/api/v1/policies");
      if (!res.isFallback && res.data) {
        return { data: res.data, isFallback: false };
      }
    } catch {
      // offline fallback
    }
    return { data: LocalStore.getPolicies(), isFallback: true };
  },

  async createPolicy(policyData: {
    name: string;
    description: string;
    applicableRoles: UserRole[];
    resourceClassification: DataClassificationLevel;
    allowedActions: ("READ" | "WRITE" | "EXPORT" | "DELETE" | "UPDATE")[];
    hospitalScope: string;
    isActive: boolean;
    riskThreshold?: number;
  }): Promise<AccessPolicy> {
    try {
      const res = await apiRequest<AccessPolicy>("/api/v1/policies", {
        method: "POST",
        body: JSON.stringify(policyData),
      });
      if (!res.isFallback && res.data) {
        LocalStore.createPolicy(res.data);
        return res.data;
      }
    } catch {
      // offline fallback
    }
    return LocalStore.createPolicy(policyData);
  },

  async updatePolicy(id: string, updates: Partial<AccessPolicy>): Promise<AccessPolicy | null> {
    try {
      const res = await apiRequest<AccessPolicy>(`/api/v1/policies/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      if (!res.isFallback && res.data) {
        LocalStore.updatePolicy(id, res.data);
        return res.data;
      }
    } catch {
      // offline fallback
    }
    return LocalStore.updatePolicy(id, updates);
  },
};
