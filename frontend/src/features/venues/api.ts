import { apiClient } from "@/lib/api/client";
import type {
  CreateVenuePayload,
  Venue,
  VenueFilters,
  VenueListResponse,
} from "@/types/venue";

const toQuery = (filters: (VenueFilters & { ownerOnly?: boolean }) = {}) => {
  const params = new URLSearchParams();
  if (filters.search) {
    params.set("q", filters.search);
  }
  return params.toString();
};

export async function getVenues(
  filters?: VenueFilters & { ownerOnly?: boolean }
): Promise<VenueListResponse> {
  let endpoint = "/venues";
  let query = "";

  if (filters?.ownerOnly) {
    endpoint = "/venues/Venue";
  } else {
    const queryString = toQuery(filters);
    if (queryString) {
      query = `?${queryString}`;
    }
  }

  const { data } = await apiClient.get<any[]>(`${endpoint}${query}`);

  const items = data.map((v: any, index: number) => {
    const id = v.id !== undefined && v.id !== null ? String(v.id) : `venue-${encodeURIComponent(v.name || "")}-${index}`;
    return {
      id,
      name: v.name,
      description: v.description ?? `A premium space for events and meetings: ${v.name}`,
      capacity: v.capacity ?? 50,
      location: v.address,
      type: v.type ?? "meeting_room",
      amenities: v.amenities ?? ["WiFi", "Parking"],
      pricing: v.price ?? 500,
      imageUrl: v.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
      availability: v.availability ? "Available" : "Unavailable",
    };
  });

  return {
    items,
    total: items.length,
    page: filters?.page ?? 1,
    pageSize: filters?.pageSize ?? 9,
  };
}

export async function getVenueById(id: string): Promise<Venue> {
  // If the id is a string/slug fallback (e.g. starts with "venue-"), we fetch all venues and match by name & index!
  if (id.startsWith("venue-")) {
    const lastDashIndex = id.lastIndexOf("-");
    const namePart = id.substring(6, lastDashIndex);
    const indexPart = parseInt(id.substring(lastDashIndex + 1), 10);
    const name = decodeURIComponent(namePart);

    const { data } = await apiClient.get<any[]>("/venues");
    const matchingVenues = data.filter((v: any) => v.name === name);
    const found = matchingVenues[indexPart] || matchingVenues[0];
    if (found) {
      return {
        id: found.id !== undefined && found.id !== null ? String(found.id) : id,
        name: found.name,
        description: found.description ?? `A premium space for events and meetings: ${found.name}`,
        capacity: found.capacity ?? 50,
        location: found.address,
        type: found.type ?? "meeting_room",
        amenities: found.amenities ?? ["WiFi", "Parking"],
        pricing: found.price ?? 500,
        imageUrl: found.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
        availability: found.availability ? "Available" : "Unavailable",
      };
    }
  }

  const { data } = await apiClient.get<any>(`/venues/${id}`);
  return {
    id: String(data.id),
    name: data.name,
    description: data.description ?? `A premium space for events and meetings: ${data.name}`,
    capacity: data.capacity ?? 50,
    location: data.address,
    type: data.type ?? "meeting_room",
    amenities: data.amenities ?? ["WiFi", "Parking"],
    pricing: data.price ?? 500,
    imageUrl: data.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    availability: data.availability ? "Available" : "Unavailable",
  };
}

export async function createVenue(payload: CreateVenuePayload): Promise<Venue> {
  const backendPayload = {
    name: payload.name,
    address: payload.location,
    price: payload.pricing,
    capacity: payload.capacity,
  };
  const { data } = await apiClient.post<any>("/venues", backendPayload);
  const res = Array.isArray(data) ? data[0] : data;
  return {
    id: String(res.id),
    name: res.name,
    description: res.description ?? `A premium space for events and meetings: ${res.name}`,
    capacity: res.capacity ?? 50,
    location: res.address,
    type: res.type ?? "meeting_room",
    amenities: res.amenities ?? ["WiFi", "Parking"],
    pricing: res.price ?? 500,
    imageUrl: res.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    availability: res.availability ? "Available" : "Unavailable",
  };
}

export async function updateVenue(
  id: string,
  payload: Partial<CreateVenuePayload>
): Promise<Venue> {
  const backendPayload = {
    name: payload.name,
    address: payload.location,
    price: payload.pricing,
    capacity: payload.capacity,
  };
  const { data } = await apiClient.put<any>(`/venues/${id}`, backendPayload);
  return {
    id: String(data.id),
    name: data.name,
    description: data.description ?? `A premium space for events and meetings: ${data.name}`,
    capacity: data.capacity ?? 50,
    location: data.address,
    type: data.type ?? "meeting_room",
    amenities: data.amenities ?? ["WiFi", "Parking"],
    pricing: data.price ?? 500,
    imageUrl: data.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4",
    availability: data.availability ? "Available" : "Unavailable",
  };
}

export async function deleteVenue(id: string) {
  const { data } = await apiClient.delete(`/venues/${id}`);
  return data;
}
