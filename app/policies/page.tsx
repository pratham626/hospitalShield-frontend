"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  KeyRound,
  Shield,
  Plus,
  Edit2,
  CheckCircle2,
  XCircle,
  Lock,
  Layers,
  Building,
  Power,
  Users,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { policyService } from "@/services/policyService";
import { AccessPolicy, DataClassificationLevel, UserRole } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const ALL_ROLES: UserRole[] = [
  "SUPER_ADMIN",
  "HOSPITAL_ADMIN",
  "SECURITY_ADMIN",
  "DOCTOR",
  "NURSE",
  "RECEPTIONIST",
  "LAB_TECHNICIAN",
  "PHARMACIST",
  "BILLING_EXECUTIVE",
];

const ALL_ACTIONS: ("READ" | "WRITE" | "EXPORT" | "DELETE" | "UPDATE")[] = [
  "READ",
  "WRITE",
  "EXPORT",
  "DELETE",
  "UPDATE",
];

export default function AccessPoliciesPage() {
  const { hospitals, refreshData } = useApp();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingPolicy, setEditingPolicy] = useState<AccessPolicy | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [classification, setClassification] = useState<DataClassificationLevel>("L4");
  const [selectedRoles, setSelectedRoles] = useState<UserRole[]>(["DOCTOR", "HOSPITAL_ADMIN"]);
  const [selectedActions, setSelectedActions] = useState<("READ" | "WRITE" | "EXPORT" | "DELETE" | "UPDATE")[]>([
    "READ",
  ]);
  const [hospitalScope, setHospitalScope] = useState("ALL");
  const [riskThreshold, setRiskThreshold] = useState(85);

  const { data: policiesRes, refetch, isLoading } = useQuery({
    queryKey: ["access-policies"],
    queryFn: () => policyService.getPolicies(),
  });

  const policies = policiesRes?.data || [];

  const handleOpenCreate = () => {
    setEditingPolicy(null);
    setName("");
    setDescription("");
    setClassification("L4");
    setSelectedRoles(["DOCTOR", "HOSPITAL_ADMIN"]);
    setSelectedActions(["READ"]);
    setHospitalScope("ALL");
    setRiskThreshold(85);
    setShowModal(true);
  };

  const handleOpenEdit = (policy: AccessPolicy) => {
    setEditingPolicy(policy);
    setName(policy.name);
    setDescription(policy.description);
    setClassification(policy.resourceClassification);
    setSelectedRoles(policy.applicableRoles);
    setSelectedActions(policy.allowedActions);
    setHospitalScope(policy.hospitalScope);
    setRiskThreshold(policy.riskThreshold || 75);
    setShowModal(true);
  };

  const handleToggleRole = (role: UserRole) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleToggleAction = (action: "READ" | "WRITE" | "EXPORT" | "DELETE" | "UPDATE") => {
    setSelectedActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    if (editingPolicy) {
      await policyService.updatePolicy(editingPolicy.id, {
        name,
        description,
        resourceClassification: classification,
        applicableRoles: selectedRoles,
        allowedActions: selectedActions,
        hospitalScope,
        riskThreshold,
      });
    } else {
      await policyService.createPolicy({
        name,
        description,
        resourceClassification: classification,
        applicableRoles: selectedRoles,
        allowedActions: selectedActions,
        hospitalScope,
        isActive: true,
        riskThreshold,
      });
    }

    setShowModal(false);
    refetch();
    refreshData();
  };

  const handleTogglePolicyActive = async (policy: AccessPolicy) => {
    await policyService.updatePolicy(policy.id, { isActive: !policy.isActive });
    refetch();
    refreshData();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <KeyRound className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Zero-Trust Policy Enforcement Engine (PEP)</h2>
              <p className="text-xs text-slate-500">
                Centralized rule configuration dictating role-based entitlements across data classification tiers.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Define New Policy</span>
        </button>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-lg">
            Loading policies...
          </div>
        ) : (
          policies.map((pol) => (
            <div
              key={pol.id}
              className={`bg-white border rounded-lg p-4 shadow-sm transition ${
                pol.isActive ? "border-slate-200" : "border-slate-200 bg-slate-50/70 opacity-70"
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{pol.name}</span>
                    <span
                      className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold ${
                        pol.resourceClassification === "L4"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : pol.resourceClassification === "L3"
                          ? "bg-amber-100 text-amber-800 border border-amber-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      Target: {pol.resourceClassification}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      Scope: {pol.hospitalScope === "ALL" ? "All Hospitals" : pol.hospitalScope}
                    </span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed max-w-3xl">{pol.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleTogglePolicyActive(pol)}
                    className={`px-2.5 py-1 rounded text-[11px] font-mono font-bold flex items-center gap-1.5 transition ${
                      pol.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                        : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{pol.isActive ? "ACTIVE & ENFORCED" : "SUSPENDED"}</span>
                  </button>

                  <button
                    onClick={() => handleOpenEdit(pol)}
                    className="p-1.5 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition border border-slate-200"
                    title="Edit Policy"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Roles and Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 text-xs">
                <div>
                  <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block mb-1.5">
                    Permitted Roles ({pol.applicableRoles.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pol.applicableRoles.map((role) => (
                      <span
                        key={role}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-slate-500 font-semibold text-[11px] uppercase tracking-wider block mb-1.5">
                    Allowed Operations
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {pol.allowedActions.map((act) => (
                      <span
                        key={act}
                        className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {act}
                      </span>
                    ))}
                    {pol.riskThreshold && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Risk Ceiling: {pol.riskThreshold}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Policy Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingPolicy ? "Edit Security Policy Definition" : "Construct New Access Policy Rule"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSavePolicy} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Policy Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500 font-medium"
                  placeholder="e.g. Strict Oncology Record Safeguard"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Rule Description & Rationale</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="Explains the purpose, regulatory compliance requirement, and enforcement scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Target Classification Level</label>
                  <select
                    value={classification}
                    onChange={(e) => setClassification(e.target.value as DataClassificationLevel)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="L1">L1: PUBLIC</option>
                    <option value="L2">L2: INTERNAL</option>
                    <option value="L3">L3: CONFIDENTIAL</option>
                    <option value="L4">L4: HIGHLY_RESTRICTED</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital Scope</label>
                  <select
                    value={hospitalScope}
                    onChange={(e) => setHospitalScope(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="ALL">All Connected Hospitals</option>
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Roles Multi-Select Chips */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Applicable Roles (Select Authorized Principals):
                </label>
                <div className="flex flex-wrap gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-md">
                  {ALL_ROLES.map((role) => {
                    const isChecked = selectedRoles.includes(role);
                    return (
                      <button
                        type="button"
                        key={role}
                        onClick={() => handleToggleRole(role)}
                        className={`px-2 py-1 rounded text-[10px] font-mono font-semibold transition ${
                          isChecked
                            ? "bg-blue-600 text-white shadow-sm"
                            : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Actions Multi-Select */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Allowed Actions:</label>
                <div className="flex gap-2">
                  {ALL_ACTIONS.map((action) => {
                    const isChecked = selectedActions.includes(action);
                    return (
                      <button
                        type="button"
                        key={action}
                        onClick={() => handleToggleAction(action)}
                        className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold transition ${
                          isChecked
                            ? "bg-slate-800 text-white shadow-sm"
                            : "bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200"
                        }`}
                      >
                        {action}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm"
                >
                  Save Policy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
