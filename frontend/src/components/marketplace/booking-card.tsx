import { useState, useEffect } from "react";
import { Calendar, Users, MapPin, Star } from "lucide-react";
import { ClientDate } from "@/components/ui/client-date";
import type { Booking } from "@/types/booking";
import type { Venue } from "@/types/venue";
import { formatCurrency } from "@/lib/utils";

import { useCancelBooking, useRateBooking } from "@/features/bookings/hooks";
import { useAuthStore } from "@/store/auth-store";

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
  cancelled: {
    label: "Cancelled",
    pill: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};

export function BookingCard({ booking, venue }: { booking: Booking; venue?: Venue }) {
  const status = statusConfig[booking.status] ?? statusConfig.pending;
  const cancelBooking = useCancelBooking();
  const rateBooking = useRateBooking();
  const user = useAuthStore((s) => s.user);
  const canCancel = booking.status !== "rejected" && booking.status !== "cancelled";

  const [rating, setRating] = useState<number>(booking.rating || 0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  useEffect(() => {
    if (booking.rating !== undefined && booking.rating !== null) {
      setRating(booking.rating);
    }
  }, [booking.rating]);

  const handleRate = async (val: number) => {
    setRating(val);
    try {
      await rateBooking.mutateAsync({ bookingId: booking.id, rating: val });
    } catch (err) {
      console.error("Failed to rate booking:", err);
    }
  };

  const handleCancel = async () => {
    if (confirm("Are you sure you want to cancel this booking request?")) {
      await cancelBooking.mutateAsync(booking.id);
    }
  };

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

        <div className="flex items-baseline justify-between border-t border-slate-50 pt-2 mt-2">
          <div className="flex items-center gap-2">
            <p className="text-[10px] text-slate-300 font-mono">ID: {booking.id}</p>
            {canCancel && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={cancelBooking.isPending}
                className="text-[9px] font-bold text-red-500 hover:text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100/50 hover:bg-red-100/50 transition-colors disabled:opacity-50"
              >
                {cancelBooking.isPending ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
          {venue && (
            <p className="text-xs font-bold text-slate-900">
              {booking.mode === "HOURLY" ? (
                <>
                  {formatCurrency(venue.pricePerHour ?? 0)} <span className="text-[10px] text-slate-400 font-normal">/ hr</span>
                </>
              ) : (
                <>
                  {formatCurrency(venue.pricing)} <span className="text-[10px] text-slate-400 font-normal">/ day</span>
                </>
              )}
            </p>
          )}
        </div>

        {booking.status === "approved" && (
          <div className="mt-2.5 pt-2 border-t border-slate-50 flex items-center gap-1.5 animate-fade-in">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Rate:</span>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  disabled={rateBooking.isPending}
                  onClick={() => handleRate(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-0.5 transition-transform duration-100 active:scale-75 disabled:opacity-50"
                >
                  <Star
                    className={`h-4.5 w-4.5 transition-all duration-150 ${
                      star <= (hoverRating || rating)
                        ? "fill-amber-400 text-amber-400 scale-105"
                        : "text-slate-200 hover:text-slate-350"
                    }`}
                  />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-[10px] font-bold text-amber-500 bg-amber-50/50 border border-amber-100/20 px-1.5 py-0.5 rounded ml-1 animate-scale-in">
                {rating.toFixed(1)} ★
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
