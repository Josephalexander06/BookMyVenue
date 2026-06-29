import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Venue } from "@/types/venue";

export function VenueCard({ venue }: { venue: Venue }) {
  // Stable rating from venue name
  const hasRating = venue.rating !== undefined && venue.rating !== null && venue.rating > 0;
  const ratingValue = hasRating
    ? Number(venue.rating).toFixed(1)
    : (
        4.5 +
        parseFloat((Math.sin(venue.name.charCodeAt(0)) * 0.4).toFixed(1))
      ).toFixed(1);
  const reviewsCount = venue.userCount !== undefined && venue.userCount !== null
    ? venue.userCount
    : Math.floor(15 + Math.abs(Math.cos(venue.name.charCodeAt(0)) * 85));
    
const votesCount = venue.userCount ?? 0;

  return (
    <Link href={`/venues/${venue.id}`} className="group block w-full">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[20px] bg-slate-100 shadow-soft border border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=530&fit=crop"}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Glassmorphic Rating Overlay (Top-Left) */}
        <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-bold text-slate-800 shadow-sm backdrop-blur-sm z-10 border border-slate-100/50">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <span>{ratingValue}</span>
          <span className="text-[9px] text-slate-400 font-medium">({votesCount})</span>
        </div>

        {/* Category Pill Tag (Bottom-Left) */}
        <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[9px] font-extrabold uppercase text-white backdrop-blur-md tracking-wider z-10">
          {venue.type.replace("_", " ")}
        </div>
      </div>

      {/* Info */}
      <div className="mt-3.5 space-y-1">
        <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#0052ff] transition-colors leading-tight">
          {venue.name}
        </h3>
        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-semibold truncate">
          <MapPin className="h-3.5 w-3.5 text-slate-300 shrink-0" />
          <span>{venue.location}</span>
        </div>
        <div className="flex items-baseline gap-1 pt-2 border-t border-slate-100/50 mt-2">
          <span className="text-sm font-black text-slate-900">
            {venue.allowedModes === "HOURLY" ? (
              <>
                {formatCurrency(venue.pricePerHour ?? 0)}
                <span className="text-[10px] font-semibold text-slate-400"> / hr</span>
              </>
            ) : (
              <>
                {formatCurrency(venue.pricing)}
                <span className="text-[10px] font-semibold text-slate-400"> / day</span>
              </>
            )}
          </span>
          {venue.capacity && (
            <span className="text-[9px] font-bold text-slate-400 ml-auto border border-slate-100 px-1.5 py-0.5 rounded bg-slate-50">
              Capacity: {venue.capacity}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function VenueCardCompact({ venue }: { venue: Venue }) {
  const hasRating = venue.rating !== undefined && venue.rating !== null && venue.rating > 0;
  const ratingValue = hasRating
    ? Number(venue.rating).toFixed(1)
    : (
        4.2 +
        parseFloat((Math.sin(venue.name.charCodeAt(0)) * 0.6).toFixed(1))
      ).toFixed(1);

  return (
    <Link href={`/venues/${venue.id}`} className="group block w-[150px] sm:w-[170px]">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 shadow-soft border border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=320&h=420&fit=crop"}
          alt={venue.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm">
          <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
          <span>{ratingValue}</span>
        </div>
      </div>
      <div className="mt-2 space-y-0.5 text-left">
        <h3 className="text-xs font-bold text-slate-800 line-clamp-1 transition-colors group-hover:text-[#0052ff]">
          {venue.name}
        </h3>
        <p className="text-[10px] text-slate-400 capitalize font-semibold">{venue.type.replace("_", " ")}</p>
        <p className="text-xs font-black text-slate-900 pt-0.5">
          {venue.allowedModes === "HOURLY"
            ? `${formatCurrency(venue.pricePerHour ?? 0)}/hr`
            : `${formatCurrency(venue.pricing)}/day`}
        </p>
      </div>
    </Link>
  );
}
