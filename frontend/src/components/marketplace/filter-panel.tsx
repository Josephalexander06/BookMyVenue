"use client";

import { SlidersHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import type { VenueFilters } from "@/types/venue";

interface FilterPanelProps {
  filters: VenueFilters;
  onChange: (next: VenueFilters) => void;
}

function FilterFields({ filters, onChange }: FilterPanelProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Location</label>
        <Input
          placeholder="City or area"
          value={filters.location ?? ""}
          onChange={(event) => onChange({ ...filters, location: event.target.value, page: 1 })}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Venue Type</label>
        <Select
          value={filters.type ?? "all"}
          onChange={(event) => onChange({ ...filters, type: event.target.value as VenueFilters["type"], page: 1 })}
        >
          <option value="all">All types</option>
          <option value="cafe">Cafe</option>
          <option value="auditorium">Auditorium</option>
          <option value="convention_hall">Convention Hall</option>
          <option value="studio">Studio</option>
          <option value="meeting_room">Meeting Room</option>
          <option value="outdoor">Outdoor Space</option>
          <option value="community_center">Community Center</option>
          <option value="event_venue">Event Venue</option>
        </Select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Minimum Capacity</label>
        <Input
          type="number"
          min={0}
          value={filters.minCapacity ?? ""}
          onChange={(event) =>
            onChange({
              ...filters,
              minCapacity: event.target.value ? Number(event.target.value) : undefined,
              page: 1,
            })
          }
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Sort By</label>
        <Select
          value={filters.sortBy ?? "popular"}
          onChange={(event) =>
            onChange({ ...filters, sortBy: event.target.value as VenueFilters["sortBy"], page: 1 })
          }
        >
          <option value="popular">Most Popular</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="capacity">Capacity</option>
        </Select>
      </div>
    </div>
  );
}

export function FilterPanel({ filters, onChange }: FilterPanelProps) {
  return (
    <>
      <aside className="hidden rounded-2xl border border-slate-200 bg-white p-5 lg:block">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Filters</h2>
        <FilterFields filters={filters} onChange={onChange} />
      </aside>

      <div className="lg:hidden">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Open Filters
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogTitle className="mb-4 text-lg font-semibold text-slate-900">Filters</DialogTitle>
            <FilterFields filters={filters} onChange={onChange} />
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
