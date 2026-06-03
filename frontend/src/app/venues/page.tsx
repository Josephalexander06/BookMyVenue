"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/dashboard/error-state";
import { Pagination } from "@/components/marketplace/pagination";
import { VenueCard } from "@/components/marketplace/venue-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenues } from "@/features/venues/hooks";
import { Search } from "lucide-react";
import type { VenueFilters } from "@/types/venue";

export default function VenuesPage() {
  const [filters, setFilters] = useState<VenueFilters>({
    page: 1,
    pageSize: 12,
    sortBy: "popular",
    type: "all",
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const searchParam = params.get("search");
      const typeParam = params.get("type");
      if (searchParam || typeParam) {
        setFilters((prev) => ({
          ...prev,
          search: searchParam ?? prev.search,
          type: (typeParam as any) ?? prev.type,
        }));
      }
    }
  }, []);

  const { data, isLoading, isError } = useVenues(filters);

  const rows = useMemo(() => {
    const baseItems = data?.items ?? [];

    return baseItems.filter((venue) => {
      const matchesSearch = filters.search
        ? `${venue.name} ${venue.location}`.toLowerCase().includes(filters.search.toLowerCase())
        : true;
      const matchesLocation = filters.location
        ? venue.location.toLowerCase().includes(filters.location.toLowerCase())
        : true;
      const matchesType = filters.type && filters.type !== "all" ? venue.type === filters.type : true;
      const matchesCapacity = filters.minCapacity ? venue.capacity >= filters.minCapacity : true;
      return matchesSearch && matchesLocation && matchesType && matchesCapacity;
    });
  }, [data?.items, filters]);

  const total = rows.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-center">
        {/* Search input */}
        <div className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
          <input
            type="text"
            placeholder="Search spaces..."
            value={filters.search ?? ""}
            onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value, page: 1 }))}
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-200 placeholder:text-slate-300 transition-all"
          />
        </div>

        {/* Filter pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="City"
            value={filters.location ?? ""}
            onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-none focus:border-slate-300 bg-white placeholder:text-slate-300 text-slate-700 w-24"
          />

          <select
            value={filters.type ?? "all"}
            onChange={(e) => setFilters({ ...filters, type: e.target.value as any, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-none focus:border-slate-300 bg-white text-slate-700 appearance-none cursor-pointer"
          >
            <option value="all">All types</option>
            <option value="cafe">Cafe</option>
            <option value="auditorium">Auditorium</option>
            <option value="convention_hall">Convention Hall</option>
            <option value="studio">Studio</option>
            <option value="meeting_room">Meeting Room</option>
            <option value="outdoor">Outdoor</option>
            <option value="community_center">Community Center</option>
            <option value="event_venue">Event Venue</option>
          </select>

          <select
            value={filters.sortBy ?? "popular"}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any, page: 1 })}
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium focus:outline-none focus:border-slate-300 bg-white text-slate-700 appearance-none cursor-pointer"
          >
            <option value="popular">Popular</option>
            <option value="price_low">Price ↑</option>
            <option value="price_high">Price ↓</option>
            <option value="capacity">Capacity</option>
          </select>
        </div>
      </div>

      {isError && <ErrorState message="Unable to load venues right now." />}

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <Skeleton className="aspect-[4/3] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
              <Skeleton className="h-3 w-1/3 rounded" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-slate-400">No venues found</p>
          <p className="text-xs text-slate-300 mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {rows.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
          <Pagination
            page={filters.page ?? 1}
            total={total}
            pageSize={filters.pageSize ?? 12}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </>
      )}
    </div>
  );
}
