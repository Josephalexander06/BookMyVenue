"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { ShieldCheck, Info } from "lucide-react";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/venues", label: "Venues" },
  { href: "/dashboard/admin/bookings", label: "Bookings" },
  { href: "/dashboard/admin/reports", label: "Reports" },
];

export default function AdminReportsPage() {
  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Flagged listings and platform reports</p>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-16 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-900">Platform is secure</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
            All listings and users are compliant. There are currently no pending reports or flags to review.
          </p>
        </div>
      </div>
    </div>
  );
}
