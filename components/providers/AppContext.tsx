"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, Hospital } from "@/types";
import { LocalStore } from "@/lib/localStore";
import { authService } from "@/services/authService";
import { hospitalService } from "@/services/hospitalService";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";

interface AppContextType {
  currentUser: User | null;
  selectedHospital: string;
  setSelectedHospital: (hospId: string) => void;
  hospitals: Hospital[];
  isBackendOnline: boolean;
  forceDemoMode: boolean;
  toggleForceDemoMode: () => void;
  switchUser: (userId: string) => void;
  logout: () => void;
  refreshData: () => void;
  lastRefreshed: Date;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [selectedHospital, setSelectedHospitalState] = useState<string>("ALL");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isBackendOnline, setIsBackendOnline] = useState<boolean>(false);
  const [forceDemoMode, setForceDemoModeState] = useState<boolean>(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const loadHospitals = useCallback(async () => {
    try {
      const res = await hospitalService.getHospitals();
      setHospitals(res.data);
    } catch {
      setHospitals(LocalStore.getHospitals());
    }
  }, []);

  useEffect(() => {
    // Initialize user and stored hospital
    const u = LocalStore.getCurrentUser();
    setCurrentUser(u);
    setSelectedHospitalState(LocalStore.getSelectedHospital());
    setForceDemoModeState(LocalStore.getForceDemoMode());
    loadHospitals();

    // Event listeners
    const handleStatusChange = (e: any) => {
      setIsBackendOnline(Boolean(e.detail?.online));
    };

    const handleUnauthorized = () => {
      router.push("/login");
    };

    const handleUserSwitched = (e: any) => {
      if (e.detail?.user) {
        setCurrentUser(e.detail.user);
        queryClient.invalidateQueries();
      }
    };

    const handleTelemetryUpdated = () => {
      setLastRefreshed(new Date());
      queryClient.invalidateQueries();
    };

    window.addEventListener("backend-status-change", handleStatusChange);
    window.addEventListener("auth-unauthorized", handleUnauthorized);
    window.addEventListener("auth-user-switched", handleUserSwitched);
    window.addEventListener("telemetry-updated", handleTelemetryUpdated);

    return () => {
      window.removeEventListener("backend-status-change", handleStatusChange);
      window.removeEventListener("auth-unauthorized", handleUnauthorized);
      window.removeEventListener("auth-user-switched", handleUserSwitched);
      window.removeEventListener("telemetry-updated", handleTelemetryUpdated);
    };
  }, [loadHospitals, queryClient, router]);

  const setSelectedHospital = (hospId: string) => {
    setSelectedHospitalState(hospId);
    LocalStore.setSelectedHospital(hospId);
    queryClient.invalidateQueries();
  };

  const toggleForceDemoMode = () => {
    const nextVal = !forceDemoMode;
    setForceDemoModeState(nextVal);
    LocalStore.setForceDemoMode(nextVal);
    queryClient.invalidateQueries();
  };

  const switchUser = (userId: string) => {
    const user = authService.switchUserForDemo(userId);
    setCurrentUser(user);
    queryClient.invalidateQueries();
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
    router.push("/login");
  };

  const refreshData = () => {
    setLastRefreshed(new Date());
    queryClient.invalidateQueries();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        selectedHospital,
        setSelectedHospital,
        hospitals,
        isBackendOnline,
        forceDemoMode,
        toggleForceDemoMode,
        switchUser,
        logout,
        refreshData,
        lastRefreshed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
