import Link from "next/link";
import { MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Venue } from "@/types/venue";

export function VenueCard({ venue }: { venue: Venue }) {
  // Generate a realistic stable rating based on the name character values
  const ratingValue = (
    4.5 +
    parseFloat((Math.sin(venue.name.charCodeAt(0)) * 0.4).toFixed(1))
  ).toFixed(1);
  const reviewsCount = Math.floor(
    15 + Math.abs(Math.cos(venue.name.charCodeAt(0)) * 85)
  );

  return (
    <Link href={`/venues/${venue.id}`} className="group block h-full">
      <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-hover">
        {/* Image Frame */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
            alt={venue.name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3 border-0 bg-white/90 px-2.5 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm hover:bg-white">
            {venue.type.replace("_", " ")}
          </Badge>
        </div>

        {/* Content details */}
        <div className="mt-3 flex flex-1 flex-col justify-between px-1">
          <div className="space-y-1">
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-1 text-base font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
                {venue.name}
              </h3>
              <span className="flex items-center gap-0.5 text-sm font-medium text-amber-500 shrink-0">
                ★ {ratingValue}
              </span>
            </div>

            <p className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="line-clamp-1">{venue.location}</span>
            </p>
          </div>

          <div className="mt-3 space-y-2 border-t border-slate-50 pt-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span>Up to {venue.capacity} guests</span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-base font-bold text-slate-900">{formatCurrency(venue.pricing)}</span>
                <span className="text-xs font-normal text-slate-500"> / day</span>
              </div>
              <span className="text-xs font-semibold text-blue-600 group-hover:underline">
                View details &rarr;
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
