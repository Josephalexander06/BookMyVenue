"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, 
  Users, 
  Star, 
  ArrowLeft, 
  Wifi, 
  Tv, 
  Car, 
  Wind, 
  Music, 
  ShieldAlert, 
  Briefcase 
} from "lucide-react";
import { ErrorState } from "@/components/dashboard/error-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVenue } from "@/features/venues/hooks";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import VenueMap from "@/components/ui/venue-map";

// Map amenities to icons
const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  Projector: Tv,
  Parking: Car,
  "Air Conditioning": Wind,
  "Sound Setup": Music,
  "Green Room": Briefcase,
};

export default function VenueDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { isAuthenticated, openLogin } = useAuthStore();
  const venueId = params.id;
  const { data: venue, isLoading, isError } = useVenue(venueId);

  if (isLoading) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-12">
        <Skeleton className="h-96 w-full rounded-3xl" />
        <div className="mt-8 space-y-4">
          <Skeleton className="h-8 w-1/3 rounded-lg" />
          <Skeleton className="h-6 w-1/4 rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !venue) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-12">
        <ErrorState message="We could not load this venue. Please go back and try another one." />
        <div className="mt-4 text-center">
          <Link href="/venues">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Venues
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  // Generate stable rating
  const ratingValue = (
    4.5 +
    parseFloat((Math.sin(venue.name.charCodeAt(0)) * 0.4).toFixed(1))
  ).toFixed(1);
  const reviewsCount = Math.floor(
    15 + Math.abs(Math.cos(venue.name.charCodeAt(0)) * 85)
  );

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
      {/* Back button */}
      <Link href="/venues" className="inline-flex items-center gap-2 text-sm font-medium text-[#999] hover:text-[#333] mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to explore
      </Link>

      {/* Header Info */}
      <div className="mb-6 space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[#333] sm:text-4xl">{venue.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-600">
          <span className="flex items-center gap-1 font-semibold text-[#333]">
            <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
            {ratingValue}
          </span>
          <span className="underline cursor-pointer">{reviewsCount} reviews</span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <MapPin className="h-4 w-4 text-slate-400" />
            {venue.location}
          </span>
        </div>
      </div>

      {/* Gallery Frame */}
      {venue.images && venue.images.length > 1 ? (
        <div className="grid grid-cols-4 gap-2 h-[300px] sm:h-[450px] overflow-hidden rounded-3xl border border-slate-100 shadow-soft">
          {/* Main large image */}
          <div className="col-span-2 row-span-2 relative overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={venue.images[0].image_path}
              alt={venue.name}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          {/* Smaller images */}
          {venue.images.slice(1, 5).map((img, idx) => (
            <div key={img.id} className="relative overflow-hidden bg-slate-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.image_path}
                alt={`${venue.name} photo ${idx + 2}`}
                className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              />
              {idx === 3 && venue.images!.length > 5 && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                  <span className="text-white text-sm font-bold">+{venue.images!.length - 5} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="relative h-[300px] w-full overflow-hidden rounded-3xl bg-slate-100 sm:h-[450px] shadow-soft border border-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
            alt={venue.name}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
        </div>
      )}

      {/* Detail Layout */}
      <div className="mt-8 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        
        {/* Left Column: Details */}
        <div className="space-y-8">
          
          {/* Host/Basic Details */}
          <div className="border-b border-slate-100 pb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Hosted by {venue.ownerName ?? "Community Owner"}</h2>
              <p className="text-sm text-slate-500 mt-1">Capacity: up to {formatNumber(venue.capacity)} guests</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center text-white font-bold text-lg shadow-sm">
              {(venue.ownerName ?? "CO").substring(0, 2).toUpperCase()}
            </div>
          </div>

          {/* Description */}
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-lg font-bold text-slate-900">About the space</h3>
            <p className="mt-3 text-slate-600 leading-relaxed">{venue.description}</p>
          </div>

          {/* Features / Icons */}
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-lg font-bold text-slate-900">Venue Specifications</h3>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="flex gap-3 rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                <Users className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">Total Capacity</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Accommodates up to {venue.capacity} guests comfortably.</p>
                </div>
              </div>
              <div className="flex gap-3 rounded-2xl border border-slate-100 p-4 bg-slate-50/50">
                <ShieldAlert className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm text-slate-800">Instant Booking</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Submit request instantly to the owner for validation.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Amenities list */}
          <div className="border-b border-slate-100 pb-6">
            <h3 className="text-lg font-bold text-slate-900">What this venue offers</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {venue.amenities.map((amenity) => {
                const Icon = amenityIcons[amenity] || Star;
                return (
                  <div key={amenity} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3.5 shadow-sm">
                    <Icon className="h-5 w-5 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Venue Map */}
          <div>
            <VenueMap
              latitude={venue.latitude}
              longitude={venue.longitude}
              address={venue.location}
            />
          </div>

        </div>

        {/* Right Column: Sticky Booking Widget */}
        <div className="relative">
          <Card className="sticky top-24 border border-slate-100 shadow-soft overflow-hidden rounded-2xl">
            <CardContent className="p-6 space-y-6">
              
              <div className="flex items-baseline justify-between border-b border-slate-50 pb-4">
                <div>
                  {venue.allowedModes === "HOURLY" ? (
                    <>
                      <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(venue.pricePerHour ?? 0)}</span>
                      <span className="text-sm font-normal text-slate-500"> / hour</span>
                    </>
                  ) : venue.allowedModes === "DAILY" ? (
                    <>
                      <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(venue.pricing)}</span>
                      <span className="text-sm font-normal text-slate-500"> / day</span>
                    </>
                  ) : (
                    <div className="space-y-1">
                      <div>
                        <span className="text-2xl font-extrabold text-slate-900">{formatCurrency(venue.pricing)}</span>
                        <span className="text-sm font-normal text-slate-500"> / day</span>
                      </div>
                      <div>
                        <span className="text-lg font-bold text-slate-700">{formatCurrency(venue.pricePerHour ?? 0)}</span>
                        <span className="text-xs font-normal text-slate-500"> / hour</span>
                      </div>
                    </div>
                  )}
                </div>
                <span className="flex items-center gap-0.5 text-sm font-semibold text-slate-800">
                  ★ {ratingValue}
                </span>
              </div>

              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Availability</span>
                  <span className="block text-sm font-semibold text-slate-800 mt-0.5">{venue.availability ?? "Contact Owner"}</span>
                </div>
                
                <div className="rounded-xl border border-slate-200 p-3 bg-slate-50/50">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancellation Policy</span>
                  <span className="block text-xs font-medium text-slate-600 mt-0.5">Flexible cancellation. Full refund within 24 hours.</span>
                </div>
              </div>

              <Button
                onClick={() => {
                  if (!isAuthenticated) {
                    openLogin(() => {
                      router.push(`/venues/${venue.id}/book`);
                    });
                  } else {
                    router.push(`/venues/${venue.id}/book`);
                  }
                }}
                className="w-full bg-accent hover:bg-accent-hover py-6 rounded-xl font-bold shadow-soft transition-transform duration-100 active:scale-95 text-base"
              >
                Book This Venue Now
              </Button>

              <div className="text-center">
                <span className="text-xs text-slate-400">You won&apos;t be charged yet</span>
              </div>

            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
