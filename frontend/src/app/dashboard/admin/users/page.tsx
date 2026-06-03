"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { User, Shield, Key } from "lucide-react";
import { useUsers } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui/skeleton";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/venues", label: "Venues" },
  { href: "/dashboard/admin/bookings", label: "Bookings" },
  { href: "/dashboard/admin/reports", label: "Reports" },
];

export default function AdminUsersPage() {
  const { data: users = [], isLoading, isError } = useUsers();

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Platform user directory and roles</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-10 rounded-xl border border-slate-100 bg-white">
            <p className="text-sm text-slate-400">Failed to load users.</p>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-10 rounded-xl border border-slate-100 bg-white">
            <p className="text-sm text-slate-400">No users found.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
            <div className="divide-y divide-slate-50">
              {users.map((user: any) => (
                <div key={user.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{user.phone}</p>
                      <p className="text-xs text-slate-400">User ID: {user.id}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                      user.role === "admin" 
                        ? "bg-purple-50 text-purple-700" 
                        : user.role === "owner" 
                        ? "bg-blue-50 text-blue-700" 
                        : "bg-slate-50 text-slate-600"
                    }`}>
                      {user.role === "admin" && <Shield className="h-2.5 w-2.5" />}
                      {user.role === "owner" && <Key className="h-2.5 w-2.5" />}
                      {user.role}
                    </span>
                    <span className={`h-1.5 w-1.5 rounded-full ${user.status === "Active" ? "bg-emerald-500" : "bg-slate-300"}`} />
                    <span className="text-xs font-medium text-slate-500">{user.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
