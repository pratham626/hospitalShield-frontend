"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  MapPin,
  Users,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Bed,
  CheckCircle2,
  Calendar,
  Search,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { hospitalService } from "@/services/hospitalService";
import { Hospital } from "@/types";
import { formatDateTime } from "@/lib/utils";

export default function HospitalManagementPage() {
  const { setSelectedHospital, refreshData } = useApp();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedHospitalDetail, setSelectedHospitalDetail] = useState<Hospital | null>(null);

  const { data: hospitalsRes, isLoading } = useQuery({
    queryKey: ["hospitals-management"],
    queryFn: () => hospitalService.getHospitals(),
  });

  const hospitals = (hospitalsRes?.data || []).filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Multi-Hospital Network Infrastructure</h2>
              <p className="text-xs text-slate-500">
                Federated cybersecurity telemetry across apex medical institutions, regional campuses, and diagnostic hubs.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-slate-700 font-mono">
            Connected Campuses: <strong>{hospitals.length}</strong>
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex items-center justify-between">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            placeholder="Search hospital by name, city, or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-72"
          />
        </div>

        <div className="text-xs text-slate-500 font-mono">
          All nodes reporting active telemetry
        </div>
      </div>

      {/* Hospital Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {hospitals.map((hosp) => (
          <div
            key={hosp.id}
            onClick={() => setSelectedHospitalDetail(hosp)}
            className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-blue-300 transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{hosp.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {hosp.code}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{hosp.location}</span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>ONLINE</span>
                </span>
              </div>

              {/* Hospital Metrics */}
              <div className="grid grid-cols-4 gap-2 py-4 text-center">
                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Beds</span>
                  <strong className="text-slate-800 text-xs font-mono">{hosp.bedsCount}</strong>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Staff Users</span>
                  <strong className="text-slate-800 text-xs font-mono">{hosp.userCount}</strong>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Open Incidents</span>
                  <strong
                    className={`text-xs font-mono ${
                      hosp.openIncidentsCount > 0 ? "text-red-600" : "text-emerald-600"
                    }`}
                  >
                    {hosp.openIncidentsCount}
                  </strong>
                </div>

                <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <span className="text-[10px] text-slate-400 uppercase font-mono block">Compliance</span>
                  <strong className="text-blue-600 text-xs font-mono">{hosp.complianceScore}%</strong>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400 font-mono">
                Last Security Audit: {formatDateTime(hosp.lastAudit)}
              </span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedHospital(hosp.id);
                }}
                className="text-xs bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 font-semibold px-2.5 py-1 rounded border border-slate-200 transition"
              >
                Filter Scope to This Campus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
