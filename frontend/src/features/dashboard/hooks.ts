import type { Booking } from "@/types/booking";

export function summarizeBookings(bookings: Booking[]) {
  return bookings.reduce(
    (acc, booking) => {
      acc.total += 1;
      acc[booking.status] += 1;
      return acc;
    },
    { total: 0, pending: 0, approved: 0, rejected: 0 },
  );
}
