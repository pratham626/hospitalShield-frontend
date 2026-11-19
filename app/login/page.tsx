"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Shield,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Building,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import { INITIAL_USERS } from "@/services/mockData";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid official healthcare email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "rahul.sharma@hospitalshield.sec",
      password: "Hospital@123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await authService.login(data.email, data.password);
      router.push("/dashboard");
    } catch (err: any) {
      setErrorMsg(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (user: typeof INITIAL_USERS[0]) => {
    setValue("email", user.email);
    setValue("password", "Hospital@123");
    setErrorMsg(null);
  };

  return (
    <div className="min-h-screen bg-[#0B1220] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Left Side: Brand & SOC Context */}
        <div className="p-8 lg:p-10 bg-gradient-to-br from-[#0F172A] to-[#0B1220] flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
                <Shield className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white tracking-tight">
                  Hospital<span className="text-blue-500">Shield</span>
                </h1>
                <p className="text-xs text-slate-400 font-mono">Healthcare SOC Telemetry Platform</p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <div className="border border-blue-900/40 bg-blue-950/20 rounded-xl p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-blue-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero-Trust Policy Enforcement</span>
                </div>
                <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                  Real-time monitoring across hospital EMR endpoints, diagnostic vaults, and outpatient terminals.
                </p>
              </div>

              <div className="border border-slate-800 bg-slate-950/40 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-300">Regulatory Compliance Ready</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                    DPDP Act 2023
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                    CERT-In Directions
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300 font-mono">
                    ABDM HDMP
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500">
            Authorized healthcare & SOC personnel only. All access attempts cryptographically logged and audited.
          </div>
        </div>

        {/* Right Side: Login Form & Demo Quick-Fill */}
        <div className="p-8 lg:p-10 flex flex-col justify-between bg-slate-900">
          <div>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-white">Sign In to SOC Console</h2>
              <p className="text-xs text-slate-400 mt-1">
                Enter your hospital credentials to access the monitoring dashboard.
              </p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/50 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Official Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    {...register("email")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="name@hospital.org.in"
                  />
                </div>
                {errors.email && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] text-red-400 mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg text-xs transition duration-150 flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Authenticate Session</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Demo Accounts */}
          <div className="mt-8 pt-4 border-t border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 font-mono">
              Quick Hackathon Demo Logins
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill(INITIAL_USERS[0])} // Rahul Sharma (SECURITY_ADMIN)
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left text-[11px] transition"
              >
                <div className="font-semibold text-blue-400">Security Admin</div>
                <div className="text-slate-400 text-[10px] truncate">Rahul Sharma (SOC Lead)</div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickFill(INITIAL_USERS[1])} // Sunita Rao (RECEPTIONIST)
                className="p-2 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-left text-[11px] transition"
              >
                <div className="font-semibold text-amber-400">Receptionist</div>
                <div className="text-slate-400 text-[10px] truncate">Sunita Rao (Front Desk)</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
