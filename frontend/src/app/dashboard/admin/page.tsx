"use client";

import { 
  Building2, 
  Users, 
  MapPin, 
  Calendar, 
  Clock, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle, 
  ArrowRight, 
  DollarSign,
  LayoutDashboard,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Plus
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings, useApproveBooking, useRejectBooking } from "@/features/bookings/hooks";
import { useVenues } from "@/features/venues/hooks";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ClientDate } from "@/components/ui/client-date";
import { useAuthStore } from "@/store/auth-store";

import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/venues", label: "Venues" },
  { href: "/dashboard/admin/bookings", label: "Bookings" },
  { href: "/dashboard/admin/reports", label: "Reports" },
];

function AdminSkeleton() {
  return (
    <div className="flex h-full bg-[#F8F9FC] font-sans w-full">
      {/* Sidebar Skeleton */}
      <div className="hidden md:flex flex-col w-64 border-r border-slate-150 bg-white p-6 space-y-8">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-xl" />
          ))}
        </div>
      </div>
      {/* Content Skeleton */}
      <div className="flex-grow p-6 md:p-10 space-y-8 overflow-y-auto">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-8 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-96 rounded-2xl" />
          <Skeleton className="h-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: bookingsData, isLoading: loadingBookings } = useBookings();
  const { data: venuesData, isLoading: loadingVenues } = useVenues();
  const approve = useApproveBooking();
  const reject = useRejectBooking();
  const { logout } = useAuthStore();

  const isLoading = loadingBookings || loadingVenues;

  const bookings = bookingsData ?? [];
  const venues = venuesData?.items ?? [];

  if (isLoading) {
    return <AdminSkeleton />;
  }

  // Summarize stats
  const totalUsersCount = 28; // fallback mock
  const pendingApprovalsCount = bookings.filter((b) => b.status === "pending").length;
  const approvedBookingsCount = bookings.filter((b) => b.status === "approved").length;
  const totalRevenue = bookings
    .filter((b) => b.status === "approved")
    .reduce((sum, b) => {
      const venue = venues.find((v) => v.name === b.venueName);
      return sum + (venue?.pricing ?? 1200);
    }, 0);

  const handleLogout = () => {
    logout();
    window.location.replace("/");
  };

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
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
              Overview
            </h1>
            <p className="text-slate-500 text-xs font-medium mt-0.5">
              Welcome back, here&apos;s what&apos;s happening today.
            </p>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded">
                <TrendingUp className="h-3.5 w-3.5" /> +12%
              </span>
            </div>
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Users</h3>
              <p className="text-2xl font-black text-slate-900 mt-1">{totalUsersCount}</p>
            </div>
          </div>

          {/* Pending Approvals */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-red-50 text-red-650 rounded-xl border border-red-100">
                <Clock className="h-5 w-5 text-red-600" />
              </div>
              <span className="text-[10px] font-bold text-red-600 flex items-center gap-0.5 bg-red-50 px-2 py-0.5 rounded">
                <TrendingDown className="h-3.5 w-3.5" /> -3%
              </span>
            </div>
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Approvals</h3>
              <p className="text-2xl font-black text-slate-900 mt-1">{pendingApprovalsCount}</p>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <DollarSign className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded">
                <TrendingUp className="h-3.5 w-3.5" /> +8%
              </span>
            </div>
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Revenue</h3>
              <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
            </div>
          </div>

          {/* Active Bookings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-purple-50 text-purple-650 rounded-xl border border-purple-100">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded">
                <TrendingUp className="h-3.5 w-3.5" /> +15%
              </span>
            </div>
            <div>
              <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Active Bookings</h3>
              <p className="text-2xl font-black text-slate-900 mt-1">{approvedBookingsCount}</p>
            </div>
          </div>
        </div>

        {/* Content Section Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Table: Recent Activity */}
          <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-soft overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900">Recent Activity</h3>
              <Link href="/dashboard/admin/bookings" className="text-xs font-bold text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="overflow-x-auto flex-1">
              {bookings.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs font-bold">
                  No activity recorded yet.
                </div>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-6">User</th>
                      <th className="py-3 px-6">Action</th>
                      <th className="py-3 px-6">Target</th>
                      <th className="py-3 px-6">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {bookings.slice(0, 5).map((booking) => {
                      const initials = (booking.customerName ?? "Guest").substring(0, 2).toUpperCase();
                      const actionLabel = 
                        booking.status === "approved" 
                          ? "Booked Venue" 
                          : booking.status === "rejected" 
                          ? "Rejected Request" 
                          : booking.status === "cancelled" 
                          ? "Cancelled Booking" 
                          : "Requested Booking";

                      return (
                        <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-4 px-6 flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-650 flex items-center justify-center font-black text-[10px] border border-blue-100">
                              {initials}
                            </div>
                            <span className="text-slate-900 font-bold">{booking.customerName ?? "Anonymous"}</span>
                          </td>
                          <td className="py-4 px-6 text-slate-500">{actionLabel}</td>
                          <td className="py-4 px-6 text-slate-900 font-bold">{booking.venueName}</td>
                          <td className="py-4 px-6 text-slate-400">
                            <ClientDate date={booking.date} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Right Card: Pending Venue/Booking Approvals */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-soft flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-base font-extrabold text-slate-900">Pending Approvals</h3>
              <span className="bg-red-50 text-red-650 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-red-100">
                {pendingApprovalsCount} New
              </span>
            </div>
            
            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[400px]">
              {bookings.filter(b => b.status === "pending").length === 0 ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold">
                  All caught up! No approvals pending.
                </div>
              ) : (
                bookings
                  .filter((b) => b.status === "pending")
                  .slice(0, 3)
                  .map((booking) => {
                    return (
                      <div key={booking.id} className="bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3 shadow-sm">
                        <div className="flex justify-between items-start">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{booking.venueName}</h4>
                          <span className="text-[9px] text-slate-400 font-semibold whitespace-nowrap ml-2">
                            <ClientDate date={booking.date} />
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                          Request for {booking.attendees ? `${booking.attendees} guests` : "event space"} submitted by {booking.customerName ?? "customer"}.
                        </p>
                        <div className="flex gap-2.5 pt-1">
                          <button 
                            disabled={approve.isPending}
                            onClick={() => approve.mutate(booking.id)}
                            className="flex-1 bg-blue-650 hover:bg-blue-700 text-white text-[10px] font-bold py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button 
                            disabled={reject.isPending}
                            onClick={() => reject.mutate(booking.id)}
                            className="flex-1 border border-red-200 text-red-600 bg-white hover:bg-red-50 text-[10px] font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
