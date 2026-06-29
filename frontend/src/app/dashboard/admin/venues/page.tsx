"use client";

import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { useAdminVenues, useApproveVenue, useRejectVenue, useBlockVenue } from "@/features/venues/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Building2, 
  MapPin, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  XCircle, 
  Ban, 
  Eye, 
  X, 
  Globe 
} from "lucide-react";
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
  const { data: venuesData, isLoading, isError } = useAdminVenues();
  const approveMutation = useApproveVenue();
  const rejectMutation = useRejectVenue();
  const blockMutation = useBlockVenue();
  
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED">("ALL");
  const [selectedVenue, setSelectedVenue] = useState<any | null>(null);

  const venues = venuesData?.items ?? [];

  const totalListings = venues.length;
  const approvedCount = venues.filter((v) => v.status === "APPROVED").length;
  const pendingCount = venues.filter((v) => v.status === "PENDING" || !v.status).length;
  const rejectedCount = venues.filter((v) => v.status === "REJECTED").length;
  const blockedCount = venues.filter((v) => v.status === "BLOCKED").length;
  
  const approvedVenues = venues.filter((v) => v.status === "APPROVED");
  const avgPricing = approvedVenues.length > 0
    ? Math.round(approvedVenues.reduce((sum, v) => sum + (v.pricing ?? 0), 0) / approvedVenues.length)
    : 0;

  // Filter venues by tab
  const filteredVenues = venues.filter((venue) => {
    if (statusFilter === "ALL") return true;
    if (statusFilter === "PENDING") return venue.status === "PENDING" || !venue.status;
    return venue.status === statusFilter;
  });

  const handleApprove = async (id: string) => {
    if (confirm("Are you sure you want to approve this venue?")) {
      try {
        await approveMutation.mutateAsync(id);
        if (selectedVenue && selectedVenue.id === id) {
          setSelectedVenue((prev: any) => prev ? { ...prev, status: "APPROVED" } : null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleReject = async (id: string) => {
    if (confirm("Are you sure you want to reject this venue?")) {
      try {
        await rejectMutation.mutateAsync(id);
        if (selectedVenue && selectedVenue.id === id) {
          setSelectedVenue((prev: any) => prev ? { ...prev, status: "REJECTED" } : null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleBlock = async (id: string) => {
    if (confirm("Are you sure you want to block this venue?")) {
      try {
        await blockMutation.mutateAsync(id);
        if (selectedVenue && selectedVenue.id === id) {
          setSelectedVenue((prev: any) => prev ? { ...prev, status: "BLOCKED" } : null);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const getStatusBadge = (status?: string) => {
    const isPending = status === "PENDING" || !status;
    const isApproved = status === "APPROVED";
    const isBlocked = status === "BLOCKED";

    if (isApproved) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
          <CheckCircle className="h-3 w-3" />
          Approved
        </span>
      );
    } else if (isPending) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 border border-amber-100">
          <Clock className="h-3 w-3" />
          Pending
        </span>
      );
    } else if (isBlocked) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-700 border border-slate-200">
          <Ban className="h-3 w-3" />
          Blocked
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-700 border border-rose-100">
          <XCircle className="h-3 w-3" />
          Rejected
        </span>
      );
    }
  };

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

          {/* Status Tabs / Filters */}
          <div className="flex border-b border-slate-150 gap-2">
            {(["ALL", "PENDING", "APPROVED", "REJECTED", "BLOCKED"] as const).map((tab) => {
              const isActive = statusFilter === tab;
              const count =
                tab === "ALL"
                  ? totalListings
                  : tab === "PENDING"
                  ? pendingCount
                  : tab === "APPROVED"
                  ? approvedCount
                  : tab === "REJECTED"
                  ? rejectedCount
                  : blockedCount;

              return (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`pb-3 px-4 text-xs font-bold transition-all relative ${
                    isActive ? "text-emerald-800 font-extrabold" : "text-slate-400 hover:text-slate-750"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {tab.charAt(0) + tab.slice(1).toLowerCase()}
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                        isActive ? "bg-emerald-100 text-emerald-850" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {count}
                    </span>
                  </span>
                  {isActive && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : isError ? (
            <div className="text-center py-10 rounded-xl border border-slate-100 bg-white">
              <p className="text-sm text-slate-400 font-bold">Failed to load admin venues.</p>
            </div>
          ) : filteredVenues.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <Building2 className="h-8 w-8 text-slate-300" />
              <h3 className="mt-3 text-sm font-semibold text-slate-900">No venues found</h3>
              <p className="mt-1 text-xs text-slate-500">There are no venues matching this status filter.</p>
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
                      <th className="py-3 px-6">Status</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-xs font-semibold text-slate-700">
                    {filteredVenues.map((venue) => {
                      const isPending = venue.status === "PENDING" || !venue.status;
                      const isApproved = venue.status === "APPROVED";
                      const isRejected = venue.status === "REJECTED";
                      const isBlocked = venue.status === "BLOCKED";

                      return (
                        <tr 
                          key={venue.id} 
                          className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                          onClick={() => setSelectedVenue(venue)}
                        >
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
                              <p className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors line-clamp-1 flex items-center gap-1.5">
                                {venue.name}
                                <Eye className="h-3.5 w-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </p>
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
                          <td className="py-4 px-6">
                            {getStatusBadge(venue.status)}
                          </td>
                          <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {(isPending || isRejected || isBlocked) && (
                                <button
                                  onClick={() => handleApprove(venue.id)}
                                  disabled={approveMutation.isPending}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-650 hover:text-emerald-805 bg-emerald-50 hover:bg-emerald-100/70 border border-emerald-100 px-2.5 py-1 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
                                >
                                  <CheckCircle className="h-3 w-3" />
                                  Approve
                                </button>
                              )}
                              {isPending && (
                                <button
                                  onClick={() => handleReject(venue.id)}
                                  disabled={rejectMutation.isPending}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-600 hover:text-rose-805 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 px-2.5 py-1 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
                                >
                                  <XCircle className="h-3 w-3" />
                                  Reject
                                </button>
                              )}
                              {isApproved && (
                                <button
                                  onClick={() => handleBlock(venue.id)}
                                  disabled={blockMutation.isPending}
                                  className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-650 hover:text-rose-850 bg-rose-50 hover:bg-rose-100/70 border border-rose-100 px-2.5 py-1 rounded-lg transition-all active:scale-[0.97] disabled:opacity-50"
                                >
                                  <Ban className="h-3 w-3" />
                                  Block
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Details Inspector Modal Overlay */}
      {selectedVenue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto flex flex-col relative animate-in fade-in zoom-in-95 duration-250">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Venue Inspector</span>
                <h2 className="text-xl font-extrabold text-slate-900 mt-1">{selectedVenue.name}</h2>
                <div className="flex gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-bold text-slate-600 border border-slate-200 capitalize">
                    {selectedVenue.type?.replace("_", " ") || "Space"}
                  </span>
                  {getStatusBadge(selectedVenue.status)}
                </div>
              </div>
              <button 
                onClick={() => setSelectedVenue(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-650 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Image Gallery */}
              {selectedVenue.images && selectedVenue.images.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Submitted Images</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedVenue.images.map((img: any) => (
                      <div key={img.id} className="relative aspect-video rounded-xl overflow-hidden bg-slate-50 border border-slate-100 group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={img.image_path} 
                          alt="Venue submit detail" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : selectedVenue.imageUrl ? (
                <div className="space-y-3">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Submitted Cover Image</h3>
                  <div className="relative aspect-video max-w-md rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={selectedVenue.imageUrl} 
                      alt="Venue cover" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              ) : null}

              {/* Venue Specifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Location */}
                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-450 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" /> Location / Address
                  </span>
                  <p className="text-xs font-bold text-slate-800 leading-relaxed">{selectedVenue.location}</p>
                </div>

                {/* Map Coordinates */}
                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-455 flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5 text-slate-400" /> Coordinates
                  </span>
                  {selectedVenue.latitude !== undefined && selectedVenue.longitude !== undefined ? (
                    <p className="text-xs font-bold text-slate-800">
                      Lat: {selectedVenue.latitude.toFixed(6)}, Long: {selectedVenue.longitude.toFixed(6)}
                    </p>
                  ) : (
                    <p className="text-xs font-bold text-slate-400 italic">No custom coordinates provided</p>
                  )}
                </div>

                {/* Capacity */}
                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-455 flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" /> Capacity
                  </span>
                  <p className="text-xs font-bold text-slate-800">{selectedVenue.capacity} guests max</p>
                </div>

                {/* Pricing / Mode */}
                <div className="bg-slate-50/50 p-4 border border-slate-100 rounded-xl space-y-1">
                  <span className="text-[10px] font-black uppercase text-slate-455 flex items-center gap-1">
                    <DollarSign className="h-3.5 w-3.5 text-slate-400" /> Pricing Structure
                  </span>
                  <div className="text-xs font-bold text-slate-800 space-y-0.5">
                    {selectedVenue.allowedModes !== "HOURLY" && (
                      <p>{formatCurrency(selectedVenue.pricing)} / day</p>
                    )}
                    {selectedVenue.allowedModes !== "DAILY" && (
                      <p>{formatCurrency(selectedVenue.pricePerHour ?? Math.round(selectedVenue.pricing / 8))} / hour</p>
                    )}
                    <span className="inline-block mt-1 text-[9px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100 uppercase font-black">
                      Modes: {selectedVenue.allowedModes}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {selectedVenue.amenities && selectedVenue.amenities.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedVenue.amenities.map((item: string, idx: number) => (
                      <span key={idx} className="bg-slate-50 border border-slate-150 px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedVenue.description && (
                <div className="space-y-2">
                  <h3 className="text-xs font-extrabold uppercase text-slate-400 tracking-wider">Description</h3>
                  <p className="text-xs text-slate-650 leading-relaxed font-semibold bg-slate-50/30 p-4 rounded-xl border border-slate-100">
                    {selectedVenue.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="p-6 border-t border-slate-100 bg-slate-50/40 flex justify-between items-center gap-3">
              <button
                onClick={() => setSelectedVenue(null)}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-800 hover:bg-slate-55 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
              >
                Close
              </button>

              <div className="flex gap-2">
                {/* Approve Button */}
                {(selectedVenue.status === "PENDING" || !selectedVenue.status || selectedVenue.status === "REJECTED" || selectedVenue.status === "BLOCKED") && (
                  <button
                    onClick={() => handleApprove(selectedVenue.id)}
                    disabled={approveMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                )}

                {/* Reject Button (Only for Pending) */}
                {(selectedVenue.status === "PENDING" || !selectedVenue.status) && (
                  <button
                    onClick={() => handleReject(selectedVenue.id)}
                    disabled={rejectMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                )}

                {/* Block Button (Only for Approved) */}
                {selectedVenue.status === "APPROVED" && (
                  <button
                    onClick={() => handleBlock(selectedVenue.id)}
                    disabled={blockMutation.isPending}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-650 hover:bg-rose-750 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                  >
                    <Ban className="h-4 w-4" />
                    Block
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
