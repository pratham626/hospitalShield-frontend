import { apiRequest } from "@/lib/apiClient";
import { LocalStore } from "@/lib/localStore";
import { Hospital } from "@/types";

export const hospitalService = {
  async getHospitals(): Promise<{ data: Hospital[]; isFallback: boolean }> {
    try {
      const res = await apiRequest<Hospital[]>("/api/v1/hospitals");
      if (!res.isFallback && res.data) {
        return { data: res.data, isFallback: false };
      }
    } catch {
      // offline fallback
    }
    return { data: LocalStore.getHospitals(), isFallback: true };
  },

  async getHospitalById(id: string): Promise<Hospital | undefined> {
    try {
      const res = await apiRequest<Hospital>(`/api/v1/hospitals/${id}`);
      if (!res.isFallback && res.data) {
        return res.data;
      }
    } catch {
      // offline fallback
    }
    return LocalStore.getHospitalById(id);
  },
};
