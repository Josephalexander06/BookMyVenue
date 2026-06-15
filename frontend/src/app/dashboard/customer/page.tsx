"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, MapPin, Calendar, Users, Star, CheckCircle, CreditCard } from "lucide-react";
import { BookingCard } from "@/components/marketplace/booking-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useBookings } from "@/features/bookings/hooks";
import { summarizeBookings } from "@/features/dashboard/hooks";
import { useVenues } from "@/features/venues/hooks";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useAuthStore } from "@/store/auth-store";
import { ClientDate } from "@/components/ui/client-date";

const links = [
  { href: "/dashboard/customer", label: "Overview" },
  { href: "/dashboard/customer/profile", label: "Profile" },
];

function DashboardSkeleton() {
  return (
    <div className="space-y-8 font-sans">
      <DashboardSidebar links={links} />
      <div className="space-y-10">
        <div className="space-y-1">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-lg" />
        </div>
        <Skeleton className="h-44 w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-5 w-36 rounded-lg" />
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-40 w-full rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboardPage() {
  const { data: bookingsData, isLoading: loadingBookings } = useBookings();
  const { data: venuesData, isLoading: loadingVenues } = useVenues();
  const { user } = useAuthStore();

  const isLoading = loadingBookings || loadingVenues;

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const bookings = bookingsData ?? [];
  const venues = venuesData?.items ?? [];
  const summary = summarizeBookings(bookings);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  // Find next upcoming confirmed booking
  const nextBooking = bookings
    .filter((b) => b.status === "approved" && new Date(b.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

  return (
    <div className="space-y-8 font-sans text-slate-800">
      <DashboardSidebar links={links} />

      <div className="space-y-10 animate-fade-in">
        {/* Greeting & Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              {greeting}, {user?.name ?? "Explorer"} ✨
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your spaces and trace your upcoming reservations.
            </p>
          </div>
          <Link
            href="/venues"
            className="group hidden items-center gap-2 rounded-xl bg-[#0052ff] hover:bg-[#004ced] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/10 transition-all active:scale-95 sm:inline-flex"
          >
            <Sparkles className="h-4 w-4" />
            Browse Spaces
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Profile Bento Section */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Main User Info Card */}
          <div className="md:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-soft relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-tr from-blue-500 to-[#0052ff] text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0 border border-blue-100">
              {(user?.name ?? "U").substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-grow text-center sm:text-left space-y-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{user?.name ?? "Alex Morgan"}</h2>
                <p className="text-xs font-semibold text-slate-400 mt-1 flex items-center justify-center sm:justify-start gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {user?.phone ?? "No location provided"}
                </p>
              </div>
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="bg-slate-50 border border-slate-100/50 px-4 py-2 rounded-xl text-left">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Verified Account</p>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Active Member
                  </p>
                </div>
                <div className="bg-slate-50 border border-slate-100/50 px-4 py-2 rounded-xl text-left">
                  <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                  <p className="text-xs font-bold text-slate-800 mt-0.5">{bookings.length} reservations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action / Next Booking Bento */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-soft relative overflow-hidden flex flex-col justify-between group cursor-pointer transition-transform hover:-translate-y-0.5">
            <div className="absolute right-0 top-0 w-28 h-28 bg-white/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
            <div className="flex justify-between items-start z-10">
              <span className="text-[10px] font-extrabold uppercase text-blue-300 tracking-wider">Next Event</span>
              <Calendar className="h-4 w-4 text-blue-300" />
            </div>
            <div className="z-10 mt-6 space-y-1">
              {nextBooking ? (
                <>
                  <h3 className="text-lg font-black">{nextBooking.venueName}</h3>
                  <p className="text-xs font-semibold text-blue-200">
                    <ClientDate date={nextBooking.date} />
                  </p>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-black">No upcoming events</h3>
                  <p className="text-xs font-semibold text-blue-200">Book your next space</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <section className="space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Your Bookings</h2>

          {bookings.length === 0 ? (
            <EmptyState
              title="No bookings yet"
              description="Discover and book stunning venues for your next event."
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-xs font-bold text-white transition-all hover:bg-slate-800"
          >
            <Sparkles className="h-4 w-4" />
            Browse Spaces
          </Link>
        </div>
      </div>
    </div>
  );
}
