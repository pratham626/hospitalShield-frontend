import { apiRequest } from "@/lib/apiClient";
import { LocalStore } from "@/lib/localStore";
import { User, UserRole } from "@/types";

export interface UserFilters {
  role?: string;
  hospitalId?: string;
  search?: string;
  isActive?: boolean;
}

export const userService = {
  async getUsers(filters?: UserFilters): Promise<{ data: User[]; isFallback: boolean }> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.role) queryParams.set("role", filters.role);
      if (filters?.hospitalId && filters.hospitalId !== "ALL") queryParams.set("hospitalId", filters.hospitalId);
      if (filters?.search) queryParams.set("search", filters.search);
      if (filters?.isActive !== undefined) queryParams.set("isActive", String(filters.isActive));

      const queryStr = queryParams.toString() ? `?${queryParams.toString()}` : "";
      const res = await apiRequest<User[]>(`/api/v1/users${queryStr}`);
      if (!res.isFallback && res.data) {
        return { data: res.data, isFallback: false };
      }
    } catch {
      // offline fallback
    }

    let users = LocalStore.getUsers();
    if (filters?.role && filters.role !== "ALL") {
      users = users.filter((u) => u.role === filters.role);
    }
    if (filters?.hospitalId && filters.hospitalId !== "ALL") {
      users = users.filter((u) => u.hospitalId === filters.hospitalId);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.employeeId?.toLowerCase().includes(q) ||
          u.department.toLowerCase().includes(q)
      );
    }
    if (filters?.isActive !== undefined) {
      users = users.filter((u) => u.isActive === filters.isActive);
    }

    return { data: users, isFallback: true };
  },

  async createUser(userData: {
    name: string;
    email: string;
    role: UserRole;
    hospitalId: string;
    department: string;
    employeeId?: string;
  }): Promise<User> {
    const hosp = LocalStore.getHospitalById(userData.hospitalId);
    const payload = {
      ...userData,
      hospitalName: hosp?.name || "General Hospital",
      isActive: true,
    };

    try {
      const res = await apiRequest<User>("/api/v1/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!res.isFallback && res.data) {
        LocalStore.createUser(res.data);
        return res.data;
      }
    } catch {
      // offline fallback
    }

    return LocalStore.createUser(payload);
  },

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const res = await apiRequest<User>(`/api/v1/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      if (!res.isFallback && res.data) {
        LocalStore.updateUser(id, res.data);
        return res.data;
      }
    } catch {
      // offline fallback
    }
    return LocalStore.updateUser(id, updates);
  },

  async updateUserStatus(id: string, isActive: boolean): Promise<User | null> {
    try {
      const res = await apiRequest<User>(`/api/v1/users/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ isActive }),
      });
      if (!res.isFallback && res.data) {
        LocalStore.updateUserStatus(id, isActive);
        return res.data;
      }
    } catch {
      // offline fallback
    }
    return LocalStore.updateUserStatus(id, isActive);
  },
};
