import { apiClient } from "@/lib/api/client";
import { getVenueById } from "@/features/venues/api";
import { useAuthStore } from "@/store/auth-store";
import type { Booking, BookingStatus, CreateBookingPayload } from "@/types/booking";

export async function createBooking(payload: CreateBookingPayload) {
  // Fetch venue details to obtain the venue name for the backend query
  const venue = await getVenueById(payload.venueId);
  
  const backendPayload = {
    name: venue.name,
    venue_id: Number(payload.venueId),
    booking_date: payload.date,
    start_time: payload.startTime,
    end_time: payload.endTime,
    mode: payload.mode,
  };
  
  const { data } = await apiClient.post<any>("/booking/", backendPayload);
  
  return {
    id: String(data.id),
    venueId: String(data.venue_id ?? payload.venueId),
    venueName: venue.name,
    date: data.booking_date,
    status: data.status ? (data.status.toLowerCase() as BookingStatus) : "pending",
    createdAt: data.created_at ?? data.booking_date,
    mode: data.mode,
  } as Booking;
}

export async function getBookings() {
  const user = useAuthStore.getState().user;
  const role = user?.role;
  
  const endpoint = role === "customer" ? "/booking/mybooking" : "/booking/";
  const { data } = await apiClient.get<any[]>(endpoint);
  
  return data.map((b: any, index: number) => {
    const bookingStatus = b.status ? (b.status.toLowerCase() as BookingStatus) : "pending";
    return {
      id: b.id !== undefined && b.id !== null ? String(b.id) : `bk-${index}`,
      venueId: b.venue_id !== undefined ? String(b.venue_id) : "",
      venueName: b.name ?? "Venue",
      date: b.booking_date ?? new Date().toISOString(),
      status: bookingStatus,
      createdAt: b.created_at ?? b.booking_date ?? new Date().toISOString(),
      customerName: b.customer_name ?? "Customer",
      mode: b.mode,
    };
  }) as Booking[];
}

export async function getMyBookings() {
  const { data } = await apiClient.get<any[]>("/booking/mybooking");
  
  return data.map((b: any, index: number) => {
    const bookingStatus = b.status ? (b.status.toLowerCase() as BookingStatus) : "pending";
    return {
      id: b.id !== undefined && b.id !== null ? String(b.id) : `mybk-${index}`,
      venueId: b.venue_id !== undefined ? String(b.venue_id) : "",
      venueName: b.name ?? "Venue",
      date: b.booking_date ?? new Date().toISOString(),
      status: bookingStatus,
      createdAt: b.created_at ?? b.booking_date ?? new Date().toISOString(),
      customerName: b.customer_name ?? "Customer",
      mode: b.mode,
    };
  }) as Booking[];
}

export async function approveBooking(id: string) {
  const { data } = await apiClient.patch<any>(`/booking/${id}/approve`);
  return data;
}

export async function rejectBooking(id: string) {
  const { data } = await apiClient.patch<any>(`/booking/${id}/reject`);
  return data;
}

export async function cancelBooking(id: string) {
  const { data } = await apiClient.patch<any>(`/booking/${id}/cancel`);
  return data;
}
