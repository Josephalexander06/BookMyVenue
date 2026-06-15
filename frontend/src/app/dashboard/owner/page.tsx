"use client";

import { useState } from "react";
import { 
  Building2, 
  CalendarCheck, 
  Clock, 
  MapPin, 
  Plus, 
  Calendar, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Info, 
  MessageSquare 
} from "lucide-react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
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
    <div className="h-full overflow-y-auto p-6 md:p-8 space-y-8 font-sans">
      <DashboardSidebar links={links} />
      <div className="space-y-8 animate-pulse">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-xl" />
          <Skeleton className="h-4 w-72 rounded-lg" />
        </div>
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

export default function OwnerDashboardPage() {
  const { data: venueData, isLoading: loadingVenues } = useVenues({
    ownerOnly: true,
  });
  const { data: bookingData, isLoading: loadingBookings } = useBookings();
  const [selectedVenueFilter, setSelectedVenueFilter] = useState("all");

  const isLoading = loadingVenues || loadingBookings;

  const venues = venueData?.items ?? [];
  const bookings = bookingData ?? [];
  const summary = summarizeBookings(bookings);

  if (isLoading) {
    return <OverviewSkeleton />;
  }

  // Calculate actual revenue from approved bookings
  const approvedBookings = bookings.filter((b) => b.status === "approved");
  const totalRevenue = approvedBookings.reduce((sum, b) => {
    const venue = venues.find((v) => v.id === b.venueId || v.name === b.venueName);
    return sum + (venue?.pricing ?? 1200);
  }, 0);

  // Dynamic Occupancy rate based on bookings & listings
  const occupancyRate = venues.length > 0
    ? Math.min(100, Math.round((approvedBookings.length / (venues.length * 4 || 1)) * 100))
    : 74;

  // Dynamic Conversion Rate based on approved bookings vs total inquiries
  const conversionRate = bookings.length > 0
    ? ((approvedBookings.length / bookings.length) * 100).toFixed(1)
    : "3.8";

  // Upcoming bookings
  const upcomingCount = bookings.filter(
    (b) => b.status === "approved" && new Date(b.date) >= new Date()
  ).length;

  // Filter bookings for chart or list if needed
  const pendingRequests = bookings.filter((b) => b.status === "pending");

  return (
    <div className="h-full overflow-y-auto p-6 md:p-8 pb-16 font-sans text-slate-800">
      <DashboardSidebar links={links} />

      <div className="space-y-10 animate-fade-in">
        {/* Header & Quick Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Performance Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Last 30 days compared to previous period
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto shrink-0">
            <Link
              href="/dashboard/owner/bookings"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-all active:scale-[0.98] shadow-sm"
            >
              <Calendar className="h-4 w-4 text-slate-450" />
              Manage Bookings
            </Link>
            <Link
              href="/dashboard/owner/venues/new"
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-950 text-white font-bold text-xs hover:bg-slate-800 transition-all active:scale-[0.98] shadow-sm"
            >
              <Plus className="h-4 w-4" />
              List Your Space
            </Link>
          </div>
        </div>

        {/* Key Metrics Grid (Stripe-inspired) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0052ff]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Gross Revenue
                <span title="Total revenue from approved bookings" className="cursor-help">
                  <Info className="h-3.5 w-3.5 text-slate-300" />
                </span>
              </p>
              <div className="flex items-baseline gap-2.5">
                <h3 className="text-3xl font-black text-slate-900">{formatCurrency(totalRevenue)}</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-auto">
                  <TrendingUp className="h-3 w-3" /> 12.5%
                </span>
              </div>
            </div>
            <div className="h-10 w-full relative mt-4">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,25 C20,20 30,10 50,15 C70,20 80,5 100,2 L100,30 L0,30 Z" fill="rgba(0, 82, 255, 0.05)"></path>
                <path d="M0,25 C20,20 30,10 50,15 C70,20 80,5 100,2" fill="none" stroke="#0052ff" strokeWidth="2"></path>
              </svg>
            </div>
          </div>

          {/* Upcoming Bookings */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Upcoming Bookings
              </p>
              <div className="flex items-baseline gap-2.5">
                <h3 className="text-3xl font-black text-slate-900">{upcomingCount}</h3>
                <span className="text-xs font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-auto">
                  0%
                </span>
              </div>
            </div>
            <div className="h-10 w-full relative mt-4">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,15 C20,15 30,18 50,15 C70,12 80,15 100,15 L100,30 L0,30 Z" fill="rgba(113, 113, 113, 0.05)"></path>
                <path d="M0,15 C20,15 30,18 50,15 C70,12 80,15 100,15" fill="none" stroke="#717171" strokeWidth="2"></path>
              </svg>
            </div>
          </div>

          {/* Occupancy Rate */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Occupancy Rate
              </p>
              <div className="flex items-baseline gap-2.5">
                <h3 className="text-3xl font-black text-slate-900">{occupancyRate}%</h3>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-auto">
                  <TrendingUp className="h-3 w-3" /> 4.2%
                </span>
              </div>
            </div>
            <div className="h-10 w-full relative mt-4">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,20 C30,5 40,25 60,10 C80,-5 90,15 100,5 L100,30 L0,30 Z" fill="rgba(79, 70, 229, 0.05)"></path>
                <path d="M0,20 C30,5 40,25 60,10 C80,-5 90,15 100,5" fill="none" stroke="#4f46e5" strokeWidth="2"></path>
              </svg>
            </div>
          </div>

          {/* Conversion Rate */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col justify-between">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5">
                Conversion Rate
              </p>
              <div className="flex items-baseline gap-2.5">
                <h3 className="text-3xl font-black text-slate-900">{conversionRate}%</h3>
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded flex items-center gap-0.5 ml-auto">
                  <TrendingDown className="h-3 w-3" /> 1.1%
                </span>
              </div>
            </div>
            <div className="h-10 w-full relative mt-4">
              <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 30">
                <path d="M0,5 C20,10 40,5 60,20 C80,25 90,15 100,25 L100,30 L0,30 Z" fill="rgba(244, 63, 94, 0.05)"></path>
                <path d="M0,5 C20,10 40,5 60,20 C80,25 90,15 100,25" fill="none" stroke="#f43f5e" strokeWidth="2"></path>
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Col (Span 2): Listing Performance Chart */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-soft p-6 sm:p-8 flex flex-col h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Listing Performance</h2>
                <p className="text-slate-400 text-xs mt-0.5">Views vs. Bookings across all properties</p>
              </div>
              <select 
                value={selectedVenueFilter}
                onChange={(e) => setSelectedVenueFilter(e.target.value)}
                className="bg-slate-50 border border-slate-100 text-xs font-bold rounded-xl px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0052ff]/20 focus:border-[#0052ff] cursor-pointer"
              >
                <option value="all">All Venues</option>
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </div>

            {/* Premium Interactive Bar Chart (Tailwind + CSS grid layout) */}
            <div className="relative flex-grow min-h-[300px] flex flex-col justify-end mt-4">
              {/* Horizontal grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-8">
                <div className="border-t border-slate-100/70 w-full h-0"></div>
                <div className="border-t border-slate-100/70 w-full h-0"></div>
                <div className="border-t border-slate-100/70 w-full h-0"></div>
                <div className="border-t border-slate-100/70 w-full h-0"></div>
                <div className="border-t border-slate-100/70 w-full h-0"></div>
              </div>

              {/* Chart Bars */}
              <div className="flex justify-between items-end gap-3 px-2 z-10 h-64 w-full relative pb-8">
                {/* Mon */}
                <div className="flex flex-col justify-end w-[12%] group h-full relative">
                  <div className="w-full bg-slate-100/80 rounded-t-lg h-[40%] group-hover:bg-slate-200 transition-all relative">
                    <div className="w-full bg-[#0052ff] rounded-t-lg h-[35%] absolute bottom-0"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold text-center mt-2 absolute -bottom-6 left-1/2 -translate-x-1/2">Mon</span>
                </div>
                {/* Tue */}
                <div className="flex flex-col justify-end w-[12%] group h-full relative">
                  <div className="w-full bg-slate-100/80 rounded-t-lg h-[65%] group-hover:bg-slate-200 transition-all relative">
                    <div className="w-full bg-[#0052ff] rounded-t-lg h-[40%] absolute bottom-0"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold text-center mt-2 absolute -bottom-6 left-1/2 -translate-x-1/2">Tue</span>
                </div>
                {/* Wed */}
                <div className="flex flex-col justify-end w-[12%] group h-full relative">
                  <div className="w-full bg-slate-100/80 rounded-t-lg h-[45%] group-hover:bg-slate-200 transition-all relative">
                    <div className="w-full bg-[#0052ff] rounded-t-lg h-[20%] absolute bottom-0"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold text-center mt-2 absolute -bottom-6 left-1/2 -translate-x-1/2">Wed</span>
                </div>
                {/* Thu */}
                <div className="flex flex-col justify-end w-[12%] group h-full relative">
                  <div className="w-full bg-slate-100/80 rounded-t-lg h-[80%] group-hover:bg-slate-200 transition-all relative">
                    <div className="w-full bg-[#0052ff] rounded-t-lg h-[50%] absolute bottom-0"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold text-center mt-2 absolute -bottom-6 left-1/2 -translate-x-1/2">Thu</span>
                </div>
                {/* Fri */}
                <div className="flex flex-col justify-end w-[12%] group h-full relative">
                  <div className="w-full bg-slate-100/80 rounded-t-lg h-[100%] group-hover:bg-slate-200 transition-all relative">
                    <div className="w-full bg-[#0052ff] rounded-t-lg h-[75%] absolute bottom-0"></div>
                  </div>
                  <span className="text-[10px] text-slate-900 font-extrabold text-center mt-2 absolute -bottom-6 left-1/2 -translate-x-1/2">Fri</span>
                </div>
                {/* Sat */}
                <div className="flex flex-col justify-end w-[12%] group h-full relative">
                  <div className="w-full bg-slate-100/80 rounded-t-lg h-[90%] group-hover:bg-slate-200 transition-all relative">
                    <div className="w-full bg-[#0052ff] rounded-t-lg h-[65%] absolute bottom-0"></div>
                  </div>
                  <span className="text-[10px] text-slate-900 font-extrabold text-center mt-2 absolute -bottom-6 left-1/2 -translate-x-1/2">Sat</span>
                </div>
                {/* Sun */}
                <div className="flex flex-col justify-end w-[12%] group h-full relative">
                  <div className="w-full bg-slate-100/80 rounded-t-lg h-[55%] group-hover:bg-slate-200 transition-all relative">
                    <div className="w-full bg-[#0052ff] rounded-t-lg h-[30%] absolute bottom-0"></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold text-center mt-2 absolute -bottom-6 left-1/2 -translate-x-1/2">Sun</span>
                </div>
              </div>
            </div>

            {/* Legend indicators */}
            <div className="flex items-center gap-6 mt-8 justify-center text-xs font-bold">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200" />
                <span className="text-slate-500">Page Views</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#0052ff]" />
                <span className="text-slate-500">Confirmed Bookings</span>
              </div>
            </div>
          </div>

          {/* Right Col: Recent Inquiries */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-soft p-6 flex flex-col h-full justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-extrabold text-slate-900">Recent Inquiries</h2>
                <Link href="/dashboard/owner/bookings" className="text-xs font-bold text-[#0052ff] hover:underline">
                  View all
                </Link>
              </div>

              {/* Inquiry list content */}
              {pendingRequests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center py-12">
                  <p className="text-xs font-bold text-slate-400">All caught up! No bookings pending.</p>
                  <p className="text-[11px] text-slate-350 mt-1">Review bookings in the bookings tab.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4 overflow-y-auto max-h-[360px] pr-1 scrollbar-thin">
                  {pendingRequests.slice(0, 4).map((booking) => {
                    const initials = (booking.customerName ?? "Guest").substring(0, 2).toUpperCase();
                    return (
                      <div key={booking.id} className="group flex gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                        {/* Avatar */}
                        <div className="w-11 h-11 rounded-full overflow-hidden flex-shrink-0 bg-slate-100 text-slate-600 border border-slate-200 flex items-center justify-center font-black text-sm relative">
                          {initials}
                          <div className="absolute bottom-0 right-0 bg-[#0052ff] text-white w-3.5 h-3.5 rounded-full flex items-center justify-center ring-2 ring-white">
                            <Clock className="w-2 h-2" />
                          </div>
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex justify-between items-start mb-0.5">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{booking.customerName ?? "Anonymous Guest"}</h4>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap ml-2">
                              <ClientDate date={booking.date} />
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 truncate mb-1">
                            Inquiry for {booking.venueName}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wide text-amber-700 bg-amber-50 border border-amber-100/50 px-1.5 py-0.5 rounded">
                              Pending
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <Link 
              href="/dashboard/owner/bookings" 
              className="w-full mt-6 py-3 rounded-xl bg-slate-950 text-white font-bold text-center text-xs hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5"
            >
              <MessageSquare className="h-4 w-4" />
              Respond to Inquiries ({pendingRequests.length})
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
