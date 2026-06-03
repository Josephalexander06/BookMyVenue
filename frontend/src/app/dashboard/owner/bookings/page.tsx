"use client";

import { useState } from "react";
import { CalendarDays, Inbox } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
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
  { href: "/dashboard/owner", label: "Overview" },
  { href: "/dashboard/owner/venues", label: "Venues" },
  { href: "/dashboard/owner/bookings", label: "Bookings" },
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
};

function BookingsSkeleton() {
  return (
    <div className="space-y-8">
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

export default function OwnerBookingsPage() {
  const [activeTab, setActiveTab] = useState<"incoming" | "outbound">("incoming");
  const { data: incomingData, isLoading: loadingIncoming } = useBookings();
  const { data: outboundData, isLoading: loadingOutbound } = useMyBookings();
  const { data: venuesData, isLoading: loadingVenues } = useVenues();
  
  const approve = useApproveBooking();
  const reject = useRejectBooking();

  const isLoading = loadingIncoming || loadingOutbound || loadingVenues;

  const currentBookings = activeTab === "incoming" ? (incomingData ?? []) : (outboundData ?? []);
  const venues = venuesData?.items ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />

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
              Manage incoming requests and your own outbound bookings
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex border-b border-slate-100">
            <button
              onClick={() => setActiveTab("incoming")}
              className={`pb-3 text-sm font-semibold border-b-2 px-1 transition-all ${
                activeTab === "incoming"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              Received Requests
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
                No bookings yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                {activeTab === "incoming" 
                  ? "Booking requests from customers will appear here" 
                  : "Venues you have booked will appear here"}
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

                // Render incoming request card
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
                            <p>Requested by: <span className="text-slate-600 font-semibold">{booking.customerName}</span></p>
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
                              className="rounded-lg bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 px-3 py-1.5 text-xs font-bold transition-colors"
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
  );
}
