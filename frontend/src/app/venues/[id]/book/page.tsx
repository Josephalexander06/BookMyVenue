"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateBooking } from "@/features/bookings/hooks";
import { useVenue } from "@/features/venues/hooks";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";

export default function BookingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const createBooking = useCreateBooking();
  const { data: venue, isLoading: venueLoading } = useVenue(params.id);

  const [date, setDate] = useState("");
  const [attendees, setAttendees] = useState(10);
  const [note, setNote] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    await createBooking.mutateAsync({
      venueId: params.id,
      date,
      attendees,
      note,
    });
    const user = useAuthStore.getState().user;
    if (user?.role === "admin") {
      router.push("/dashboard/admin/bookings");
    } else if (user?.role === "owner") {
      router.push("/dashboard/owner/bookings");
    } else {
      router.push("/dashboard/customer");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Top navigation */}
      <div className="mx-auto w-full max-w-2xl px-6 pt-10">
        <Link
          href={`/venues/${params.id}`}
          className="group inline-flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          Back to venue
        </Link>
      </div>

      {/* Main content */}
      <div className="mx-auto w-full max-w-2xl px-6 py-10">
        {/* Venue header */}
        <div className="mb-10">
          {venueLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="h-9 w-72 rounded-xl" />
            </div>
          ) : (
            <>
              <p className="text-sm font-medium tracking-wide text-slate-400 uppercase">
                Booking for
              </p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                {venue?.name}
              </h1>
            </>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Event date
            </label>
            <Input
              type="date"
              required
              value={date}
              onChange={(event) => setDate(event.target.value)}
              className="h-12 rounded-xl border-slate-200 bg-white text-base shadow-sm transition-shadow focus:shadow-md"
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Attendees
            </label>
            <Input
              type="number"
              min={1}
              required
              value={attendees}
              onChange={(event) => setAttendees(Number(event.target.value))}
              className="h-12 rounded-xl border-slate-200 bg-white text-base shadow-sm transition-shadow focus:shadow-md"
            />
            {venue?.capacity && (
              <p className="text-xs text-slate-400">
                Max capacity: {venue.capacity}
              </p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">
              Notes
              <span className="ml-1.5 font-normal text-slate-400">
                (optional)
              </span>
            </label>
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Special requirements, setup preferences..."
              rows={4}
              className="rounded-xl border-slate-200 bg-white text-base shadow-sm transition-shadow focus:shadow-md"
            />
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100" />

          {/* Submit */}
          <Button
            type="submit"
            disabled={createBooking.isPending}
            className="h-12 w-full rounded-xl text-base font-semibold shadow-soft transition-all hover:shadow-hover"
          >
            {createBooking.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Submitting…
              </span>
            ) : (
              "Confirm booking"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
