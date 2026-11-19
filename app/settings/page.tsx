"use client";

import React, { useState } from "react";
import {
  Settings,
  User,
  Shield,
  Bell,
  Server,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  KeyRound,
  Lock,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { LocalStore } from "@/lib/localStore";
import { API_BASE_URL } from "@/lib/apiClient";

export default function SettingsPage() {
  const {
    currentUser,
    logout,
    isBackendOnline,
    forceDemoMode,
    toggleForceDemoMode,
    refreshData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"PROFILE" | "SECURITY" | "BACKEND" | "NOTIFICATIONS">("PROFILE");
  const [sessionTimeout, setSessionTimeout] = useState<string>("15");
  const [requireMFA, setRequireMFA] = useState<boolean>(true);
  const [breakGlassNotice, setBreakGlassNotice] = useState<boolean>(true);
  const [notifyCritical, setNotifyCritical] = useState<boolean>(true);
  const [notifyHourlyDigest, setNotifyHourlyDigest] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleResetData = () => {
    if (confirm("Reset all local telemetry, audit logs, and demo modifications back to factory defaults?")) {
      LocalStore.resetToDefault();
      refreshData();
      alert("Local demo state has been reset to defaults.");
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">System Preferences & SOC Administration</h2>
              <p className="text-xs text-slate-500">
                Configure user profile, SOC operational parameters, backend endpoints, and notification rules.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="text-xs bg-red-50 hover:bg-red-100 text-red-700 font-semibold px-3 py-1.5 rounded-md border border-red-200 flex items-center gap-1.5 transition"
        >
          <LogOut className="w-3.5 h-3.5 text-red-600" />
          <span>Sign Out Session</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Security preferences updated successfully.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-3 pt-2 gap-2 text-xs">
        <button
          onClick={() => setActiveTab("PROFILE")}
          className={`px-3.5 py-2 font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "PROFILE"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Profile</span>
        </button>

        <button
          onClick={() => setActiveTab("SECURITY")}
          className={`px-3.5 py-2 font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "SECURITY"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Security Preferences</span>
        </button>

        <button
          onClick={() => setActiveTab("BACKEND")}
          className={`px-3.5 py-2 font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "BACKEND"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Server className="w-3.5 h-3.5" />
          <span>Backend & Demo Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab("NOTIFICATIONS")}
          className={`px-3.5 py-2 font-medium border-b-2 transition -mb-px flex items-center gap-1.5 ${
            activeTab === "NOTIFICATIONS"
              ? "border-blue-600 text-blue-600 font-bold"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Notification Alerts</span>
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white border border-slate-200 rounded-b-lg p-6 shadow-sm text-xs">
        {/* Tab 1: Profile */}
        {activeTab === "PROFILE" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Healthcare Practitioner / SOC Officer Identity
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-500 font-medium block mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.name || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Official Healthcare Email</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.email || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Authorized Role Privilege</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.role || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-blue-700 font-mono font-bold cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Assigned Hospital / Campus</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.hospitalName || "AIIMS Apex Medical Center"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Department</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.department || ""}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-700 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-slate-500 font-medium block mb-1">Hospital Employee ID</label>
                <input
                  type="text"
                  disabled
                  value={currentUser?.employeeId || "SEC-8821"}
                  className="w-full bg-slate-50 border border-slate-200 rounded-md p-2 text-slate-700 font-mono font-medium cursor-not-allowed"
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 pt-2">
              Identity parameters are synchronized with hospital Active Directory & AWS Cognito. Changes must be requested via Identity Administration.
            </p>
          </div>
        )}

        {/* Tab 2: Security */}
        {activeTab === "SECURITY" && (
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Access & Terminal Security Safeguards
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-slate-700 font-semibold block mb-1">
                  Terminal Inactivity Auto-Lock Timeout
                </label>
                <select
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="w-64 bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-800 text-xs outline-none"
                >
                  <option value="5">5 Minutes (Strict ICU / Outpatient)</option>
                  <option value="15">15 Minutes (Default SOC Desk)</option>
                  <option value="30">30 Minutes (Consultation Workstation)</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={requireMFA}
                    onChange={(e) => setRequireMFA(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      Enforce Hardware FIDO2 / TOTP MFA for L4 Decryption
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Prompts for secondary physical key or authenticator OTP before revealing highly restricted oncology records.
                    </span>
                  </div>
                </label>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breakGlassNotice}
                    onChange={(e) => setBreakGlassNotice(e.target.checked)}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      Mandatory Emergency Break-Glass Justification
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Requires attending physician to input emergency clinical code when overriding standard RBAC access policies.
                    </span>
                  </div>
                </label>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-xs shadow-sm transition"
              >
                Save Security Settings
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Backend & Demo Simulator */}
        {activeTab === "BACKEND" && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Backend Integration & Local Simulation Engine</span>
              <span className="text-xs font-normal">
                Base URL: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">{API_BASE_URL}</code>
              </span>
            </h3>

            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-slate-700" />
                  <span className="font-semibold text-slate-800">Live Backend Connectivity Status</span>
                </div>
                {isBackendOnline && !forceDemoMode ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 border border-emerald-300">
                    CONNECTED (ONLINE)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                    OFFLINE / LOCAL SIMULATOR ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                HospitalShield automatically queries the live REST backend at{" "}
                <code className="text-slate-800 font-bold">{API_BASE_URL}</code>. If the backend is restarting, offline, or unreachable,
                the embedded Zero-Trust telemetry engine immediately handles policy enforcement and preserves audit records in local memory.
              </p>
            </div>

            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <span className="font-semibold text-slate-800 block">Force Standalone Demo Simulation Mode</span>
                  <span className="text-[11px] text-slate-500">
                    Prevents calling remote API endpoints and operates entirely on internal in-memory SOC simulator.
                  </span>
                </div>
                <button
                  onClick={toggleForceDemoMode}
                  className={`px-3 py-1.5 rounded-md font-semibold text-xs transition border ${
                    forceDemoMode
                      ? "bg-amber-600 text-white border-amber-700"
                      : "bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {forceDemoMode ? "Simulation Forced ON" : "Auto-Detect Backend"}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg">
                <div>
                  <span className="font-semibold text-slate-800 block">Reset Simulation Data</span>
                  <span className="text-[11px] text-slate-500">
                    Restore all mock audit events, users, policies, and incident statuses to initial demo baseline.
                  </span>
                </div>
                <button
                  onClick={handleResetData}
                  className="px-3 py-1.5 rounded-md font-semibold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Demo State</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === "NOTIFICATIONS" && (
          <form onSubmit={handleSavePreferences} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              SOC Security Alert Dispatch Configuration
            </h3>

            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyCritical}
                  onChange={(e) => setNotifyCritical(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Real-Time Push Notifications for Critical Severity Incidents
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Instant alerts whenever an unauthorized user queries L4 Highly Restricted clinical diagnosis.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={notifyHourlyDigest}
                  onChange={(e) => setNotifyHourlyDigest(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                />
                <div>
                  <span className="font-semibold text-slate-800 block">
                    Hourly SOC Telemetry Summary Email
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Aggregated digest of authorized vs denied request ratios across all connected hospitals.
                  </span>
                </div>
              </label>
            </div>

            <div className="pt-4 border-t border-slate-200">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-xs shadow-sm transition"
              >
                Save Notification Rules
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
