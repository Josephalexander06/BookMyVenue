export type VenueType =
  | "cafe"
  | "auditorium"
  | "convention_hall"
  | "studio"
  | "meeting_room"
  | "outdoor"
  | "community_center"
  | "event_venue";

export interface Venue {
  id: string;
  name: string;
  description: string;
  capacity: number;
  location: string;
  city?: string;
  type: VenueType;
  amenities: string[];
  pricing: number;
  imageUrl?: string;
  ownerName?: string;
  ownerPhone?: string;
  availability?: string;
  rating?: number;
  reviewCount?: number;
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
  type: VenueType;
  amenities: string[];
  pricing: number;
  imageUrl?: string;
}
