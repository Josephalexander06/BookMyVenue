export type VenueType =
  | "cafe"
  | "auditorium"
  | "convention_hall"
  | "studio"
  | "meeting_room"
  | "outdoor"
  | "community_center"
  | "event_venue";

export interface VenueImage {
  id: number;
  image_path: string;
}

export interface Venue {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  type: VenueType;
  amenities: string[];
  pricing: number;
  pricePerHour?: number;
  allowedModes?: "DAILY" | "HOURLY" | "BOTH";
  imageUrl?: string;
  images?: VenueImage[];
  ownerName?: string;
  ownerPhone?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
  userCount?: number;
  status?: "PENDING" | "APPROVED" | "REJECTED" | "BLOCKED" | string;
}

export interface VenueFilters {
  search?: string;
  location?: string;
  type?: VenueType | "all";
  minCapacity?: number;
  sortBy?: "popular" | "price_low" | "price_high" | "capacity";
  page?: number;
  pageSize?: number;
}

export interface VenueListResponse {
  items: Venue[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateVenuePayload {
  name: string;
  description: string;
  capacity: number;
  location: string;
  latitude?: number;
  longitude?: number;
  type: VenueType;
  amenities: string[];
  pricing: number;
  pricePerHour?: number;
  allowedModes?: "DAILY" | "HOURLY" | "BOTH";
  imageUrl?: string;
  imageFiles?: File[];
}
