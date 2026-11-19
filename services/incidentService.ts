import { apiRequest } from "@/lib/apiClient";
import { LocalStore } from "@/lib/localStore";
import { SecurityIncident, IncidentStatus, SeverityLevel } from "@/types";

export interface IncidentFilters {
  status?: string;
  severity?: string;
  hospitalId?: string;
  search?: string;
}

export const incidentService = {
  async getIncidents(filters?: IncidentFilters): Promise<{ data: SecurityIncident[]; isFallback: boolean }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status && filters.status !== "ALL") queryParams.set("status", filters.status);
      if (filters?.severity && filters.severity !== "ALL") queryParams.set("severity", filters.severity);
      if (filters?.hospitalId && filters.hospitalId !== "ALL") queryParams.set("hospitalId", filters.hospitalId);
      if (filters?.search) queryParams.set("search", filters.search);

      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await apiRequest<SecurityIncident[]>(`/api/v1/incidents${queryStr}`);
      if (!res.isFallback && res.data) {
        return { data: res.data, isFallback: false };
      }
    } catch {
      // offline fallback
    }

    let incidents = LocalStore.getIncidents();

    if (filters?.status && filters.status !== "ALL") {
      incidents = incidents.filter((i) => i.status === filters.status);
    }
    if (filters?.severity && filters.severity !== "ALL") {
      incidents = incidents.filter((i) => i.severity === filters.severity);
    }
    if (filters?.hospitalId && filters.hospitalId !== "ALL") {
      incidents = incidents.filter((i) => i.hospitalId === filters.hospitalId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      incidents = incidents.filter(
        (i) =>
          i.incidentNumber.toLowerCase().includes(q) ||
          i.title.toLowerCase().includes(q) ||
          i.affectedUserName.toLowerCase().includes(q) ||
          i.hospitalName.toLowerCase().includes(q) ||
          i.detectionRule.toLowerCase().includes(q)
      );
    }

    return { data: incidents, isFallback: true };
  },

  async getIncidentById(id: string): Promise<SecurityIncident | undefined> {
    try {
      const res = await apiRequest<SecurityIncident>(`/api/v1/incidents/${id}`);
      if (!res.isFallback && res.data) {
        return res.data;
      }
    } catch {
      // offline fallback
    }
    return LocalStore.getIncidentById(id);
  },

  async updateIncidentStatus(
    id: string,
    status: IncidentStatus,
    resolutionNotes?: string,
    investigatedBy?: string
  ): Promise<SecurityIncident | null> {
    const currentUser = LocalStore.getCurrentUser();
    const investigator = investigatedBy || `${currentUser.name} (${currentUser.role})`;

    try {
      const res = await apiRequest<SecurityIncident>(`/api/v1/incidents/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          resolutionNotes,
          investigatedBy: investigator,
        }),
      });
      if (!res.isFallback && res.data) {
        LocalStore.updateIncidentStatus(id, status, resolutionNotes, investigator);
        return res.data;
      }
    } catch {
      // offline fallback
    }

    return LocalStore.updateIncidentStatus(id, status, resolutionNotes, investigator);
  },
};
