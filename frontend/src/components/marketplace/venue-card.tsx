import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Venue } from "@/types/venue";

export function VenueCard({ venue }: { venue: Venue }) {
  // Stable rating from venue name
  const ratingValue = (
    4.2 +
    parseFloat((Math.sin(venue.name.charCodeAt(0)) * 0.6).toFixed(1))
  ).toFixed(1);
  const votesCount = Math.floor(
    120 + Math.abs(Math.cos(venue.name.charCodeAt(0)) * 880)
  );

  return (
    <Link href={`/venues/${venue.id}`} className="group block w-[176px] sm:w-[200px]">
      {/* Image */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=530&fit=crop"}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Rating pill */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-3 pb-2.5 pt-8">
          <div className="flex items-center gap-1.5">
            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-white">{ratingValue}/10</span>
            <span className="text-[10px] text-white/70">{(votesCount / 1000).toFixed(1)}K Votes</span>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="mt-2 px-0.5">
        <h3 className="text-sm font-bold text-[#333] line-clamp-1 group-hover:text-accent transition-colors">
          {venue.name}
        </h3>
        <p className="text-xs text-[#999] mt-0.5 capitalize">
          {venue.type.replace("_", " ")}
        </p>
        <div className="flex items-center gap-1 mt-1 text-[11px] text-[#999]">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="line-clamp-1">{venue.location}</span>
        </div>
        <p className="mt-1.5 text-sm font-bold text-[#333]">
          {venue.allowedModes === "HOURLY" ? (
            <>
              {formatCurrency(venue.pricePerHour ?? 0)}
              <span className="text-[10px] font-normal text-[#999]"> /hr</span>
            </>
          ) : (
            <>
              {formatCurrency(venue.pricing)}
              <span className="text-[10px] font-normal text-[#999]"> /day</span>
            </>
          )}
        </p>
      </div>
    </Link>
  );
}

/** Compact horizontal card for "See All" style rows */
export function VenueCardCompact({ venue }: { venue: Venue }) {
  const ratingValue = (
    4.2 +
    parseFloat((Math.sin(venue.name.charCodeAt(0)) * 0.6).toFixed(1))
  ).toFixed(1);

  return (
    <Link href={`/venues/${venue.id}`} className="group block w-[140px] sm:w-[160px]">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=320&h=420&fit=crop"}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 pb-2 pt-6">
          <div className="flex items-center gap-1">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            <span className="text-[10px] font-bold text-white">{ratingValue}</span>
          </div>
        </div>
      </div>
      <h3 className="mt-1.5 text-xs font-bold text-[#333] line-clamp-1 group-hover:text-accent transition-colors">
        {venue.name}
      </h3>
      <p className="text-[10px] text-[#999] capitalize">{venue.type.replace("_", " ")}</p>
    </Link>
  );
}
