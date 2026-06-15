"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { User, Shield, Key, Ban, CheckCircle, Users } from "lucide-react";
import { useUsers, useBlockUser, useUnblockUser } from "@/features/auth/hooks";
import { Skeleton } from "@/components/ui/skeleton";

import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/venues", label: "Venues" },
  { href: "/dashboard/admin/bookings", label: "Bookings" },
  { href: "/dashboard/admin/reports", label: "Reports" },
];

export default function AdminUsersPage() {
  const { data: users = [], isLoading, isError } = useUsers();
  const blockMutation = useBlockUser();
  const unblockMutation = useUnblockUser();

  const handleBlock = async (id: string) => {
    if (confirm("Are you sure you want to block this user?")) {
      try {
        await blockMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUnblock = async (id: string) => {
    if (confirm("Are you sure you want to unblock this user?")) {
      try {
        await unblockMutation.mutateAsync(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const totalUsers = users.length;
  const ownerCount = users.filter((u: any) => u.role === "owner").length;
  const adminCount = users.filter((u: any) => u.role === "admin").length;
  const blockedCount = users.filter((u: any) => u.status === "Blocked").length;

  return (
    <div className="flex h-full bg-[#F8F9FC] font-sans w-full">
      {/* Left Sidebar Layout */}
      <AdminSidebar />

      {/* Main Content Layout */}
      <div className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto h-full pb-16">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DashboardSidebar links={links} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Users</h1>
            <p className="text-sm text-slate-500 mt-1">Platform user directory and roles</p>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Users */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Users className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Users</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</p>
              </div>
            </div>

            {/* Host / Owners */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  <Key className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Host / Owners</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{ownerCount}</p>
              </div>
            </div>

            {/* Admins */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-purple-50 text-purple-650 rounded-xl border border-purple-100">
                  <Shield className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Admins</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{adminCount}</p>
              </div>
            </div>

            {/* Blocked Users */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                  <Ban className="h-5 w-5 text-rose-650" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Blocked Users</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{blockedCount}</p>
              </div>
            </div>
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
            <div className="bg-white border border-slate-100 rounded-2xl shadow-soft overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-6">User ID</th>
                      <th className="py-3 px-6">Phone / Contact</th>
                      <th className="py-3 px-6">Role</th>
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {users.map((user: any) => {
                      const statusColor = 
                        user.status === "Blocked" 
                          ? "bg-rose-50 border-rose-100 text-rose-700" 
                          : user.status === "Active" 
                          ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                          : "bg-slate-50 border-slate-100 text-slate-600";
                      
                      return (
                        <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 text-slate-400 font-mono text-[10px]">
                            {user.id}
                          </td>
                          <td className="py-4 px-6 font-bold text-slate-900">
                            {user.phone}
                          </td>
                          <td className="py-4 px-6">
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
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${statusColor}`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${user.status === "Blocked" ? "bg-rose-500" : user.status === "Active" ? "bg-emerald-500" : "bg-slate-350"}`} />
                              {user.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right">
                            {user.role !== "admin" && (
                              <div className="flex items-center justify-end pl-2">
                                {user.status === "Blocked" ? (
                                  <button
                                    onClick={() => handleUnblock(user.id)}
                                    disabled={unblockMutation.isPending}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 px-2.5 py-1 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
                                  >
                                    <CheckCircle className="h-3 w-3" />
                                    Unblock
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBlock(user.id)}
                                    disabled={blockMutation.isPending}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 px-2.5 py-1 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
                                  >
                                    <Ban className="h-3 w-3" />
                                    Block
                                  </button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
