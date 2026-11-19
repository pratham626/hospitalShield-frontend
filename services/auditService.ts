import { apiRequest } from "@/lib/apiClient";
import { LocalStore } from "@/lib/localStore";
import { AuditLog, AccessResult, DataClassificationLevel, UserRole } from "@/types";

export interface AuditLogFilters {
  hospitalId?: string;
  userRole?: string;
  result?: string;
  classification?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
  isFallback: boolean;
}

export const auditService = {
  async getAuditLogs(filters?: AuditLogFilters): Promise<PaginatedResponse<AuditLog>> {
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;

    try {
      const queryParams = new URLSearchParams();
      if (filters?.hospitalId && filters.hospitalId !== "ALL") queryParams.set("hospitalId", filters.hospitalId);
      if (filters?.userRole && filters.userRole !== "ALL") queryParams.set("userRole", filters.userRole);
      if (filters?.result && filters.result !== "ALL") queryParams.set("result", filters.result);
      if (filters?.classification && filters.classification !== "ALL") queryParams.set("classification", filters.classification);
      if (filters?.search) queryParams.set("search", filters.search);
      queryParams.set("page", String(page));
      queryParams.set("limit", String(limit));

      const res = await apiRequest<{ data: AuditLog[]; total: number }>(`/api/v1/audit-logs?${queryParams.toString()}`);
      if (!res.isFallback && res.data?.data) {
        return {
          data: res.data.data,
          total: res.data.total,
          page,
          totalPages: Math.ceil(res.data.total / limit),
          isFallback: false,
        };
      }
    } catch {
      // offline fallback
    }

    let logs = LocalStore.getAuditLogs();

    if (filters?.hospitalId && filters.hospitalId !== "ALL") {
      logs = logs.filter((l) => l.hospitalId === filters.hospitalId);
    }
    if (filters?.userRole && filters.userRole !== "ALL") {
      logs = logs.filter((l) => l.userRole === filters.userRole);
    }
    if (filters?.result && filters.result !== "ALL") {
      logs = logs.filter((l) => l.result === filters.result);
    }
    if (filters?.classification && filters.classification !== "ALL") {
      logs = logs.filter((l) => l.classification === filters.classification);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.eventId.toLowerCase().includes(q) ||
          l.userName.toLowerCase().includes(q) ||
          l.resourceName.toLowerCase().includes(q) ||
          l.hospitalName.toLowerCase().includes(q) ||
          l.ipAddress.includes(q)
      );
    }

    const total = logs.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginated = logs.slice(startIndex, startIndex + limit);

    return {
      data: paginated,
      total,
      page,
      totalPages,
      isFallback: true,
    };
  },

  async getAuditLogById(id: string): Promise<AuditLog | undefined> {
    try {
      const res = await apiRequest<AuditLog>(`/api/v1/audit-logs/${id}`);
      if (!res.isFallback && res.data) {
        return res.data;
      }
    } catch {
      // offline fallback
    }
    return LocalStore.getAuditLogById(id);
  },
};
