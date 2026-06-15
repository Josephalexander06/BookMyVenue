"use client";

import { useState } from "react";
import { CalendarDays, Inbox, Clock, CheckCircle } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { AdminSidebar } from "@/components/dashboard/admin-sidebar";
import { useVenues } from "@/features/venues/hooks";
import { BookingCard } from "@/components/marketplace/booking-card";
import {
  useApproveBooking,
  useBookings,
  useRejectBooking,
  useMyBookings,
} from "@/features/bookings/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { ClientDate } from "@/components/ui/client-date";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/venues", label: "Venues" },
  { href: "/dashboard/admin/bookings", label: "Bookings" },
  { href: "/dashboard/admin/reports", label: "Reports" },
];

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  approved: {
    label: "Approved",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    className: "border-red-200 bg-red-50 text-red-700",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-slate-200 bg-slate-50 text-slate-600",
  },
};

function BookingsSkeleton() {
  return (
    <div className="space-y-8 w-full">
      <div className="space-y-1">
        <Skeleton className="h-8 w-44 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function AdminBookingsPage() {
  const [activeTab, setActiveTab] = useState<"platform" | "outbound">("platform");
  const { data: platformData, isLoading: loadingPlatform } = useBookings();
  const { data: outboundData, isLoading: loadingOutbound } = useMyBookings();
  const { data: venuesData, isLoading: loadingVenues } = useVenues();
  
  const approve = useApproveBooking();
  const reject = useRejectBooking();

  const isLoading = loadingPlatform || loadingOutbound || loadingVenues;

  const currentBookings = activeTab === "platform" ? (platformData ?? []) : (outboundData ?? []);
  const venues = venuesData?.items ?? [];

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

        {isLoading ? (
          <BookingsSkeleton />
        ) : (
          <div className="space-y-8 animate-fade-in">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Bookings
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage platform-wide bookings or check your own outbound bookings
              </p>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Bookings */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                    <CalendarDays className="h-5 w-5" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Bookings</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">{platformData?.length ?? 0}</p>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Requests</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {platformData?.filter(b => b.status === "pending").length ?? 0}
                  </p>
                </div>
              </div>

              {/* Approved Bookings */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Approved Bookings</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {platformData?.filter(b => b.status === "approved").length ?? 0}
                  </p>
                </div>
              </div>

              {/* Cancelled/Rejected */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                    <Inbox className="h-5 w-5 text-red-650" />
                  </div>
                </div>
                <div>
                  <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cancelled / Rejected</h3>
                  <p className="text-2xl font-black text-slate-900 mt-1">
                    {platformData?.filter(b => b.status === "cancelled" || b.status === "rejected").length ?? 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Toggle Tabs */}
            <div className="flex border-b border-slate-100">
              <button
                onClick={() => setActiveTab("platform")}
                className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all ${
                  activeTab === "platform"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                Platform Bookings
              </button>
              <button
                onClick={() => setActiveTab("outbound")}
                className={`ml-6 pb-3 text-sm font-semibold border-b-2 px-1 transition-all ${
                  activeTab === "outbound"
                    ? "border-slate-900 text-slate-900"
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                My Outbound Bookings
              </button>
            </div>

            {/* Booking Cards */}
            {currentBookings.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <Inbox className="mx-auto mb-4 h-10 w-10 text-slate-300" />
                <h3 className="text-base font-semibold text-slate-900">
                  No bookings found
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {activeTab === "platform" 
                    ? "Bookings made by customers on the platform will appear here" 
                    : "Venues you have booked as a guest will appear here"}
                </p>
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {currentBookings.map((booking) => {
                  const venue = venues.find(
                    (v) => v.id === booking.venueId || v.name === booking.venueName
                  );

                  if (activeTab === "outbound") {
                    return (
                      <BookingCard key={booking.id} booking={booking} venue={venue} />
                    );
                  }

                  // Render platform request card
                  const status = statusConfig[booking.status] ?? statusConfig.pending;
                  const isPending = booking.status === "pending";

                  return (
                    <div
                      key={booking.id}
                      className="group rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200 hover:shadow-soft flex gap-4"
                    >
                      {/* Image */}
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={venue?.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
                          alt={booking.venueName ?? "Venue"}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-sm font-bold text-slate-900 truncate">
                              {booking.venueName ?? "Venue Booking"}
                            </h3>
                            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${status.className}`}>
                              <span className="h-1 w-1 rounded-full bg-current" />
                              {status.label}
                            </span>
                          </div>

                          <div className="flex flex-col gap-0.5 mt-1.5 text-[11px] text-slate-400 font-medium">
                            <p className="flex items-center gap-1 text-slate-500">
                              <CalendarDays className="h-3.5 w-3.5" />
                              <ClientDate date={booking.date} />
                            </p>
                            {booking.customerName && (
                              <p>Customer: <span className="text-slate-600 font-semibold">{booking.customerName}</span></p>
                            )}
                            {booking.attendees && (
                              <p>{booking.attendees} guests expected</p>
                            )}
                          </div>
                        </div>

                        {/* Action buttons or ID */}
                        <div className="flex items-center justify-between border-t border-slate-50 pt-2.5 mt-2.5">
                          <p className="text-[10px] text-slate-300 font-mono">ID: {booking.id}</p>
                          {isPending ? (
                            <div className="flex gap-2">
                              <button
                                className="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 px-3 py-1.5 text-xs font-bold transition-colors"
                                onClick={() => approve.mutate(booking.id)}
                              >
                                Approve
                              </button>
                              <button
                                className="rounded-lg bg-red-50 text-red-650 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 text-xs font-bold transition-colors"
                                onClick={() => reject.mutate(booking.id)}
                              >
                                Reject
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
