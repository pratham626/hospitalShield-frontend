"use client";

import React from "react";
import {
  Layers,
  Shield,
  Lock,
  Globe,
  Building,
  FileText,
  AlertTriangle,
  Flame,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { INITIAL_RESOURCES } from "@/services/mockData";

export default function DataClassificationPage() {
  const classificationTiers = [
    {
      level: "L1",
      name: "PUBLIC",
      color: "blue",
      badgeClass: "bg-blue-100 text-blue-800 border-blue-300",
      accentBorder: "border-blue-400",
      icon: Globe,
      description: "Non-sensitive hospital infrastructure details, general OPD schedules, public practitioner directories, and department timings.",
      accessExpectations: "Unrestricted read access for all hospital employees, patients, and public visitors without authentication challenge.",
      examples: [
        "Doctor OPD availability rosters",
        "Hospital tariff sheets & public insurance tie-up lists",
        "Public health advisory bulletins",
        "Campus ward floor layout maps",
      ],
      dpdpContext: "Outside the purview of Sensitive Personal Data (SPD) as no Data Principal identifiers are processed.",
    },
    {
      level: "L2",
      name: "INTERNAL",
      color: "slate",
      badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
      accentBorder: "border-slate-400",
      icon: Building,
      description: "Operational hospital metrics, non-identifiable bed census counts, biomedical device maintenance logs, and financial breakdown ledgers.",
      accessExpectations: "Requires verified employee identity (SSO / Kerberos token). Available to administrative and reception personnel on need-to-know basis.",
      examples: [
        "General ward bed occupancy numbers",
        "Shift duty rosters for nursing staff",
        "TPA insurance settlement ledger summaries",
        "Pharmacy inventory replenishment orders",
      ],
      dpdpContext: "Aggregated operational records; minimal privacy exposure unless correlated with demographic identifiers.",
    },
    {
      level: "L3",
      name: "CONFIDENTIAL",
      color: "amber",
      badgeClass: "bg-amber-100 text-amber-900 border-amber-300",
      accentBorder: "border-amber-400",
      icon: Lock,
      description: "Protected Health Information (PHI), patient laboratory reports, medication administration charts, and attending physician discharge notes.",
      accessExpectations: "Strictly limited to treating clinical personnel (Doctors, Nurses, Lab Technicians) with active patient encounter context.",
      examples: [
        "Routine blood hematology & biochemistry panels",
        "Inpatient prescription dosage logs",
        "Post-operative vitals flowcharts",
        "Radiology scan interpretations (X-Ray / Ultrasound)",
      ],
      dpdpContext: "Categorized as Personal Health Data under ABDM HDMP; requires active digital consent artifact verification.",
    },
    {
      level: "L4",
      name: "HIGHLY_RESTRICTED",
      color: "red",
      badgeClass: "bg-red-100 text-red-900 border-red-300",
      accentBorder: "border-red-500",
      icon: Flame,
      description: "Specialized, highly sensitive clinical diagnostic evaluations including Oncology histopathology, HIV / infectious disease registries, psychiatric therapy notes, and VIP executive medical records.",
      accessExpectations: "Zero-Trust dual-factor authenticated access restricted exclusively to designated Primary Attending Oncologists/Psychiatrists and Medical Board Admins. Front desk, pharmacy, and billing staff are unconditionally denied.",
      examples: [
        "Restricted Oncology clinical biopsy staging notes",
        "Psychiatric evaluation & psychotherapy session recordings",
        "Infectious disease contact tracing registries",
        "Cryptographic SOC immutable audit vault",
      ],
      dpdpContext: "High-impact sensitive health data. Any unauthorized inquiry instantly triggers high-severity CERT-In incident telemetry.",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <Layers className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hospital Data Classification Taxonomy</h2>
              <p className="text-xs text-slate-500">
                Four-tier enterprise sensitivity taxonomy enforcing differential access control under DPDP Act & ABDM guidelines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-md bg-slate-100 border border-slate-200 font-mono text-slate-700">
            Enforced by Zero-Trust PEP
          </span>
        </div>
      </div>

      {/* Classification Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {classificationTiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.level}
              className={`bg-white border-2 ${tier.accentBorder} rounded-xl p-5 shadow-sm space-y-4`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                    <Icon className="w-5 h-5 text-slate-800" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-base font-bold text-slate-900">{tier.level}</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border ${tier.badgeClass}`}>
                        {tier.name}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">{tier.description}</p>

              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1.5">
                <span className="font-bold text-slate-900 block font-mono text-[11px] uppercase tracking-wider">
                  Access & Authorization Expectations
                </span>
                <p className="text-slate-700 leading-relaxed">{tier.accessExpectations}</p>
              </div>

              <div className="space-y-1.5 text-xs">
                <span className="font-bold text-slate-700 block font-mono text-[11px] uppercase tracking-wider">
                  Real Clinical & Hospital Examples
                </span>
                <ul className="space-y-1 text-slate-600">
                  {tier.examples.map((ex, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-400"></span>
                      <span>{ex}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
                <strong className="text-slate-700">Governance Context:</strong> {tier.dpdpContext}
              </div>
            </div>
          );
        })}
      </div>

      {/* Role Entitlement Matrix */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden p-5">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono mb-2">
          Healthcare Role Entitlement Matrix
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Default read/write entitlements evaluated by the Policy Enforcement Point across classification levels.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono text-[11px]">
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3 text-center">L1: PUBLIC</th>
                <th className="py-2.5 px-3 text-center">L2: INTERNAL</th>
                <th className="py-2.5 px-3 text-center">L3: CONFIDENTIAL</th>
                <th className="py-2.5 px-3 text-center">L4: HIGHLY_RESTRICTED</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {[
                { role: "SUPER_ADMIN", l1: true, l2: true, l3: true, l4: true },
                { role: "HOSPITAL_ADMIN", l1: true, l2: true, l3: true, l4: true },
                { role: "SECURITY_ADMIN", l1: true, l2: true, l3: true, l4: true },
                { role: "DOCTOR", l1: true, l2: true, l3: true, l4: true },
                { role: "NURSE", l1: true, l2: true, l3: true, l4: false },
                { role: "RECEPTIONIST", l1: true, l2: true, l3: false, l4: false },
                { role: "LAB_TECHNICIAN", l1: true, l2: true, l3: true, l4: false },
                { role: "PHARMACIST", l1: true, l2: true, l3: true, l4: false },
                { role: "BILLING_EXECUTIVE", l1: true, l2: true, l3: false, l4: false },
              ].map((row) => (
                <tr key={row.role} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">{row.role}</td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex text-emerald-600 font-bold">ALLOWED</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span className="inline-flex text-emerald-600 font-bold">ALLOWED</span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.l3 ? (
                      <span className="inline-flex text-emerald-600 font-bold">ALLOWED</span>
                    ) : (
                      <span className="inline-flex text-red-600 font-bold">DENIED</span>
                    )}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    {row.l4 ? (
                      <span className="inline-flex text-emerald-600 font-bold">AUTHORIZED</span>
                    ) : (
                      <span className="inline-flex text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded border border-red-200">
                        DENIED (BLOCKED)
                      </span>
                    )}
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
