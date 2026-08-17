"use client";

import { useEffect, useMemo, useState } from "react";
import { ErrorState } from "@/components/dashboard/error-state";
import { Pagination } from "@/components/marketplace/pagination";
import { VenueCard } from "@/components/marketplace/venue-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenues } from "@/features/venues/hooks";
import { SlidersHorizontal, MapPin } from "lucide-react";
import type { VenueFilters } from "@/types/venue";

const venueTypes = [
  { label: "All", value: "all" },
  { label: "Meeting Rooms", value: "meeting_room" },
  { label: "Cafes", value: "cafe" },
  { label: "Auditoriums", value: "auditorium" },
  { label: "Studios", value: "studio" },
  { label: "Outdoor", value: "outdoor" },
  { label: "Event Venues", value: "event_venue" },
  { label: "Community Centers", value: "community_center" },
  { label: "Convention Halls", value: "convention_hall" },
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
      const syncFromUrl = () => {
        const params = new URLSearchParams(window.location.search);
        const searchParam = params.get("search");
        const typeParam = params.get("type");
        setFilters((prev) => ({
          ...prev,
          search: searchParam ?? "",
          type: (typeParam as any) ?? prev.type ?? "all",
        }));
      };

      syncFromUrl();
      window.addEventListener("popstate", syncFromUrl);
      return () => window.removeEventListener("popstate", syncFromUrl);
    }
  }, []);

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({ ...prev, search: val, page: 1 }));
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (val.trim()) {
        params.set("search", val);
      } else {
        params.delete("search");
      }
      const queryString = params.toString();
      const newUrl = queryString ? `/venues?${queryString}` : "/venues";
      window.history.replaceState(null, "", newUrl);
    }
  };

  const { data, isLoading, isError } = useVenues(filters);

  const rows = useMemo(() => {
    const baseItems = data?.items ?? [];
    return baseItems.filter((venue) => {
      const matchesType = filters.type && filters.type !== "all" ? venue.type === filters.type : true;
      const matchesCapacity = filters.minCapacity ? venue.capacity >= filters.minCapacity : true;
      return matchesType && matchesCapacity;
    });
  }, [data?.items, filters.type, filters.minCapacity]);

  const total = rows.length;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 space-y-8 animate-fade-in font-sans">

      {/* Filters Bar */}
      <div className="flex flex-col gap-6 bg-white p-6 border border-slate-100 rounded-2xl shadow-soft">
        {/* Type filter pills */}
        <div className="space-y-2">
          <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Browse by Category</label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {venueTypes.map((t) => (
              <button
                key={t.value}
                onClick={() => setFilters((prev) => ({ ...prev, type: t.value as any, page: 1 }))}
                className={`shrink-0 rounded-xl px-4 py-2 text-xs font-bold transition-all border ${
                  (filters.type ?? "all") === t.value
                    ? "bg-[#0052ff] border-[#0052ff] text-white shadow-md shadow-blue-500/10"
                    : "bg-white text-slate-600 border-slate-100 hover:border-slate-200 hover:text-slate-800"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sort + Location */}
        <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-slate-50">
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-2.5 shadow-sm max-w-md w-full sm:w-auto">
            <MapPin className="h-4 w-4 text-[#0052ff] shrink-0" />
            <input
              type="text"
              placeholder="Search keyword, venue name or location..."
              value={filters.search ?? ""}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="text-xs font-bold text-slate-700 placeholder-slate-400 outline-none bg-transparent w-full sm:w-64"
            />
          </div>
          
          <div className="text-xs font-bold text-slate-400 sm:ml-auto">
            Showing {total} {total === 1 ? "space" : "spaces"}
          </div>
        </div>
      </div>

      {isError && <ErrorState message="Unable to load venues right now." />}

      {isLoading ? (
        <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <Skeleton className="aspect-[3/4] w-full rounded-2xl" />
              <Skeleton className="h-4 w-3/4 rounded-lg" />
              <Skeleton className="h-3.5 w-1/2 rounded-lg" />
            </div>
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="text-center py-24 bg-white border border-slate-100 rounded-2xl shadow-soft">
          <p className="text-sm font-bold text-slate-400">No venues match your criteria</p>
          <p className="text-xs text-slate-300 mt-1">Try searching a different location or adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
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
        </div>
      )}
    </div>
  );
}
