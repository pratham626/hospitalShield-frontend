"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Flame,
  Building2,
  Activity,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  ExternalLink,
  Clock,
  UserCheck,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useApp } from "@/components/providers/AppContext";
import { dashboardService } from "@/services/dashboardService";
import { auditService } from "@/services/auditService";
import { incidentService } from "@/services/incidentService";
import { formatDateTime, formatTimeAgo } from "@/lib/utils";
import Link from "next/link";

export default function OverviewDashboardPage() {
  const { selectedHospital } = useApp();

  const { data: summaryRes, isLoading: loadingSummary } = useQuery({
    queryKey: ["dashboard-summary", selectedHospital],
    queryFn: () => dashboardService.getSummary(selectedHospital),
    refetchInterval: 10000,
  });

  const { data: activityRes } = useQuery({
    queryKey: ["dashboard-activity", selectedHospital],
    queryFn: () => dashboardService.getActivityOverTime(selectedHospital),
    refetchInterval: 15000,
  });

  const { data: severityRes } = useQuery({
    queryKey: ["dashboard-severity", selectedHospital],
    queryFn: () => dashboardService.getSeverityBreakdown(selectedHospital),
  });

  const { data: hospitalActivityRes } = useQuery({
    queryKey: ["dashboard-hospitals"],
    queryFn: () => dashboardService.getHospitalActivity(),
  });

  const { data: recentIncidentsRes } = useQuery({
    queryKey: ["recent-incidents", selectedHospital],
    queryFn: () => incidentService.getIncidents({ hospitalId: selectedHospital }),
  });

  const { data: recentLogsRes } = useQuery({
    queryKey: ["recent-logs", selectedHospital],
    queryFn: () => auditService.getAuditLogs({ hospitalId: selectedHospital, limit: 6 }),
  });

  const summary = summaryRes?.data;
  const recentIncidents = recentIncidentsRes?.data?.slice(0, 4) || [];
  const recentLogs = recentLogsRes?.data || [];

  // Helper for Severity badge
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "CRITICAL":
        return "bg-red-50 text-red-700 border-red-200";
      case "HIGH":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
    }
  };

  // Helper for Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-red-100 text-red-800 border-red-300";
      case "INVESTIGATING":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "RESOLVED":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  const allowedVsDeniedData = [
    { name: "Authorized (Allowed)", value: summary?.authorizedRequests || 1, color: "#16A34A" },
    { name: "Denied (Blocked)", value: summary?.deniedRequests || 0, color: "#DC2626" },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / System State */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-white border border-slate-200 rounded-lg p-4 shadow-sm gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Healthcare SOC Monitoring Console</h2>
            <p className="text-xs text-slate-500">
              Active telemetry from EMR nodes, laboratory analyzers, outpatient desks & pharmacy dispensers.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
            Last Synced: {formatTimeAgo(summary?.lastUpdated)}
          </span>
          <Link
            href="/monitoring"
            className="text-xs bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Live Telemetry Feed</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {/* Total Access Events */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Total Access Events
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {loadingSummary ? "-" : summary?.totalAccessEvents.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            <span className="text-emerald-600 font-semibold">100%</span> audited
          </div>
        </div>

        {/* Authorized Requests */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Authorized
          </span>
          <div className="text-xl font-bold text-emerald-600 mt-1 font-mono">
            {loadingSummary ? "-" : summary?.authorizedRequests.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 mt-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Passed RBAC</span>
          </div>
        </div>

        {/* Denied Requests */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Denied Requests
          </span>
          <div className="text-xl font-bold text-critical mt-1 font-mono">
            {loadingSummary ? "-" : summary?.deniedRequests}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-critical mt-1">
            <XCircle className="w-3 h-3" />
            <span>Intercepted</span>
          </div>
        </div>

        {/* Open Incidents */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Open Incidents
          </span>
          <div className="text-xl font-bold text-amber-600 mt-1 font-mono">
            {loadingSummary ? "-" : summary?.openIncidents}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-amber-600 mt-1">
            <Clock className="w-3 h-3" />
            <span>Awaiting SOC</span>
          </div>
        </div>

        {/* Critical Incidents */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Critical Severity
          </span>
          <div className="text-xl font-bold text-red-600 mt-1 font-mono">
            {loadingSummary ? "-" : summary?.criticalIncidents}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-red-600 mt-1 font-semibold">
            <AlertTriangle className="w-3 h-3" />
            <span>Immediate Triage</span>
          </div>
        </div>

        {/* High-Risk Activity */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            High-Risk Anomaly
          </span>
          <div className="text-xl font-bold text-purple-700 mt-1 font-mono">
            {loadingSummary ? "-" : summary?.highRiskActivity}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-purple-600 mt-1 font-semibold">
            <Flame className="w-3 h-3" />
            <span>Risk Score ≥ 75</span>
          </div>
        </div>

        {/* Monitored Hospitals */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Hospitals
          </span>
          <div className="text-xl font-bold text-slate-900 mt-1 font-mono">
            {loadingSummary ? "-" : summary?.monitoredHospitals}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-1">
            <Building2 className="w-3 h-3 text-slate-400" />
            <span>Nodes Online</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Access Activity Over Time */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Access Activity Over Time
              </h3>
              <p className="text-[11px] text-slate-500">Hourly trend of authorized vs blocked telemetry</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600"></span> Authorized
              </span>
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2.5 w-2.5 rounded-full bg-red-600"></span> Denied
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityRes?.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAllowed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorDenied" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#DC2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "6px", color: "#FFF", fontSize: "11px", border: "none" }}
                />
                <Area type="monotone" dataKey="allowed" name="Authorized" stroke="#2563EB" strokeWidth={2} fillOpacity={1} fill="url(#colorAllowed)" />
                <Area type="monotone" dataKey="denied" name="Denied" stroke="#DC2626" strokeWidth={2} fillOpacity={1} fill="url(#colorDenied)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Allowed vs Denied Donut */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono mb-1">
              Request Enforcement Ratio
            </h3>
            <p className="text-[11px] text-slate-500">Allowed vs Intercepted requests</p>
          </div>

          <div className="h-44 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allowedVsDeniedData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {allowedVsDeniedData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "6px", color: "#FFF", fontSize: "11px", border: "none" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-emerald-600"></span> Authorized
              </span>
              <span className="font-mono font-bold text-slate-900">{summary?.authorizedRequests}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="h-2 w-2 rounded-full bg-red-600"></span> Intercepted
              </span>
              <span className="font-mono font-bold text-red-600">{summary?.deniedRequests}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 Charts: Incidents by Severity & Hospital-wise Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 3: Incidents by Severity */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Incidents by Severity
            </h3>
            <p className="text-[11px] text-slate-500">Distribution across alert priority categories</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityRes?.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="severity" tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "6px", color: "#FFF", fontSize: "11px", border: "none" }}
                />
                <Bar dataKey="count" name="Incidents" radius={[4, 4, 0, 0]}>
                  {(severityRes?.data || []).map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Hospital-wise Activity */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
              Hospital-Wise Activity & Incidents
            </h3>
            <p className="text-[11px] text-slate-500">Events and detected incidents across connected branches</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hospitalActivityRes?.data || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis
                  dataKey="hospitalName"
                  tick={{ fontSize: 10, fill: "#64748B" }}
                  stroke="#CBD5E1"
                  tickFormatter={(val) => val.split(" ")[0]}
                />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} stroke="#CBD5E1" />
                <Tooltip
                  contentStyle={{ backgroundColor: "#0F172A", borderRadius: "6px", color: "#FFF", fontSize: "11px", border: "none" }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
                <Bar dataKey="totalEvents" name="Total Events" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="deniedEvents" name="Denied" fill="#DC2626" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Tables Section: Recent Incidents & Recent Access Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Recent Security Incidents */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Recent Security Incidents
              </h3>
              <p className="text-[11px] text-slate-500">Open & active SOC alerts</p>
            </div>
            <Link
              href="/incidents"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>View All</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 flex-1">
            {recentIncidents.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">No active security incidents</div>
            ) : (
              recentIncidents.map((inc) => (
                <div key={inc.id} className="p-3.5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-bold text-blue-600">{inc.incidentNumber}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${getSeverityBadge(inc.severity)}`}>
                        {inc.severity}
                      </span>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-800 mt-1 line-clamp-1">{inc.title}</h4>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
                    <span>
                      User: <strong>{inc.affectedUserName}</strong> ({inc.affectedUserRole})
                    </span>
                    <span>{formatTimeAgo(inc.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Table 2: Recent Access Activity */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">
                Recent Access Activity
              </h3>
              <p className="text-[11px] text-slate-500">Live stream of resource authorization checks</p>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
            >
              <span>View Logs</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold font-mono text-[11px]">
                  <th className="py-2.5 px-3">Event ID</th>
                  <th className="py-2.5 px-3">User & Role</th>
                  <th className="py-2.5 px-3">Resource</th>
                  <th className="py-2.5 px-3 text-center">Result</th>
                  <th className="py-2.5 px-3 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-800 text-[11px]">
                      {log.eventId}
                    </td>
                    <td className="py-2.5 px-3">
                      <div className="font-medium text-slate-900 leading-tight">{log.userName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.userRole}</div>
                    </td>
                    <td className="py-2.5 px-3 max-w-[150px] truncate" title={log.resourceName}>
                      <span className="text-slate-700">{log.resourceName}</span>
                      <span className="text-[10px] ml-1 font-mono text-slate-400 bg-slate-100 px-1 rounded">
                        {log.classification}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      {log.result === "ALLOWED" ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>ALLOW</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3" />
                          <span>DENY</span>
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right text-slate-500 font-mono text-[11px]">
                      {formatTimeAgo(log.timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
