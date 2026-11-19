"use client";

import React, { useState } from "react";
import {
  ShieldAlert,
  ChevronRight,
  UserCheck,
  AlertOctagon,
  Eye,
  CheckCircle2,
  Minimize2,
  Maximize2,
  Lock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { resourceService, AccessAttemptResult } from "@/services/resourceService";
import { incidentService } from "@/services/incidentService";
import { useRouter } from "next/navigation";

export default function DemoWorkflowBar() {
  const { currentUser, switchUser, refreshData } = useApp();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [lastAttemptResult, setLastAttemptResult] = useState<AccessAttemptResult | null>(null);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const router = useRouter();

  const handleStep1LoginReceptionist = () => {
    switchUser("usr-rec-01"); // Sunita Rao (RECEPTIONIST)
    setCurrentStep(2);
  };

  const handleStep2AttemptRestrictedAccess = async () => {
    setIsSimulating(true);
    try {
      // Attempt read access on L4 Restricted Oncology Diagnosis
      const res = await resourceService.attemptAccess("res-04", "READ");
      setLastAttemptResult(res);
      refreshData();
      if (!res.allowed) {
        setCurrentStep(4);
      } else {
        setCurrentStep(3);
      }
    } catch (err: any) {
      setLastAttemptResult({
        allowed: false,
        resource: {
          id: "res-04",
          name: "Restricted Oncology Clinical Biopsy & Staging Notes",
          type: "DIAGNOSIS",
          classification: "L4",
          description: "Histopathology notes",
        },
        reason: err.message || "403 Forbidden: Blocked by Access PEP",
        riskScore: 92,
      });
      refreshData();
      setCurrentStep(4);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleStep5ViewAuditLogs = () => {
    router.push("/audit-logs");
    setCurrentStep(6);
  };

  const handleStep6ViewIncidents = () => {
    router.push("/incidents");
    setCurrentStep(7);
  };

  const handleStep7SwitchToSecAdmin = () => {
    switchUser("usr-sec-01"); // Rahul Sharma (SECURITY_ADMIN)
    setCurrentStep(8);
  };

  const handleStep8InvestigateIncident = async () => {
    setIsSimulating(true);
    try {
      await incidentService.updateIncidentStatus(
        "inc-001",
        "INVESTIGATING",
        "Receptionist attempted access to L4 oncology biopsy without doctor authorization. Investigating front desk terminal.",
        "Rahul Sharma (SOC Lead)"
      );
      refreshData();
      setCurrentStep(9);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleResetDemo = () => {
    setCurrentStep(1);
    setLastAttemptResult(null);
  };

  return (
    <div className="bg-[#0B1220] border-b border-blue-900/50 text-white px-4 py-2 text-xs shadow-md">
      <div className="flex items-center justify-between gap-4">
        {/* Left: Hackathon Demo Workflow Guide */}
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-blue-600/30 text-blue-400 border border-blue-500/30">
            <ShieldAlert className="w-4 h-4 text-blue-400" />
          </div>
          <span className="font-bold text-white text-[12px] tracking-wide flex items-center gap-1.5">
            SOC Hackathon Demo Workflow:
          </span>
          <span className="text-slate-300 hidden md:inline">
            Step {currentStep} of 9:
          </span>
          <span className="font-semibold text-blue-300">
            {currentStep === 1 && "1. Receptionist Logs In"}
            {currentStep === 2 && "2. Attempt Access to Restricted L4 Diagnosis"}
            {currentStep === 3 && "3. Backend Evaluates Access Rule"}
            {currentStep === 4 && "4. Access Denied & Policy PEP Interception"}
            {currentStep === 5 && "5. Review Real-Time Audit Event"}
            {currentStep === 6 && "6. Critical Security Incident Auto-Generated"}
            {currentStep === 7 && "7. Switch to Security Admin"}
            {currentStep === 8 && "8. SOC Investigation & Status Transition"}
            {currentStep === 9 && "9. Resolution & Incident Verified"}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {currentStep === 1 && (
            <button
              onClick={handleStep1LoginReceptionist}
              className="bg-blue-600 hover:bg-blue-500 text-white font-medium px-3 py-1 rounded text-xs transition flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Login as Receptionist (Sunita Rao)</span>
            </button>
          )}

          {currentStep === 2 && (
            <button
              onClick={handleStep2AttemptRestrictedAccess}
              disabled={isSimulating}
              className="bg-critical hover:bg-red-700 text-white font-medium px-3 py-1 rounded text-xs transition flex items-center gap-1.5 shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{isSimulating ? "Testing..." : "Attempt L4 Oncology Query"}</span>
            </button>
          )}

          {currentStep === 4 && (
            <div className="flex items-center gap-2">
              <span className="text-red-400 font-mono font-semibold flex items-center gap-1 text-[11px]">
                <AlertOctagon className="w-3.5 h-3.5" />
                DENIED (Risk: {lastAttemptResult?.riskScore || 92})
              </span>
              <button
                onClick={handleStep5ViewAuditLogs}
                className="bg-slate-700 hover:bg-slate-600 text-white px-2.5 py-1 rounded text-xs flex items-center gap-1"
              >
                <span>View Audit Logs</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}

          {currentStep === 5 && (
            <button
              onClick={handleStep6ViewIncidents}
              className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
            >
              <span>Inspect Security Incidents</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {currentStep === 6 && (
            <button
              onClick={handleStep7SwitchToSecAdmin}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1.5 font-medium"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch to Security Admin (Rahul Sharma)</span>
            </button>
          )}

          {currentStep === 7 && (
            <button
              onClick={handleStep8InvestigateIncident}
              disabled={isSimulating}
              className="bg-amber-600 hover:bg-amber-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1 font-medium"
            >
              <span>{isSimulating ? "Updating..." : "Mark INVESTIGATING"}</span>
            </button>
          )}

          {currentStep === 8 && (
            <button
              onClick={() => setCurrentStep(9)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-xs flex items-center gap-1 font-medium"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Confirm Status Updated</span>
            </button>
          )}

          {currentStep === 9 && (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Demo Workflow Completed Successfully!
              </span>
              <button
                onClick={handleResetDemo}
                className="text-slate-400 hover:text-white underline text-[11px]"
              >
                Restart Demo
              </button>
            </div>
          )}

          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="text-slate-400 hover:text-white p-1"
            title={isMinimized ? "Expand workflow" : "Minimize"}
          >
            {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Details Drawer if not minimized and step 4 or 8 */}
      {!isMinimized && lastAttemptResult && !lastAttemptResult.allowed && currentStep === 4 && (
        <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-red-200 bg-red-950/40 p-2 rounded">
          <div className="flex items-center gap-2">
            <span className="font-mono bg-red-900/80 px-1.5 py-0.5 rounded text-white font-bold">
              PEP-403-FORBIDDEN
            </span>
            <span>{lastAttemptResult.reason}</span>
          </div>
          <span className="font-mono text-slate-300">
            Event ID: <strong className="text-white">{lastAttemptResult.auditEventId || "EVT-8921-X9"}</strong>
          </span>
        </div>
      )}
    </div>
  );
}
