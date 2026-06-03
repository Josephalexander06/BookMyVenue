"use client";

import Link from "next/link";
import { useState } from "react";
import { Search, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { VenueCard } from "@/components/marketplace/venue-card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenues } from "@/features/venues/hooks";
import { useAuthStore } from "@/store/auth-store";
import { useBecomeOwner } from "@/features/auth/hooks";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, user, token, login } = useAuthStore();
  const becomeOwnerMutation = useBecomeOwner();

  const [search, setSearch] = useState("");
  const { data: venuesData, isLoading } = useVenues();
  const venues = venuesData?.items?.slice(0, 6) ?? [];

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-16 pb-20">
        <div className="max-w-2xl mx-auto text-center animate-fade-in">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 leading-[1.08]">
            Find your perfect
            <br />
            <span className="text-slate-400">venue.</span>
          </h1>
          <p className="mt-4 text-sm text-slate-400 max-w-md mx-auto">
            Discover and book unique spaces for events, meetings, and gatherings.
          </p>

          {/* Search */}
          <div className="mt-8 mx-auto max-w-lg flex items-center gap-2 rounded-full border border-slate-200 bg-white p-1.5 shadow-soft transition-shadow focus-within:shadow-hover">
            <Search className="h-4 w-4 text-slate-300 ml-3 shrink-0" />
            <input
              type="text"
              placeholder="Search venues..."
              className="flex-1 bg-transparent px-2 py-2.5 text-sm focus:outline-none placeholder:text-slate-300 font-medium"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  window.location.href = `/venues?search=${encodeURIComponent(search)}`;
                }
              }}
            />
            <Link href={`/venues?search=${encodeURIComponent(search)}`}>
              <button className="flex items-center justify-center h-9 w-9 rounded-full bg-slate-900 text-white hover:bg-slate-800 transition-colors active:scale-95 shrink-0">
                <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Grid */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900">Popular spaces</h2>
          <Link href="/venues" className="text-xs font-medium text-slate-400 hover:text-slate-600 transition-colors">
            View all →
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-4 w-2/3 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : venues.length > 0 ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <VenueCard key={venue.id} venue={venue} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-sm text-slate-400">No venues available yet.</p>
            <Link href="/venues" className="text-sm font-medium text-blue-600 hover:underline mt-2 inline-block">
              Browse all spaces →
            </Link>
          </div>
        )}
      </section>

      {/* CTA Banner */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 pb-16">
        <div className="rounded-2xl bg-slate-900 p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-bold text-white">Have a space?</h3>
            <p className="text-sm text-slate-400 mt-1">List it and start earning from bookings.</p>
          </div>
          <button
            onClick={async () => {
              if (!isAuthenticated) {
                router.push("/auth/login?redirect=/");
                return;
              }

              if (user?.role === "owner" || user?.role === "admin") {
                router.push("/dashboard/owner");
                return;
              }

              try {
                await becomeOwnerMutation.mutateAsync();
                if (token && user) {
                  login(token, { ...user, role: "owner" });
                }
                router.push("/dashboard/owner");
              } catch (error) {
                console.error("Failed to become owner:", error);
              }
            }}
            disabled={becomeOwnerMutation.isPending}
            className="rounded-full bg-white text-slate-900 px-6 py-3 text-sm font-semibold hover:bg-slate-50 transition-colors active:scale-[0.97] disabled:opacity-50"
          >
            {becomeOwnerMutation.isPending
              ? "Upgrading..."
              : !isAuthenticated
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
