import type { Metadata } from "next";
import "./globals.css";
import QueryProvider from "@/components/providers/QueryProvider";
import { AppProvider } from "@/components/providers/AppContext";
import AppShell from "@/components/layout/AppShell";

export const metadata: Metadata = {
  title: "HospitalShield | Healthcare Cybersecurity & SOC Telemetry Platform",
  description: "Enterprise-grade multi-hospital cybersecurity, privacy governance, and compliance monitoring platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#F8FAFC] text-slate-900 font-sans">
        <QueryProvider>
          <AppProvider>
            <AppShell>{children}</AppShell>
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
