"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { 
  ArrowRight, 
  ChevronRight, 
  Sparkles, 
  Search, 
  MapPin, 
  Users, 
  SlidersHorizontal
} from "lucide-react";
import { useRouter } from "next/navigation";
import { VenueCard } from "@/components/marketplace/venue-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenues } from "@/features/venues/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useBecomeOwner } from "@/features/auth/hooks";



export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, token, login, openLogin } = useAuthStore();
  const becomeOwnerMutation = useBecomeOwner();
  const { data: venuesData, isLoading } = useVenues();

  const [searchLoc, setSearchLoc] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchCap, setSearchCap] = useState("");

  const allVenues = venuesData?.items ?? [];

  // Group venues by type for horizontal rows
  const popularVenues = allVenues.slice(0, 8);
  const meetingRooms = allVenues.filter((v) => v.type === "meeting_room");
  const eventVenues = allVenues.filter(
    (v) => v.type === "event_venue" || v.type === "convention_hall" || v.type === "auditorium"
  );
  const cafesAndStudios = allVenues.filter(
    (v) => v.type === "cafe" || v.type === "studio"
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let url = "/venues";
    const params = new URLSearchParams();
    if (searchLoc.trim()) {
      params.set("search", searchLoc.trim());
    }
    if (searchType) {
      params.set("type", searchType);
    }
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    router.push(url);
  };

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-white border-b border-slate-100 pb-10">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-12 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl animate-fade-in">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                Find your perfect <span className="text-accent">venue.</span>
              </h1>
              <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-md">
                Discover and book unique spaces for events, meetings, and gatherings.
              </p>
            </div>
            
            {/* Explore Badge */}
            <div className="hidden md:flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-2.5 rounded-2xl border border-slate-150 px-4 py-3 bg-slate-50/50 shadow-soft">
                <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                <div>
                  <span className="block text-xs font-bold text-slate-800">100+ Spaces</span>
                  <span className="block text-[10px] text-slate-500">Verified & Instantly Bookable</span>
                </div>
              </div>
            </div>
          </div>

          {/* Airbnb-style search bar */}
          <div className="mt-8 max-w-4xl">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col md:flex-row items-center gap-2 md:gap-0 rounded-2xl md:rounded-full border border-slate-200 bg-white p-2 shadow-soft hover:shadow-hover transition-shadow"
            >
              {/* Where input */}
              <div className="flex w-full items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
                <MapPin className="h-4 w-4 text-slate-455 shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider">Where</label>
                  <input
                    type="text"
                    placeholder="Search city or location..."
                    value={searchLoc}
                    onChange={(e) => setSearchLoc(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 placeholder-slate-400 outline-none bg-transparent"
                  />
                </div>
              </div>

              {/* Type Select */}
              <div className="flex w-full items-center gap-2.5 px-4 py-2 border-b md:border-b-0 md:border-r border-slate-100">
                <SlidersHorizontal className="h-4 w-4 text-slate-455 shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider">Venue Type</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                  >
                    <option value="">All Spaces</option>
                    <option value="meeting_room">Meeting Rooms</option>
                    <option value="cafe">Cafes</option>
                    <option value="auditorium">Auditoriums</option>
                    <option value="studio">Studios</option>
                    <option value="event_venue">Event Venues</option>
                    <option value="outdoor">Outdoor Spaces</option>
                  </select>
                </div>
              </div>

              {/* Capacity Select */}
              <div className="flex w-full items-center gap-2.5 px-4 py-2">
                <Users className="h-4 w-4 text-slate-455 shrink-0" />
                <div className="w-full">
                  <label className="block text-[9px] font-bold text-slate-700 uppercase tracking-wider">Capacity</label>
                  <select
                    value={searchCap}
                    onChange={(e) => setSearchCap(e.target.value)}
                    className="w-full text-sm font-semibold text-slate-800 outline-none bg-transparent cursor-pointer"
                  >
                    <option value="">Any Capacity</option>
                    <option value="10">Up to 10 guests</option>
                    <option value="50">Up to 50 guests</option>
                    <option value="100">Up to 100 guests</option>
                    <option value="500">100+ guests</option>
                  </select>
                </div>
              </div>

              {/* Search button */}
              <button
                type="submit"
                className="w-full md:w-auto flex items-center justify-center gap-2 rounded-xl md:rounded-full bg-accent px-6 py-3.5 text-sm font-semibold text-white shadow-soft transition-all hover:bg-accent-hover active:scale-[0.97]"
              >
                <Search className="h-4 w-4" />
                <span>Search</span>
              </button>
            </form>
          </div>
        </div>
      </section>



      {/* Venue Rows */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 space-y-10">
        {/* Popular Spaces */}
        <VenueRow
          title="Popular Spaces"
          venues={popularVenues}
          isLoading={isLoading}
          seeAllHref="/venues"
        />

        {/* Meeting Rooms */}
        {(isLoading || meetingRooms.length > 0) && (
          <VenueRow
            title="Meeting Rooms"
            venues={meetingRooms}
            isLoading={isLoading}
            seeAllHref="/venues?type=meeting_room"
          />
        )}

        {/* Event & Convention Venues */}
        {(isLoading || eventVenues.length > 0) && (
          <VenueRow
            title="Event & Convention Spaces"
            venues={eventVenues}
            isLoading={isLoading}
            seeAllHref="/venues?type=event_venue"
          />
        )}

        {/* Cafes & Studios */}
        {(isLoading || cafesAndStudios.length > 0) && (
          <VenueRow
            title="Cafes & Studios"
            venues={cafesAndStudios}
            isLoading={isLoading}
            seeAllHref="/venues?type=cafe"
          />
        )}
      </section>

      {/* CTA Banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-12">
        <div className="rounded-2xl bg-nav p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Have a space?</h3>
            <p className="text-sm text-white/50 mt-1">
              List it and start earning from bookings.
            </p>
          </div>
          <button
            onClick={async () => {
              if (!isAuthenticated) {
                openLogin(async () => {
                  const currentUser = useAuthStore.getState().user;
                  if (currentUser?.role === "owner" || currentUser?.role === "admin") {
                    router.push("/dashboard/owner");
                  } else {
                    router.push("/dashboard/customer/profile?upgrade=true");
                  }
                });
                return;
              }
              if (user?.role === "owner" || user?.role === "admin") {
                router.push("/dashboard/owner");
                return;
              }
              router.push("/dashboard/customer/profile?upgrade=true");
            }}
            className="rounded-lg bg-accent text-white px-6 py-3 text-sm font-semibold hover:bg-accent-hover transition-colors active:scale-[0.97]"
          >
            {!isAuthenticated
              ? "Get started"
              : user?.role === "owner" || user?.role === "admin"
              ? "Manage spaces"
              : "Become a host"}
          </button>
        </div>
      </section>
    </div>
  );
}

/* ─── Horizontal Scroll Row ──────────────────────────────────────── */

function VenueRow({
  title,
  venues,
  isLoading,
  seeAllHref,
}: {
  title: string;
  venues: any[];
  isLoading: boolean;
  seeAllHref: string;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        <Link
          href={seeAllHref}
          className="flex items-center gap-0.5 text-xs font-semibold text-accent hover:text-accent-hover transition-colors"
        >
          See All
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {isLoading ? (
        <div className="scroll-row">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-[176px] sm:w-[200px] shrink-0">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-3.5 w-3/4 rounded mt-2" />
              <Skeleton className="h-3 w-1/2 rounded mt-1" />
            </div>
          ))}
        </div>
      ) : venues.length > 0 ? (
        <div className="scroll-row">
          {venues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
