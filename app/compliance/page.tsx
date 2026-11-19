"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileCheck,
  ShieldCheck,
  Building,
  HelpCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
} from "lucide-react";
import { complianceService } from "@/services/complianceService";
import { ComplianceControlItem, ComplianceStatus } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function ComplianceCenterPage() {
  const [selectedFramework, setSelectedFramework] = useState<string>("ALL");

  const { data: controlsRes } = useQuery({
    queryKey: ["compliance-controls", selectedFramework],
    queryFn: () => complianceService.getControls(selectedFramework),
  });

  const controls = controlsRes?.data || [];
  const stats = complianceService.getComplianceStats();

  const getStatusBadge = (status: ComplianceStatus) => {
    switch (status) {
      case "IMPLEMENTED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "PARTIAL":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "NEEDS_REVIEW":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "NOT_IMPLEMENTED":
        return "bg-red-50 text-red-700 border-red-200";
    }
  };

  const getFrameworkLabel = (fw: string) => {
    switch (fw) {
      case "DPDP_ACT":
        return "DPDP Act 2023";
      case "CERT_IN":
        return "CERT-In Directions";
      case "ABDM_HDMP":
        return "ABDM HDMP";
      case "HEALTHCARE_ISO":
        return "ISO 27799 / Health Info Sec";
      default:
        return fw;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <CheckCircle2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Regulatory Security & Compliance Center</h2>
              <p className="text-xs text-slate-500">
                Continuous technical control validation mapped across statutory healthcare data protection frameworks.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 border border-blue-200 font-mono font-semibold">
            Technical Baseline Score: {stats.score}%
          </span>
        </div>
      </div>

      {/* Mandatory Statutory Disclaimer Notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="space-y-0.5 leading-relaxed">
          <strong className="font-semibold block">Statutory Technical Governance Disclaimer:</strong>
          <span>
            HospitalShield monitors and enforces technical security safeguards across ICT infrastructure.
            This dashboard displays internal control implementation statuses only and does not constitute or claim
            legal certification, formal accreditation, or full statutory legal compliance. Legal and regulatory obligations
            remain the sole responsibility of the hospital data fiduciary.
          </span>
        </div>
      </div>

      {/* Framework Summary Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Implemented Controls
          </span>
          <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
            {stats.implemented} / {stats.total}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Safeguards actively verified</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Partial Implementation
          </span>
          <div className="text-2xl font-bold text-amber-600 font-mono mt-1">
            {stats.partial}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Rollout underway in secondary campuses</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Needs Periodic Review
          </span>
          <div className="text-2xl font-bold text-blue-600 font-mono mt-1">
            {stats.needsReview}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Due for penetration test audit</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-sm">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            Unimplemented Gaps
          </span>
          <div className="text-2xl font-bold text-slate-600 font-mono mt-1">
            {stats.notImplemented}
          </div>
          <p className="text-[10px] text-slate-500 mt-1">Zero critical gaps detected</p>
        </div>
      </div>

      {/* Framework Filter Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-lg px-2 pt-2 gap-1 text-xs">
        {[
          { id: "ALL", label: "All Frameworks (8 Controls)" },
          { id: "DPDP_ACT", label: "DPDP Act 2023" },
          { id: "CERT_IN", label: "CERT-In Cyber Directions" },
          { id: "ABDM_HDMP", label: "ABDM Health Data Policy" },
          { id: "HEALTHCARE_ISO", label: "Healthcare ISO 27799" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedFramework(tab.id)}
            className={`px-3.5 py-2 font-medium border-b-2 transition -mb-px text-xs ${
              selectedFramework === tab.id
                ? "border-blue-600 text-blue-600 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Controls List Table */}
      <div className="bg-white border border-slate-200 rounded-b-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono text-[11px]">
                <th className="py-2.5 px-3">Framework & Control Code</th>
                <th className="py-2.5 px-3">Control Title & Mandate</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Technical Evidence & Telemetry Link</th>
                <th className="py-2.5 px-3 text-right">Last Reviewed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {controls.map((ctrl) => (
                <tr key={ctrl.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-3">
                    <div className="font-mono font-bold text-slate-900 text-[11px]">{ctrl.controlCode}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {getFrameworkLabel(ctrl.framework)}
                    </div>
                  </td>
                  <td className="py-3 px-3 max-w-sm">
                    <div className="font-semibold text-slate-900">{ctrl.title}</div>
                    <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{ctrl.description}</p>
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getStatusBadge(ctrl.status)}`}>
                      {ctrl.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-xs text-[11px] text-slate-600 leading-relaxed">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200 font-mono text-[10px] text-slate-700">
                      {ctrl.evidenceSummary}
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-500 font-mono text-[11px] whitespace-nowrap">
                    {formatDateTime(ctrl.lastReviewed)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
