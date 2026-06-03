export type BookingStatus = "pending" | "approved" | "rejected";

export interface Booking {
  id: string;
  venueId: string;
  venueName?: string;
  date: string;
  customerName?: string;
  attendees?: number;
  note?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface CreateBookingPayload {
  venueId: string;
  date: string;
  attendees: number;
  note?: string;
}

export interface BookingStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}
