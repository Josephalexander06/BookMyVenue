"use client";

import { Activity, BarChart3, Building2, Users, MapPin, Calendar } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/features/bookings/hooks";
import { useVenues } from "@/features/venues/hooks";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { ClientDate } from "@/components/ui/client-date";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/venues", label: "Venues" },
  { href: "/dashboard/admin/bookings", label: "Bookings" },
  { href: "/dashboard/admin/reports", label: "Reports" },
];

function AdminSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-36 w-full rounded-2xl" />
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { data: bookingsData, isLoading: loadingBookings } = useBookings();
  const { data: venuesData, isLoading: loadingVenues } = useVenues();

  const isLoading = loadingBookings || loadingVenues;

  const bookings = bookingsData ?? [];
  const venues = venuesData?.items ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />

      {isLoading ? (
        <AdminSkeleton />
      ) : (
        <div className="space-y-10 animate-fade-in">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              Admin Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Platform metrics and activity
            </p>
          </div>

          {/* Platform Stats */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total Venues"
              value={venues.length}
              helper="Across all owners"
              index={0}
            />
            <StatCard
              title="Total Bookings"
              value={bookings.length}
              helper="All time"
              index={1}
            />
            <StatCard
              title="Pending Review"
              value={bookings.filter((b) => b.status === "pending").length}
              helper="Awaiting action"
              index={3}
            />
            <StatCard
              title="Approved"
              value={bookings.filter((b) => b.status === "approved").length}
              helper="Confirmed"
              index={4}
            />
          </div>

          {/* Split Content Dashboard */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left Col (Span 2): Platform Listings */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Recent listings
              </h2>
              {venues.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-400">No spaces listed on the platform yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {venues.slice(0, 4).map((venue) => (
                    <div key={venue.id} className="flex gap-4 p-3 border border-slate-100 rounded-xl bg-white hover:border-slate-200 transition-all">
                      <div className="h-16 w-20 shrink-0 rounded-lg overflow-hidden border border-slate-50 bg-slate-50">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"} alt={venue.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="text-sm font-semibold text-slate-900 truncate">{venue.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {venue.location}
                          </p>
                        </div>
                        <p className="text-xs font-bold text-slate-700">{formatCurrency(venue.pricing)}/day</p>
                      </div>
                    </div>
                  ))}
                  {venues.length > 4 && (
                    <Link href="/dashboard/admin/venues" className="text-xs font-bold text-slate-400 hover:text-slate-600 inline-block mt-1">
                      Manage all listings ({venues.length}) &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right Col: Admin Shortcuts & Platform activity */}
            <div className="space-y-6">
              {/* Quick Navigation */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </h2>
                <div className="grid gap-2">
                  <Link
                    href="/dashboard/admin/users"
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600"
                  >
                    <span>Manage users</span>
                    <span className="text-slate-300">&rarr;</span>
                  </Link>
                  <Link
                    href="/dashboard/admin/venues"
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600"
                  >
                    <span>Moderate listings</span>
                    <span className="text-slate-300">&rarr;</span>
                  </Link>
                  <Link
                    href="/dashboard/admin/reports"
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600"
                  >
                    <span>Review reports</span>
                    <span className="text-slate-300">&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Recent activity log */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Recent Bookings
                </h2>
                {bookings.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-100 bg-slate-50/50 p-4 text-center">
                    <p className="text-[11px] text-slate-400">No bookings recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookings
                      .slice(0, 3)
                      .map((booking) => (
                        <div key={booking.id} className="p-3 border border-slate-100 rounded-xl bg-white space-y-1">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">{booking.venueName}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              <ClientDate date={booking.date} />
                            </span>
                            <span className={`font-semibold uppercase text-[9px] px-1.5 py-0.5 rounded-full ${
                              booking.status === "approved" 
                                ? "bg-emerald-50 text-emerald-600" 
                                : booking.status === "rejected" 
                                ? "bg-red-50 text-red-500" 
                                : booking.status === "cancelled"
                                ? "bg-slate-100 text-slate-500"
                                : "bg-amber-50 text-amber-500"
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
