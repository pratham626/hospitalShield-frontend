"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  Flame,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  UserCheck,
  Building,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { incidentService } from "@/services/incidentService";
import { SecurityIncident, IncidentStatus, SeverityLevel } from "@/types";
import { formatDateTime, formatTimeAgo } from "@/lib/utils";

export default function SecurityIncidentsPage() {
  const { selectedHospital, currentUser, refreshData } = useApp();
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeIncident, setActiveIncident] = useState<SecurityIncident | null>(null);

  // Status update state
  const [newStatus, setNewStatus] = useState<IncidentStatus>("INVESTIGATING");
  const [resolutionNotes, setResolutionNotes] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [updateSuccess, setUpdateSuccess] = useState<boolean>(false);

  const { data: incidentsRes, refetch, isLoading } = useQuery({
    queryKey: ["incidents-list", selectedHospital, selectedStatus, selectedSeverity, searchQuery],
    queryFn: () =>
      incidentService.getIncidents({
        hospitalId: selectedHospital,
        status: selectedStatus,
        severity: selectedSeverity,
        search: searchQuery,
      }),
  });

  const incidents = incidentsRes?.data || [];

  const handleOpenDetail = (inc: SecurityIncident) => {
    setActiveIncident(inc);
    setNewStatus(inc.status);
    setResolutionNotes(inc.resolutionNotes || "");
    setUpdateSuccess(false);
  };

  const handleSaveStatus = async () => {
    if (!activeIncident) return;
    setIsUpdating(true);
    try {
      const updated = await incidentService.updateIncidentStatus(
        activeIncident.id,
        newStatus,
        resolutionNotes,
        currentUser ? `${currentUser.name} (${currentUser.role})` : "Security Officer"
      );
      if (updated) {
        setActiveIncident(updated);
        setUpdateSuccess(true);
        refetch();
        refreshData();
      }
    } catch (err) {
      console.error("Failed to update incident status", err);
    } finally {
      setIsUpdating(false);
    }
  };

  // Badge helpers
  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-100 text-red-700 border-red-300";
      case "HIGH":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "MEDIUM":
        return "bg-amber-100 text-amber-800 border-amber-300";
      default:
        return "bg-emerald-100 text-emerald-700 border-emerald-300";
    }
  };

  const getStatusBadge = (status: IncidentStatus) => {
    switch (status) {
      case "OPEN":
        return "bg-red-50 text-red-700 border-red-200";
      case "INVESTIGATING":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "RESOLVED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "FALSE_POSITIVE":
        return "bg-slate-100 text-slate-700 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-red-50 text-red-600 border border-red-200">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Security Incident Management (SOC Triage)</h2>
              <p className="text-xs text-slate-500">
                Automated detection pipeline correlating abnormal EMR query velocities and unauthorized access violations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-600 font-mono">
            Open Incidents:{" "}
            <strong className="text-red-600">
              {incidents.filter((i) => i.status === "OPEN" || i.status === "INVESTIGATING").length}
            </strong>
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search incident #, user, rule..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-56"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="FALSE_POSITIVE">FALSE_POSITIVE</option>
          </select>

          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">CRITICAL</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing <strong>{incidents.length}</strong> incidents
        </div>
      </div>

      {/* Incidents Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono text-[11px]">
                <th className="py-2.5 px-3">Incident #</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Incident Title & Description</th>
                <th className="py-2.5 px-3">Affected Principal</th>
                <th className="py-2.5 px-3">Detection Rule</th>
                <th className="py-2.5 px-3">Hospital</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Loading security incidents...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No security incidents found matching filter.
                  </td>
                </tr>
              ) : (
                incidents.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => handleOpenDetail(inc)}
                    className="cursor-pointer hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3 px-3 font-mono font-bold text-blue-600 text-[11px] whitespace-nowrap">
                      {inc.incidentNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-slate-900 text-xs">
                        {inc.riskScore}
                        <span className="text-[10px] text-slate-400 font-normal">/100</span>
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-xs">
                      <div className="font-semibold text-slate-900 line-clamp-1">{inc.title}</div>
                      <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{inc.description}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-900 leading-tight">{inc.affectedUserName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inc.affectedUserRole}</div>
                    </td>
                    <td className="py-3 px-3 text-[11px] font-mono text-slate-600 max-w-[160px] truncate" title={inc.detectionRule}>
                      {inc.detectionRule}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 max-w-[120px] truncate" title={inc.hospitalName}>
                      {inc.hospitalName}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(inc);
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold px-2 py-1 rounded hover:bg-blue-50 transition"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail & Status Update Drawer */}
      {activeIncident && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex justify-end animate-in fade-in">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl border-l border-slate-200 flex flex-col justify-between animate-in slide-in-from-right duration-200">
            <div>
              {/* Header */}
              <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-900">
                      {activeIncident.incidentNumber}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getSeverityBadge(activeIncident.severity)}`}>
                      {activeIncident.severity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Detected: {formatDateTime(activeIncident.timestamp)}
                  </p>
                </div>
                <button
                  onClick={() => setActiveIncident(null)}
                  className="p-1 rounded text-slate-400 hover:text-slate-600 font-bold"
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4 overflow-y-auto max-h-[calc(100vh-170px)] text-xs">
                {/* Title & Description */}
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeIncident.title}</h3>
                  <p className="text-slate-600 text-xs mt-1 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                    {activeIncident.description}
                  </p>
                </div>

                {/* Threat Metadata */}
                <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-slate-200 rounded-lg text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Affected User:</span>
                    <strong className="text-slate-900">{activeIncident.affectedUserName}</strong>
                    <span className="text-[10px] font-mono text-slate-500 block">
                      Role: {activeIncident.affectedUserRole}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Hospital Origin:</span>
                    <span className="text-slate-800">{activeIncident.hospitalName}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Risk Score:</span>
                    <span className="font-mono font-bold text-red-600 text-xs">{activeIncident.riskScore} / 100</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Detection Rule:</span>
                    <span className="font-mono text-slate-700 text-[10px]">{activeIncident.detectionRule}</span>
                  </div>
                </div>

                {/* Status Update Form (Fulfills Demo Step 8) */}
                <div className="border border-blue-200 bg-blue-50/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-blue-600" />
                      SOC Triage & Status Transition
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(activeIncident.status)}`}>
                      Current: {activeIncident.status}
                    </span>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">New Status:</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as IncidentStatus)}
                      className="w-full bg-white border border-slate-300 rounded-md px-3 py-2 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                    >
                      <option value="OPEN">OPEN (Unassigned)</option>
                      <option value="INVESTIGATING">INVESTIGATING (SOC Active Review)</option>
                      <option value="RESOLVED">RESOLVED (Mitigated / Access Revoked)</option>
                      <option value="FALSE_POSITIVE">FALSE_POSITIVE (Authorized Exception)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">
                      Investigation / Resolution Notes:
                    </label>
                    <textarea
                      rows={3}
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Add investigation findings, quarantine actions, or root cause justification..."
                      className="w-full bg-white border border-slate-300 rounded-md p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {activeIncident.investigatedBy && (
                    <div className="text-[11px] text-slate-500 font-mono">
                      Last Updated By: <strong>{activeIncident.investigatedBy}</strong>
                    </div>
                  )}

                  {updateSuccess && (
                    <div className="p-2 bg-emerald-100 text-emerald-800 rounded border border-emerald-300 text-xs flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Incident status updated successfully!</span>
                    </div>
                  )}

                  <button
                    onClick={handleSaveStatus}
                    disabled={isUpdating}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md text-xs transition flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
                  >
                    {isUpdating ? "Saving Transition..." : "Commit Status Transition"}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setActiveIncident(null)}
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
