"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { BookingCard } from "@/components/marketplace/booking-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { StatCard } from "@/components/dashboard/stat-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/features/bookings/hooks";
import { summarizeBookings } from "@/features/dashboard/hooks";
import { useVenues } from "@/features/venues/hooks";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";

const links = [
  { href: "/dashboard/customer", label: "Overview" },
  { href: "/dashboard/customer/profile", label: "Profile" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-10">
      <div className="space-y-1">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-2xl" />
        ))}
      </div>

      <div className="space-y-4">
        <Skeleton className="h-5 w-36 rounded-lg" />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { data: bookingsData, isLoading: loadingBookings } = useBookings();
  const { data: venuesData, isLoading: loadingVenues } = useVenues();

  const isLoading = loadingBookings || loadingVenues;

  if (isLoading) return <DashboardSkeleton />;

  const bookings = bookingsData ?? [];
  const venues = venuesData?.items ?? [];
  const summary = summarizeBookings(bookings);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />
      <div className="space-y-10 animate-fade-in">
        {/* Greeting */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
              {greeting} ✨
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Here&apos;s what&apos;s happening with your bookings
            </p>
          </div>
          <Link
            href="/venues"
            className="group hidden items-center gap-2 rounded-full bg-slate-900 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-slate-800 sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            Browse Spaces
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Total Bookings" value={summary.total} />
          <StatCard title="Pending" value={summary.pending} />
          <StatCard title="Approved" value={summary.approved} />
          <StatCard title="Rejected" value={summary.rejected} />
        </div>

        {/* Bookings */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-slate-900">Your Bookings</h2>

          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Discover and book stunning venues for your next event."
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {bookings.map((booking) => {
                const venue = venues.find(
                  (v) => v.id === booking.venueId || v.name === booking.venueName
                );
                return (
                  <BookingCard key={booking.id} booking={booking} venue={venue} />
                );
              })}
            </div>
          )}
        </section>

        {/* Mobile CTA */}
        <div className="sm:hidden">
          <Link
            href="/venues"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4" />
            Browse Spaces
          </Link>
        </div>
      </div>
    </div>
  );
}
