"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Layers,
  ArrowUpDown,
  FileSpreadsheet,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { auditService } from "@/services/auditService";
import { AuditLog } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function AuditLogsPage() {
  const { selectedHospital } = useApp();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [selectedResult, setSelectedResult] = useState<string>("ALL");
  const [selectedClassification, setSelectedClassification] = useState<string>("ALL");
  const [activeLog, setActiveLog] = useState<AuditLog | null>(null);

  const { data: logsRes, isLoading } = useQuery({
    queryKey: [
      "audit-logs",
      selectedHospital,
      currentPage,
      pageSize,
      searchQuery,
      selectedRole,
      selectedResult,
      selectedClassification,
    ],
    queryFn: () =>
      auditService.getAuditLogs({
        hospitalId: selectedHospital,
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        userRole: selectedRole,
        result: selectedResult,
        classification: selectedClassification,
      }),
  });

  const logs = logsRes?.data || [];
  const total = logsRes?.total || 0;
  const totalPages = logsRes?.totalPages || 1;

  // Export logs to JSON
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `HospitalShield_AuditLogs_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Cryptographic System Audit Trail</h2>
              <p className="text-xs text-slate-500">
                Immutable, hash-chained log repository fulfilling CERT-In 180-day compliance and DPDP audit obligations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportJson}
            className="px-3 py-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CERT-In Archive</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search Event ID, User, Resource..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-56"
            />
          </div>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => {
              setSelectedRole(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Roles</option>
            <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
            <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
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
            onChange={(e) => {
              setSelectedResult(e.target.value);
              setCurrentPage(1);
            }}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Results</option>
            <option value="ALLOWED">Allowed Only</option>
            <option value="DENIED">Denied Only</option>
          </select>

          {/* Classification Filter */}
          <select
            value={selectedClassification}
            onChange={(e) => {
              setSelectedClassification(e.target.value);
              setCurrentPage(1);
            }}
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
          Showing <strong>{logs.length}</strong> of <strong>{total}</strong> records
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono text-[11px]">
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">User & Role</th>
                <th className="py-2.5 px-3">Hospital</th>
                <th className="py-2.5 px-3">Target Resource</th>
                <th className="py-2.5 px-3 text-center">Class</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3 text-center">Result</th>
                <th className="py-2.5 px-3">Denial Reason / Rationale</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    Loading audit records...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400">
                    No audit records found matching criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const isDenied = log.result === "DENIED";
                  return (
                    <tr
                      key={log.id}
                      onClick={() => setActiveLog(log)}
                      className={`cursor-pointer transition-colors ${
                        isDenied ? "bg-red-50/30 hover:bg-red-50/70" : "hover:bg-slate-50/70"
                      }`}
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900 text-[11px]">
                        {log.eventId}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                        {formatDateTime(log.timestamp)}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-slate-900 leading-tight">{log.userName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{log.userRole}</div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] truncate max-w-[130px]" title={log.hospitalName}>
                        {log.hospitalName}
                      </td>
                      <td className="py-2.5 px-3 max-w-[180px] truncate" title={log.resourceName}>
                        <span className="font-medium text-slate-800">{log.resourceName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`font-mono text-[9px] px-1.5 py-0.5 rounded font-bold ${
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
                      <td className="py-2.5 px-3 text-center">
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
                      <td className="py-2.5 px-3 max-w-[220px]">
                        {log.denialReason ? (
                          <span className="text-red-700 text-[11px] line-clamp-1" title={log.denialReason}>
                            {log.denialReason}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Authorized Policy Match</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveLog(log);
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Bar */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-white border border-slate-200 rounded px-1.5 py-1 text-xs outline-none"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-slate-400 font-mono ml-2">
              Page {currentPage} of {totalPages}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      {activeLog && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-900">{activeLog.eventId}</span>
                  <div className="text-[11px] text-slate-500 mt-0.5">{formatDateTime(activeLog.timestamp)}</div>
                </div>
                <button
                  onClick={() => setActiveLog(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(100vh-140px)] text-xs">
                {activeLog.denialReason && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 space-y-1">
                    <span className="font-bold flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-red-600" />
                      Interception Justification
                    </span>
                    <p className="text-[11px] leading-relaxed">{activeLog.denialReason}</p>
                  </div>
                )}

                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="font-bold font-mono uppercase text-slate-900 text-xs">Access Context</div>
                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">User</span>
                      <strong className="text-slate-800">{activeLog.userName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Role</span>
                      <span className="font-mono text-blue-600 font-bold">{activeLog.userRole}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Hospital</span>
                      <span className="text-slate-700">{activeLog.hospitalName}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Risk Score</span>
                      <span className="font-mono font-bold text-slate-900">{activeLog.riskScore} / 100</span>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="font-bold font-mono uppercase text-slate-900 text-xs">Resource & Action</div>
                  <div className="space-y-1 text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Resource Name</span>
                      <strong className="text-slate-800">{activeLog.resourceName}</strong>
                    </div>
                    <div className="flex gap-4 pt-1">
                      <div>
                        <span className="text-slate-500 block">Classification</span>
                        <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1 rounded">
                          {activeLog.classification}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">Action</span>
                        <span className="font-mono font-bold text-slate-800">{activeLog.action}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border border-slate-200 rounded-lg p-3 space-y-2">
                  <div className="font-bold font-mono uppercase text-slate-900 text-xs">Network Origin & Host</div>
                  <div className="space-y-1 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Source IP:</span>
                      <span className="font-mono text-slate-800">{activeLog.ipAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Device Location:</span>
                      <span className="text-slate-800">{activeLog.deviceInfo || "Hospital LAN Terminal"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveLog(null)}
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
