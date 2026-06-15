"use client";

import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useVenues } from "@/features/venues/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, MapPin, CheckCircle, AlertCircle, Clock, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

import { AdminSidebar } from "@/components/dashboard/admin-sidebar";

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

  const totalListings = venues.length;
  const approvedCount = venues.length; // all currently listed items are approved
  const pendingCount = 0;
  const avgPricing = venues.length > 0 ? Math.round(venues.reduce((sum, v) => sum + v.pricing, 0) / venues.length) : 0;

  return (
    <div className="flex h-full bg-[#F8F9FC] font-sans w-full">
      {/* Left Sidebar Layout */}
      <AdminSidebar />

      {/* Main Content Layout */}
      <div className="flex-grow p-6 md:p-8 space-y-8 overflow-y-auto h-full pb-16">
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DashboardSidebar links={links} />
        </div>

        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Venues</h1>
            <p className="text-sm text-slate-500 mt-1">Review and manage platform listings</p>
          </div>

          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Listings */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                  <Building2 className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Listings</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{totalListings}</p>
              </div>
            </div>

            {/* Approved Venues */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                  <CheckCircle className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Approved Venues</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{approvedCount}</p>
              </div>
            </div>

            {/* Pending Verification */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Pending Verification</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{pendingCount}</p>
              </div>
            </div>

            {/* Avg. Daily Price */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-soft flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-purple-50 text-purple-650 rounded-xl border border-purple-100">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div>
                <h3 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Avg. Daily Price</h3>
                <p className="text-2xl font-black text-slate-900 mt-1">{formatCurrency(avgPricing)}</p>
              </div>
            </div>
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
            <div className="bg-white border border-slate-100 rounded-2xl shadow-soft overflow-hidden flex flex-col">
              <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-6">Venue</th>
                      <th className="py-3 px-6">Location</th>
                      <th className="py-3 px-6">Capacity</th>
                      <th className="py-3 px-6">Pricing</th>
                      <th className="py-3 px-6 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {venues.map((venue) => (
                      <tr key={venue.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 flex items-center gap-3">
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
                            <p className="text-sm font-bold text-slate-900 line-clamp-1">{venue.name}</p>
                            <p className="text-[10px] text-slate-400">ID: {venue.id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          <span className="flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5 text-slate-400" />
                            {venue.location}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-slate-600 font-medium">
                          {venue.capacity} guests
                        </td>
                        <td className="py-4 px-6 text-slate-950 font-bold">
                          {formatCurrency(venue.pricing)}/day
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                            <CheckCircle className="h-3 w-3" />
                            Approved
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
