"use client";

import { Building2, CalendarCheck, Clock, LayoutGrid, MapPin, Plus, Sparkles, Calendar } from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/features/bookings/hooks";
import { summarizeBookings } from "@/features/dashboard/hooks";
import { useVenues } from "@/features/venues/hooks";
import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import { ClientDate } from "@/components/ui/client-date";

const links = [
  { href: "/dashboard/owner", label: "Overview" },
  { href: "/dashboard/owner/venues", label: "Venues" },
  { href: "/dashboard/owner/bookings", label: "Bookings" },
];

function OverviewSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <Skeleton className="h-8 w-56 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-lg" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
    </div>
  );
}

export default function OwnerDashboardPage() {
  const { data: venueData, isLoading: loadingVenues } = useVenues({
    ownerOnly: true,
  });
  const { data: bookingData, isLoading: loadingBookings } = useBookings();

  const isLoading = loadingVenues || loadingBookings;

  const venues = venueData?.items ?? [];
  const bookings = bookingData ?? [];
  const summary = summarizeBookings(bookings);

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />

      {isLoading ? (
        <OverviewSkeleton />
      ) : (
        <div className="space-y-10 animate-fade-in">
          {/* Header */}
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
                Overview
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Your venues & booking activity at a glance
              </p>
            </div>
            <Link
              href="/dashboard/owner/venues"
              className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Venue
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Listed Venues"
              value={venues.length}
              helper="Active listings"
              index={0}
            />
            <StatCard
              title="Total Bookings"
              value={summary.total}
              helper="All time"
              index={1}
            />
            <StatCard
              title="Pending Requests"
              value={summary.pending}
              helper="Awaiting review"
              index={3}
            />
            <StatCard
              title="Approved"
              value={summary.approved}
              helper="Confirmed bookings"
              index={4}
            />
          </div>

          {/* Split Content Dashboard */}
          <div className="grid gap-8 lg:grid-cols-3">
            
            {/* Left Col (Span 2): Venues list */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                Your listings
              </h2>
              {venues.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center">
                  <p className="text-sm text-slate-400">You haven&apos;t listed any spaces yet.</p>
                  <Link href="/dashboard/owner/venues" className="text-xs font-semibold text-blue-600 hover:underline mt-1.5 inline-block">
                    Add your first venue &rarr;
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {venues.slice(0, 3).map((venue) => (
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
                  {venues.length > 3 && (
                    <Link href="/dashboard/owner/venues" className="text-xs font-bold text-slate-400 hover:text-slate-600 inline-block mt-1">
                      View all listings ({venues.length}) &rarr;
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Right Col: Shortcuts & Recent pending requests */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Quick Actions
                </h2>
                <div className="grid gap-2">
                  <Link
                    href="/dashboard/owner/venues"
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600"
                  >
                    <span>Manage venues</span>
                    <span className="text-slate-300">&rarr;</span>
                  </Link>
                  <Link
                    href="/dashboard/owner/bookings"
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600"
                  >
                    <span>Respond to bookings</span>
                    <span className="text-slate-300">&rarr;</span>
                  </Link>
                </div>
              </div>

              {/* Pending checklist */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Awaiting Review
                </h2>
                {bookings.filter(b => b.status === "pending").length === 0 ? (
                  <div className="rounded-xl border border-dashed border-slate-100 bg-slate-50/50 p-4 text-center">
                    <p className="text-[11px] text-slate-400">All caught up! No requests pending.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookings
                      .filter(b => b.status === "pending")
                      .slice(0, 2)
                      .map((booking) => (
                        <div key={booking.id} className="p-3 border border-slate-100 rounded-xl bg-white space-y-1">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-1">{booking.venueName}</p>
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Calendar className="h-3 w-3" />
                              <ClientDate date={booking.date} />
                            </span>
                            <Link href="/dashboard/owner/bookings" className="font-semibold text-blue-600 hover:underline">
                              Review
                            </Link>
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
