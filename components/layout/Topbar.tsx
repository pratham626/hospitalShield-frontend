"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import {
  RotateCcw,
  Bell,
  Building,
  ChevronDown,
  User as UserIcon,
  ShieldAlert,
  Server,
  Radio,
  Sparkles,
  Check,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { formatTimeAgo } from "@/lib/utils";
import { INITIAL_USERS } from "@/services/mockData";

export default function Topbar() {
  const pathname = usePathname();
  const {
    currentUser,
    selectedHospital,
    setSelectedHospital,
    hospitals,
    isBackendOnline,
    forceDemoMode,
    toggleForceDemoMode,
    switchUser,
    refreshData,
    lastRefreshed,
  } = useApp();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Map path to human friendly title & breadcrumbs
  const getPageInfo = () => {
    if (pathname.startsWith("/monitoring")) return { title: "Security Monitoring", breadcrumb: "Operations" };
    if (pathname.startsWith("/audit-logs")) return { title: "Audit Logs", breadcrumb: "Compliance & Auditing" };
    if (pathname.startsWith("/incidents")) return { title: "Security Incidents", breadcrumb: "SOC Response" };
    if (pathname.startsWith("/users")) return { title: "Users & Roles", breadcrumb: "Identity & Access" };
    if (pathname.startsWith("/policies")) return { title: "Access Policies", breadcrumb: "Policy Engine" };
    if (pathname.startsWith("/data-classification")) return { title: "Data Classification", breadcrumb: "Data Governance" };
    if (pathname.startsWith("/compliance")) return { title: "Compliance Center", breadcrumb: "Regulatory Standards" };
    if (pathname.startsWith("/hospitals")) return { title: "Hospital Management", breadcrumb: "Infrastructure" };
    if (pathname.startsWith("/settings")) return { title: "System Settings", breadcrumb: "Administration" };
    return { title: "Overview Dashboard", breadcrumb: "Executive Summary" };
  };

  const { title, breadcrumb } = getPageInfo();

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Role badge color helper
  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "SECURITY_ADMIN":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "HOSPITAL_ADMIN":
        return "bg-indigo-100 text-indigo-700 border-indigo-300";
      case "DOCTOR":
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
      case "NURSE":
        return "bg-teal-100 text-teal-700 border-teal-300";
      case "RECEPTIONIST":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(0,0,0,0.03)] z-20">
      {/* Left: Title & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <span>HospitalShield</span>
          <span>/</span>
          <span className="text-slate-700">{breadcrumb}</span>
        </div>
        <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">{title}</h1>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Backend Online / Demo Indicator */}
        <div className="hidden lg:flex items-center">
          {isBackendOnline && !forceDemoMode ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Backend Connected</span>
            </div>
          ) : (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200"
              title="Real backend offline or simulation mode active. Operating on local SOC engine with full persistence."
            >
              <Server className="w-3.5 h-3.5 text-amber-600" />
              <span>Demo SOC Engine</span>
              <span className="bg-amber-200/80 text-amber-900 text-[10px] font-mono px-1.5 rounded font-bold">
                SIMULATION
              </span>
            </div>
          )}
        </div>

        {/* Authorized Hospital Selector */}
        <div className="relative flex items-center">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-xs text-slate-700 hover:border-slate-300 transition-colors">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 outline-none cursor-pointer pr-1"
            >
              <option value="ALL">All Authorized Hospitals ({hospitals.length})</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Refresh Button */}
        <button
          onClick={handleRefresh}
          className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1 text-xs"
          title="Refresh telemetry"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-blue-600" : ""}`} />
          <span className="hidden sm:inline text-[11px] text-slate-500 font-mono">
            {formatTimeAgo(lastRefreshed)}
          </span>
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-all"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-600 text-[9px] font-bold text-white">
              2
            </span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Security Alerts</span>
                <span className="text-[10px] text-blue-600 font-medium cursor-pointer hover:underline">
                  Mark all read
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                <div className="p-3 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-1.5 text-red-600 font-semibold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Critical: L4 Diagnosis Access Denied</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Sunita Rao (RECEPTIONIST) attempted unauthorized query to Oncology notes.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">3 mins ago • AIIMS Delhi</span>
                </div>
                <div className="p-3 hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-1.5 text-amber-600 font-semibold text-[11px]">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Warning: Bulk EMR Export Intercepted</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5">
                    Finance terminal query exceeded velocity thresholds.
                  </p>
                  <span className="text-[10px] text-slate-400 mt-1 block">2 hours ago • Max Mumbai</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Demo Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all text-left"
          >
            <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold font-mono">
              {currentUser?.name
                ? currentUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                : "HS"}
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-xs font-semibold text-slate-900 leading-tight">
                {currentUser?.name || "Guest User"}
              </span>
              <div className="flex items-center gap-1">
                <span
                  className={`text-[9px] font-mono font-bold px-1 py-0.2 rounded border ${getRoleBadgeColor(
                    currentUser?.role
                  )}`}
                >
                  {currentUser?.role || "GUEST"}
                </span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100">
                <div className="text-xs font-bold text-slate-900">{currentUser?.name}</div>
                <div className="text-[11px] text-slate-500">{currentUser?.email}</div>
                <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                  {currentUser?.department} • ID: {currentUser?.employeeId || "N/A"}
                </div>
              </div>

              {/* Demo Fast Persona Switcher */}
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100">
                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-700 mb-1.5">
                  <Sparkles className="w-3 h-3 text-blue-600" />
                  <span>Demo Persona Switcher</span>
                </div>
                <div className="space-y-1">
                  {INITIAL_USERS.slice(0, 4).map((u) => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1 rounded text-[11px] flex items-center justify-between transition-colors ${
                        currentUser?.id === u.id
                          ? "bg-blue-50 text-blue-700 font-semibold border border-blue-200"
                          : "text-slate-600 hover:bg-slate-200/60"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span>{u.name}</span>
                        <span className="text-[9px] text-slate-400">{u.role}</span>
                      </div>
                      {currentUser?.id === u.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-1">
                <a
                  href="/settings"
                  className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Account Settings
                </a>
                <a
                  href="/login"
                  className="block px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors"
                >
                  Sign Out
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
