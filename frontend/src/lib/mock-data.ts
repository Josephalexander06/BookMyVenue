import type { Booking } from "@/types/booking";
import type { Venue } from "@/types/venue";

export const mockVenues: Venue[] = [
  {
    id: "1",
    name: "Bluebird Community Hall",
    description: "Flexible hall for workshops, small conferences, and social events.",
    capacity: 180,
    location: "Koramangala, Bengaluru",
    type: "community_center",
    amenities: ["WiFi", "Projector", "Parking", "Air Conditioning"],
    pricing: 22000,
    ownerName: "Aarav Sharma",
    availability: "Weekdays and weekends",
  },
  {
    id: "2",
    name: "Harborline Studio Loft",
    description: "Natural-light studio perfect for photoshoots and creator meetups.",
    capacity: 80,
    location: "Bandra West, Mumbai",
    type: "studio",
    amenities: ["Sound Setup", "Green Room", "Lighting Rig"],
    pricing: 14000,
    ownerName: "Nidhi Kapoor",
    availability: "Daily, 9 AM - 10 PM",
  },
  {
    id: "3",
    name: "Summit Convention Arena",
    description: "Premium convention venue for expo and corporate gatherings.",
    capacity: 750,
    location: "Hitech City, Hyderabad",
    type: "convention_hall",
    amenities: ["Stage", "LED Wall", "Catering", "Valet"],
    pricing: 85000,
    ownerName: "Rohan Verma",
    availability: "Advance booking only",
  },
];

export const mockBookings: Booking[] = [
  {
    id: "b1",
    venueId: "1",
    venueName: "Bluebird Community Hall",
    date: new Date().toISOString(),
    status: "pending",
    createdAt: new Date().toISOString(),
    customerName: "Priya",
  },
  {
    id: "b2",
    venueId: "2",
    venueName: "Harborline Studio Loft",
    date: new Date(Date.now() + 86400000).toISOString(),
    status: "approved",
    createdAt: new Date().toISOString(),
    customerName: "Rajat",
  },
  {
    id: "b3",
    venueId: "3",
    venueName: "Summit Convention Arena",
    date: new Date(Date.now() + 2 * 86400000).toISOString(),
    status: "rejected",
    createdAt: new Date().toISOString(),
    customerName: "Ananya",
  },
];
