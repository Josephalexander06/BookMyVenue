export type BookingStatus = "pending" | "approved" | "rejected" | "cancelled";

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
  mode?: "DAILY" | "HOURLY" | "BOTH";
}

export interface CreateBookingPayload {
  venueId: string;
  date: string;
  attendees: number;
  note?: string;
  startTime?: string;
  endTime?: string;
  mode?: string;
}

export interface BookingStats {
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
  total: number;
}
