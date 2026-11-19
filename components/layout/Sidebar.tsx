"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldAlert,
  Activity,
  FileText,
  AlertTriangle,
  Users,
  KeyRound,
  Layers,
  CheckCircle2,
  Building2,
  Settings,
  Shield,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/components/providers/AppContext";
import { useQuery } from "@tanstack/react-query";
import { incidentService } from "@/services/incidentService";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  badge?: number | string;
  badgeColor?: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedHospital } = useApp();

  // Query open incidents count for live badge
  const { data: incidentsRes } = useQuery({
    queryKey: ["sidebar-incidents", selectedHospital],
    queryFn: () => incidentService.getIncidents({ hospitalId: selectedHospital, status: "OPEN" }),
    refetchInterval: 10000,
  });

  const openCount = incidentsRes?.data?.length || 0;

  const navigation: NavItem[] = [
    { name: "Overview", href: "/dashboard", icon: Activity },
    { name: "Security Monitoring", href: "/monitoring", icon: Radio },
    { name: "Audit Logs", href: "/audit-logs", icon: FileText },
    {
      name: "Security Incidents",
      href: "/incidents",
      icon: AlertTriangle,
      badge: openCount > 0 ? openCount : undefined,
      badgeColor: "bg-critical text-white",
    },
    { name: "Users & Roles", href: "/users", icon: Users },
    { name: "Access Policies", href: "/policies", icon: KeyRound },
    { name: "Data Classification", href: "/data-classification", icon: Layers },
    { name: "Compliance Center", href: "/compliance", icon: CheckCircle2 },
    { name: "Hospital Management", href: "/hospitals", icon: Building2 },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B1220] text-slate-300 flex flex-col shrink-0 border-r border-[#1F2E47] select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 gap-3 border-b border-[#1F2E47] bg-[#0B1220]">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
          <Shield className="w-5 h-5 text-white stroke-[2.2]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-white tracking-tight text-base flex items-center gap-1.5">
            Hospital<span className="text-blue-400">Shield</span>
          </span>
          <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 font-semibold">
            Healthcare SOC • v2.4
          </span>
        </div>
      </div>

      {/* SOC Live Status Pill */}
      <div className="px-4 py-3 border-b border-[#1F2E47]/60 bg-[#0E1729]/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-300 font-medium text-[11px]">SOC Telemetry Active</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-900/60 text-blue-300 border border-blue-700/50">
            DEFCON 3
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Security Operations
        </div>

        {navigation.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3 py-2 text-xs font-medium rounded-md transition-colors group",
                isActive
                  ? "bg-blue-600 text-white shadow-sm font-semibold"
                  : "text-slate-300 hover:bg-[#152033] hover:text-white"
              )}
            >
              <div className="flex items-center gap-2.5">
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-slate-400 group-hover:text-slate-200"
                  )}
                />
                <span>{item.name}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={cn(
                    "px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold leading-none",
                    item.badgeColor || "bg-blue-800 text-blue-200"
                  )}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-3 border-t border-[#1F2E47] bg-[#080E1A] text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
          <span>Zero-Trust Policy PEP</span>
        </div>
        <span className="font-mono text-[10px] text-emerald-400">ENFORCED</span>
      </div>
    </aside>
  );
}
