"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Radio,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Flame,
  Search,
  RotateCcw,
  Shield,
  Play,
  Pause,
  ExternalLink,
  Laptop,
  Building,
  User as UserIcon,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { auditService } from "@/services/auditService";
import { resourceService } from "@/services/resourceService";
import { AuditLog, UserRole } from "@/types";
import { formatDateTime, formatTimeAgo } from "@/lib/utils";

export default function SecurityMonitoringPage() {
  const { selectedHospital, currentUser, refreshData } = useApp();
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedResult, setSelectedResult] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isLivePolling, setIsLivePolling] = useState<boolean>(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [activeLogDetail, setActiveLogDetail] = useState<AuditLog | null>(null);

  // Live polling query
  const { data: logsRes, refetch } = useQuery({
    queryKey: ["live-monitoring", selectedHospital, selectedRole, selectedResult, selectedClassification, searchQuery],
    queryFn: async () => {
      setLastUpdated(new Date());
      return auditService.getAuditLogs({
        hospitalId: selectedHospital,
        userRole: selectedRole,
        result: selectedResult,
        classification: selectedClassification,
        search: searchQuery,
        limit: 30,
      });
    },
    refetchInterval: isLivePolling ? 4000 : false,
  });

  const logs = logsRes?.data || [];

  // Risk score visual badge
  const getRiskScoreBadge = (score: number) => {
    if (score >= 80) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300">
          <Flame className="w-3 h-3 text-red-600" />
          {score}/100 CRITICAL
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          {score}/100 ELEVATED
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
        {score}/100 LOW
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header & Live Polling Status */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <Radio className={`w-5 h-5 ${isLivePolling ? "animate-pulse text-blue-600" : "text-slate-400"}`} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Real-Time Security Telemetry Feed</h2>
              <p className="text-xs text-slate-500">
                Continuous ingestion of access authorization decisions, network nodes, and detection rules.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-md text-xs font-mono">
            <span
              className={`h-2 w-2 rounded-full ${
                isLivePolling ? "bg-emerald-500 animate-ping" : "bg-slate-400"
              }`}
            ></span>
            <span className="text-slate-600">
              {isLivePolling ? "Live Polling (4s)" : "Paused"}
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-slate-500">{formatTimeAgo(lastUpdated)}</span>
          </div>

          <button
            onClick={() => setIsLivePolling(!isLivePolling)}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
              isLivePolling
                ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
            }`}
          >
            {isLivePolling ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume Feed</span>
              </>
            )}
          </button>

          <button
            onClick={() => {
              refetch();
              refreshData();
            }}
            className="p-1.5 rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            title="Manual refresh"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search event, user, IP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-52"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
            <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
            <option value="DOCTOR">DOCTOR</option>
            <option value="NURSE">NURSE</option>
            <option value="RECEPTIONIST">RECEPTIONIST</option>
            <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
            <option value="PHARMACIST">PHARMACIST</option>
            <option value="BILLING_EXECUTIVE">BILLING_EXECUTIVE</option>
          </select>

          {/* Result Filter */}
          <select
            value={selectedResult}
            onChange={(e) => setSelectedResult(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Results</option>
            <option value="ALLOWED">Allowed Only</option>
            <option value="DENIED">Denied / Intercepted</option>
          </select>

          {/* Classification Filter */}
          <select
            value={selectedClassification}
            onChange={(e) => setSelectedClassification(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Classifications</option>
            <option value="L1">L1: PUBLIC</option>
            <option value="L2">L2: INTERNAL</option>
            <option value="L3">L3: CONFIDENTIAL</option>
            <option value="L4">L4: HIGHLY_RESTRICTED</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong>{logs.length}</strong> live events
        </div>
      </div>

      {/* Live Event Stream Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono text-[11px]">
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Principal (User & Role)</th>
                <th className="py-2.5 px-3">Hospital</th>
                <th className="py-2.5 px-3">Resource & Level</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Risk Score</th>
                <th className="py-2.5 px-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No access events matching the selected filters.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isDenied = log.result === "DENIED";
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setActiveLogDetail(log)}
                      className={`cursor-pointer transition-colors ${
                        isDenied ? "bg-red-50/40 hover:bg-red-50/80" : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="py-2.5 px-3">
                        {isDenied ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                            <XCircle className="w-3 h-3 text-red-600" />
                            <span>DENIED</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ALLOW</span>
                          </span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px]">
                        {log.eventId}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 leading-tight">{log.userName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{log.userRole}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[130px]" title={log.hospitalName}>
                        {log.hospitalName}
                      </td>
                      <td className="py-2.5 px-3 max-w-[200px]">
                        <div className="truncate font-medium text-slate-800" title={log.resourceName}>
                          {log.resourceName}
                        </div>
                        <span
                          className={`text-[9px] font-mono px-1 rounded font-bold ${
                            log.classification === "L4"
                              ? "bg-red-100 text-red-800 border border-red-200"
                              : log.classification === "L3"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {log.classification}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-700 text-[11px]">
                        {log.action}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {getRiskScoreBadge(log.riskScore)}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLogDetail(log);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50 transition"
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Event Details Drawer / Modal */}
      {activeLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {activeLogDetail.eventId}
                    </span>
                    {activeLogDetail.result === "DENIED" ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-100 text-red-700 border border-red-200">
                        INTERCEPTED & DENIED
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                        AUTHORIZED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Recorded: {formatDateTime(activeLogDetail.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveLogDetail(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] text-xs">
                {/* Denial Reason Banner */}
                {activeLogDetail.denialReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
                    <div className="font-bold flex items-center gap-1.5">
                      <XCircle className="w-4 h-4 text-red-600" />
                      <span>Access Denial Justification</span>
                    </div>
                    <p className="text-[11px] leading-relaxed font-sans">{activeLogDetail.denialReason}</p>
                  </div>
                )}

                {/* Principal Info */}
                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    User Principal
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Name</span>
                      <strong className="text-slate-800">{activeLogDetail.userName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Role</span>
                      <strong className="text-blue-600 font-mono">{activeLogDetail.userRole}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Hospital</span>
                      <span className="text-slate-700">{activeLogDetail.hospitalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Risk Score</span>
                      {getRiskScoreBadge(activeLogDetail.riskScore)}
                    </div>
                  </div>
                </div>

                {/* Resource Info */}
                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Target Resource
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Resource Name</span>
                      <strong className="text-slate-800">{activeLogDetail.resourceName}</strong>
                    </div>
                    <div className="flex gap-4 pt-1">
                      <div>
                        <span className="text-slate-500 block">Classification</span>
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                          {activeLogDetail.classification}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Action Attempted</span>
                        <span className="font-mono font-bold text-slate-800">{activeLogDetail.action}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Network & Device Telemetry */}
                <div className="border border-slate-200 rounded-lg p-3 bg-white space-y-2">
                  <div className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
                    Network & Device Telemetry
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source IP Address:</span>
                      <span className="font-mono text-slate-800 font-medium">{activeLogDetail.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Origin Terminal:</span>
                      <span className="text-slate-800">{activeLogDetail.deviceInfo || "Standard Workstation"}</span>
                    </div>
                    {activeLogDetail.userAgent && (
                      <div className="pt-1">
                        <span className="text-slate-500 block">User-Agent:</span>
                        <span className="text-[10px] text-slate-600 font-mono break-all">
                          {activeLogDetail.userAgent}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveLogDetail(null)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-md text-xs transition"
              >
                Close Drawer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
