"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/dashboard/error-state";
import { Pagination } from "@/components/marketplace/pagination";
import { VenueCard } from "@/components/marketplace/venue-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenues } from "@/features/venues/hooks";
import { SlidersHorizontal } from "lucide-react";
import type { VenueFilters } from "@/types/venue";

const venueTypes = [
  { label: "All", value: "all" },
  { label: "Cafes", value: "cafe" },
  { label: "Auditoriums", value: "auditorium" },
  { label: "Convention Halls", value: "convention_hall" },
  { label: "Studios", value: "studio" },
  { label: "Meeting Rooms", value: "meeting_room" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Community Centers", value: "community_center" },
  { label: "Event Venues", value: "event_venue" },
];

export default function VenuesPage() {
  const [filters, setFilters] = useState<VenueFilters>({
    page: 1,
    pageSize: 16,
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
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 space-y-6">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4">
        {/* Type filter pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {venueTypes.map((t) => (
            <button
              key={t.value}
              onClick={() => setFilters((prev) => ({ ...prev, type: t.value as any, page: 1 }))}
              className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                (filters.type ?? "all") === t.value
                  ? "bg-accent text-white shadow-sm"
                  : "bg-white text-[#666] border border-border hover:border-[#ccc] hover:text-[#333]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Sort + Location */}
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Filter by city..."
            value={filters.location ?? ""}
            onChange={(e) => setFilters({ ...filters, location: e.target.value, page: 1 })}
            className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-accent/40 placeholder:text-[#bbb] text-[#333] w-32"
          />
          <select
            value={filters.sortBy ?? "popular"}
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as any, page: 1 })}
            className="rounded-lg border border-border bg-white px-3 py-2 text-xs font-medium focus:outline-none focus:border-accent/40 text-[#333] appearance-none cursor-pointer"
          >
            <option value="popular">Popular</option>
            <option value="price_low">Price ↑</option>
            <option value="price_high">Price ↓</option>
            <option value="capacity">Capacity</option>
          </select>
          <div className="text-xs text-[#999] ml-auto">
            {total} {total === 1 ? "space" : "spaces"} found
          </div>
        </div>
      </div>

      {isError && <ErrorState message="Unable to load venues right now." />}

      {isLoading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-2 animate-pulse">
              <Skeleton className="aspect-[3/4] w-full rounded-xl" />
              <Skeleton className="h-3.5 w-3/4 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-sm text-[#999]">No venues found</p>
          <p className="text-xs text-[#ccc] mt-1">Try adjusting your filters</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {rows.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
          <Pagination
            page={filters.page ?? 1}
            total={total}
            pageSize={filters.pageSize ?? 16}
            onPageChange={(page) => setFilters((prev) => ({ ...prev, page }))}
          />
        </>
      )}
    </div>
  );
}
