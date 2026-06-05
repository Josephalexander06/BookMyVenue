"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useVenues } from "@/features/venues/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, CheckCircle, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const links = [
  { href: "/dashboard/admin", label: "Overview" },
  { href: "/dashboard/admin/users", label: "Users" },
  { href: "/dashboard/admin/venues", label: "Venues" },
  { href: "/dashboard/admin/bookings", label: "Bookings" },
  { href: "/dashboard/admin/reports", label: "Reports" },
];

export default function AdminVenuesPage() {
  const { data: venuesData, isLoading } = useVenues();
  const venues = venuesData?.items ?? [];

  return (
    <div className="grid gap-8 lg:grid-cols-[260px,1fr]">
      <DashboardSidebar links={links} />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Venues</h1>
          <p className="text-sm text-slate-500 mt-1">Review and manage platform listings</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : venues.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <Building2 className="h-8 w-8 text-slate-300" />
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No venues</h3>
            <p className="mt-1 text-xs text-slate-500">There are no venues listed on the platform yet.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
            <div className="divide-y divide-slate-50">
              {venues.map((venue) => (
                <div key={venue.id} className="flex items-center justify-between p-4 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100 border border-slate-100">
                      {venue.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={venue.imageUrl} alt={venue.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <Building2 className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 line-clamp-1">{venue.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <MapPin className="h-3 w-3" />
                          {venue.location}
                        </span>
                        <span className="text-[11px] text-slate-300">•</span>
                        <span className="text-[11px] font-medium text-slate-500">
                          {formatCurrency(venue.pricing)}/day
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <CheckCircle className="h-3 w-3" />
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
