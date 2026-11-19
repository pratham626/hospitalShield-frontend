"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Search,
  UserPlus,
  Shield,
  CheckCircle2,
  XCircle,
  Building,
  Edit2,
  Power,
  Filter,
  Check,
  AlertCircle,
} from "lucide-react";
import { useApp } from "@/components/providers/AppContext";
import { userService } from "@/services/userService";
import { User, UserRole } from "@/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatDateTime } from "@/lib/utils";

const userSchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid healthcare email required"),
  role: z.enum([
    "SUPER_ADMIN",
    "HOSPITAL_ADMIN",
    "SECURITY_ADMIN",
    "DOCTOR",
    "NURSE",
    "RECEPTIONIST",
    "LAB_TECHNICIAN",
    "PHARMACIST",
    "BILLING_EXECUTIVE",
  ]),
  hospitalId: z.string().min(1, "Hospital selection required"),
  department: z.string().min(2, "Department is required"),
  employeeId: z.string().optional(),
});

type UserFormData = z.infer<typeof userSchema>;

export default function UsersRolesPage() {
  const { selectedHospital, hospitals, refreshData } = useApp();
  const [selectedRole, setSelectedRole] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  const { data: usersRes, refetch, isLoading } = useQuery({
    queryKey: ["users-list", selectedHospital, selectedRole, searchQuery],
    queryFn: () =>
      userService.getUsers({
        hospitalId: selectedHospital,
        role: selectedRole,
        search: searchQuery,
      }),
  });

  const users = usersRes?.data || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      role: "DOCTOR",
      hospitalId: "hosp-1",
      department: "General Medicine",
    },
  });

  const handleOpenCreate = () => {
    reset({
      name: "",
      email: "",
      role: "DOCTOR",
      hospitalId: hospitals[0]?.id || "hosp-1",
      department: "Internal Medicine",
      employeeId: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setEditingUser(null);
    setShowCreateModal(true);
  };

  const handleOpenEdit = (user: User) => {
    setEditingUser(user);
    reset({
      name: user.name,
      email: user.email,
      role: user.role,
      hospitalId: user.hospitalId,
      department: user.department,
      employeeId: user.employeeId || "",
    });
    setShowCreateModal(true);
  };

  const onSubmit = async (data: UserFormData) => {
    try {
      if (editingUser) {
        await userService.updateUser(editingUser.id, data);
        setActionSuccessMsg(`User ${data.name} updated successfully.`);
      } else {
        await userService.createUser(data);
        setActionSuccessMsg(`New user ${data.name} enrolled with role ${data.role}.`);
      }
      setShowCreateModal(false);
      refetch();
      refreshData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleToggleActive = async (user: User) => {
    const nextStatus = !user.isActive;
    try {
      await userService.updateUserStatus(user.id, nextStatus);
      setActionSuccessMsg(
        `User ${user.name} is now ${nextStatus ? "ACTIVATED" : "DEACTIVATED"}.`
      );
      refetch();
      refreshData();
      setTimeout(() => setActionSuccessMsg(null), 4000);
    } catch (err: any) {
      console.error(err);
    }
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "SECURITY_ADMIN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "HOSPITAL_ADMIN":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "DOCTOR":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "NURSE":
        return "bg-teal-50 text-teal-700 border-teal-200";
      case "RECEPTIONIST":
        return "bg-amber-50 text-amber-800 border-amber-200";
      case "LAB_TECHNICIAN":
        return "bg-cyan-50 text-cyan-800 border-cyan-200";
      case "PHARMACIST":
        return "bg-orange-50 text-orange-800 border-orange-200";
      case "BILLING_EXECUTIVE":
        return "bg-slate-100 text-slate-800 border-slate-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-blue-50 text-blue-600 border border-blue-200">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hospital Identity & Role Directory</h2>
              <p className="text-xs text-slate-500">
                Manage medical practitioners, administrative staff, technicians, and SOC access privileges.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleOpenCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-3.5 py-2 rounded-md flex items-center gap-2 transition shadow-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Enroll New Hospital User</span>
        </button>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Search user, email, employee ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 w-56"
            />
          </div>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-700 font-medium outline-none"
          >
            <option value="ALL">All Roles (9 Roles)</option>
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
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Total Users: <strong>{users.length}</strong>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold font-mono text-[11px]">
                <th className="py-2.5 px-3">Name & Employee ID</th>
                <th className="py-2.5 px-3">Role</th>
                <th className="py-2.5 px-3">Email Address</th>
                <th className="py-2.5 px-3">Department</th>
                <th className="py-2.5 px-3">Hospital Affiliation</th>
                <th className="py-2.5 px-3 text-center">Status</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {user.employeeId || "EMP-GENERIC"}
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-700 text-[11px]">{user.email}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px]">{user.department}</td>
                    <td className="py-3 px-3 text-slate-600 text-[11px] max-w-[150px] truncate" title={user.hospitalName}>
                      {user.hospitalName || "AIIMS Central"}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {user.isActive ? (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>ACTIVE</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200">
                          <XCircle className="w-3 h-3 text-red-600" />
                          <span>DEACTIVATED</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(user)}
                          className="p-1 rounded text-slate-600 hover:text-blue-600 hover:bg-slate-100 transition"
                          title="Edit User"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`p-1 rounded transition ${
                            user.isActive
                              ? "text-slate-600 hover:text-red-600 hover:bg-red-50"
                              : "text-slate-600 hover:text-emerald-600 hover:bg-emerald-50"
                          }`}
                          title={user.isActive ? "Deactivate User" : "Activate User"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                {editingUser ? "Edit User Directory Entry" : "Enroll New Hospital Staff Member"}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  {...register("name")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="e.g. Dr. Rajesh Khanna"
                />
                {errors.name && <p className="text-[11px] text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Official Healthcare Email</label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                  placeholder="rajesh.khanna@aiims.org.in"
                />
                {errors.email && <p className="text-[11px] text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital Role</label>
                  <select
                    {...register("role")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    <option value="DOCTOR">DOCTOR</option>
                    <option value="NURSE">NURSE</option>
                    <option value="RECEPTIONIST">RECEPTIONIST</option>
                    <option value="LAB_TECHNICIAN">LAB_TECHNICIAN</option>
                    <option value="PHARMACIST">PHARMACIST</option>
                    <option value="BILLING_EXECUTIVE">BILLING_EXECUTIVE</option>
                    <option value="HOSPITAL_ADMIN">HOSPITAL_ADMIN</option>
                    <option value="SECURITY_ADMIN">SECURITY_ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Hospital Campus</label>
                  <select
                    {...register("hospitalId")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 font-medium focus:outline-none focus:border-blue-500"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Department</label>
                  <input
                    type="text"
                    {...register("department")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. Critical Care"
                  />
                  {errors.department && (
                    <p className="text-[11px] text-red-500 mt-1">{errors.department.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Employee ID</label>
                  <input
                    type="text"
                    {...register("employeeId")}
                    className="w-full bg-slate-50 border border-slate-300 rounded-md p-2 text-slate-900 font-mono focus:outline-none focus:border-blue-500"
                    placeholder="EMP-9021"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3 py-1.5 border border-slate-300 rounded-md text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md shadow-sm"
                >
                  {editingUser ? "Save Changes" : "Save & Register User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
