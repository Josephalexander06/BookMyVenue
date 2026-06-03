import { Calendar, Users, MapPin } from "lucide-react";
import { ClientDate } from "@/components/ui/client-date";
import type { Booking } from "@/types/booking";
import type { Venue } from "@/types/venue";
import { formatCurrency } from "@/lib/utils";

const statusConfig = {
  pending: {
    label: "Pending",
    pill: "bg-amber-50 text-amber-700 border-amber-100",
    dot: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-100",
    dot: "bg-emerald-500",
  },
  rejected: {
    label: "Rejected",
    pill: "bg-red-50 text-red-700 border-red-100",
    dot: "bg-red-500",
  },
};

export function BookingCard({ booking, venue }: { booking: Booking; venue?: Venue }) {
  const status = statusConfig[booking.status] ?? statusConfig.pending;

  return (
    <div className="group rounded-xl border border-slate-100 bg-white p-4 transition-all duration-200 hover:border-slate-200 hover:shadow-soft flex gap-4">
      {/* Thumbnail image */}
      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={venue?.imageUrl || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"}
          alt={booking.venueName ?? "Venue"}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-bold text-slate-900 truncate">
              {booking.venueName ?? "Venue Booking"}
            </h3>
            <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide ${status.pill}`}>
              <span className={`h-1 w-1 rounded-full ${status.dot}`} />
              {status.label}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <ClientDate date={booking.date} />
            </span>
            {venue && (
              <span className="flex items-center gap-0.5">
                <MapPin className="h-3.5 w-3.5" />
                {venue.location}
              </span>
            )}
            {booking.attendees && (
              <span className="flex items-center gap-0.5">
                <Users className="h-3.5 w-3.5" />
                {booking.attendees} guests
              </span>
            )}
          </div>
        </div>

        {/* Pricing & Footer info */}
        <div className="flex items-baseline justify-between border-t border-slate-50 pt-2 mt-2">
          <p className="text-[10px] text-slate-300 font-mono">ID: {booking.id}</p>
          {venue && (
            <p className="text-xs font-bold text-slate-900">
              {formatCurrency(venue.pricing)} <span className="text-[10px] text-slate-400 font-normal">/ day</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
