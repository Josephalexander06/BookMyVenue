import { apiClient } from "@/lib/api/client";
import { appConfig } from "@/lib/config";
import type {
  CreateVenuePayload,
  Venue,
  VenueFilters,
  VenueImage,
  VenueListResponse,
} from "@/types/venue";

const BACKEND_URL = appConfig.apiBaseUrl;

/** Build image URL from backend image_path like "upload/xxxx.jpg" */
function buildImageUrl(imagePath: string): string {
  // Backend serves uploads at /uploads/<filename>
  const filename = imagePath.replace(/^upload\//, "");
  return `${BACKEND_URL}/uploads/${filename}`;
}

/** Map raw backend image array to VenueImage[] with full URLs */
function mapImages(rawImages?: any[]): VenueImage[] {
  if (!rawImages || !Array.isArray(rawImages)) return [];
  return rawImages.map((img: any) => ({
    id: img.id,
    image_path: buildImageUrl(img.image_path),
  }));
}

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
    const images = mapImages(v.image);
    return {
      id,
      name: v.name,
      description: v.description ?? `A premium space for events and meetings: ${v.name}`,
      capacity: v.capacity ?? 50,
      location: v.address,
      city: v.city,
      type: v.type ?? "meeting_room",
      amenities: v.amenities ?? ["WiFi", "Parking"],
      pricing: v.price_per_day ?? v.price ?? 500,
      pricePerHour: v.price_per_hour ?? Math.round((v.price_per_day ?? v.price ?? 500) / 8),
      allowedModes: v.booking_allowed_mode ?? v.allowed_modes ?? "BOTH",
      imageUrl: images.length > 0 ? images[0].image_path : (v.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"),
      images,
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
      const images = mapImages(found.image);
      return {
        id: found.id !== undefined && found.id !== null ? String(found.id) : id,
        name: found.name,
        description: found.description ?? `A premium space for events and meetings: ${found.name}`,
        capacity: found.capacity ?? 50,
        location: found.address,
        city: found.city,
        type: found.type ?? "meeting_room",
        amenities: found.amenities ?? ["WiFi", "Parking"],
        pricing: found.price_per_day ?? found.price ?? 500,
        pricePerHour: found.price_per_hour ?? Math.round((found.price_per_day ?? found.price ?? 500) / 8),
        allowedModes: found.booking_allowed_mode ?? found.allowed_modes ?? "BOTH",
        imageUrl: images.length > 0 ? images[0].image_path : (found.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"),
        images,
        availability: found.availability ? "Available" : "Unavailable",
      };
    }
  }

  const { data } = await apiClient.get<any>(`/venues/${id}`);
  const images = mapImages(data.image);
  return {
    id: String(data.id),
    name: data.name,
    description: data.description ?? `A premium space for events and meetings: ${data.name}`,
    capacity: data.capacity ?? 50,
    location: data.address,
    city: data.city,
    type: data.type ?? "meeting_room",
    amenities: data.amenities ?? ["WiFi", "Parking"],
    pricing: data.price_per_day ?? data.price ?? 500,
    pricePerHour: data.price_per_hour ?? Math.round((data.price_per_day ?? data.price ?? 500) / 8),
    allowedModes: data.booking_allowed_mode ?? data.allowed_modes ?? "BOTH",
    imageUrl: images.length > 0 ? images[0].image_path : (data.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"),
    images,
    availability: data.availability ? "Available" : "Unavailable",
  };
}

export async function createVenue(payload: CreateVenuePayload): Promise<Venue> {
  // Backend expects multipart/form-data with Form(...) fields + File(...) images
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("address", payload.location);
  formData.append("city", payload.city ?? "");
  formData.append("capacity", String(payload.capacity));
  formData.append("booking_allowed_mode", payload.allowedModes || "BOTH");

  if (payload.allowedModes !== "HOURLY") {
    formData.append("price_per_day", String(payload.pricing));
  }
  if (payload.allowedModes !== "DAILY") {
    formData.append("price_per_hour", String(payload.pricePerHour ?? Math.round(payload.pricing / 8)));
  }

  // Append image files
  if (payload.imageFiles && payload.imageFiles.length > 0) {
    for (const file of payload.imageFiles) {
      formData.append("images", file);
    }
  }

  const { data } = await apiClient.post<any>("/venues", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  const res = Array.isArray(data) ? data[0] : data;
  const images = mapImages(res.image);
  return {
    id: String(res.id),
    name: res.name,
    description: res.description ?? `A premium space for events and meetings: ${res.name}`,
    capacity: res.capacity ?? 50,
    location: res.address,
    city: res.city,
    type: res.type ?? "meeting_room",
    amenities: res.amenities ?? ["WiFi", "Parking"],
    pricing: res.price_per_day ?? res.price ?? 500,
    pricePerHour: res.price_per_hour ?? Math.round((res.price_per_day ?? res.price ?? 500) / 8),
    allowedModes: res.booking_allowed_mode ?? res.allowed_modes ?? "BOTH",
    imageUrl: images.length > 0 ? images[0].image_path : (res.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"),
    images,
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
    city: payload.city ?? "",
    price_per_day: payload.allowedModes ? (payload.allowedModes === "HOURLY" ? null : payload.pricing) : payload.pricing,
    capacity: payload.capacity,
    price_per_hour: payload.allowedModes ? (payload.allowedModes === "DAILY" ? null : payload.pricePerHour) : payload.pricePerHour,
    booking_allowed_mode: payload.allowedModes,
  };
  const { data } = await apiClient.put<any>(`/venues/${id}`, backendPayload);
  const images = mapImages(data.image);
  return {
    id: String(data.id),
    name: data.name,
    description: data.description ?? `A premium space for events and meetings: ${data.name}`,
    capacity: data.capacity ?? 50,
    location: data.address,
    city: data.city,
    type: data.type ?? "meeting_room",
    amenities: data.amenities ?? ["WiFi", "Parking"],
    pricing: data.price_per_day ?? data.price ?? 500,
    pricePerHour: data.price_per_hour ?? Math.round((data.price_per_day ?? data.price ?? 500) / 8),
    allowedModes: data.booking_allowed_mode ?? data.allowed_modes ?? "BOTH",
    imageUrl: images.length > 0 ? images[0].image_path : (data.imageUrl ?? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4"),
    images,
    availability: data.availability ? "Available" : "Unavailable",
  };
}

export async function deleteVenue(id: string) {
  const { data } = await apiClient.delete(`/venues/${id}`);
  return data;
}

export interface BookedSlot {
  booking_date: string;
  start_time: string;
  end_time: string;
  booking_mode: "DAILY" | "HOURLY" | "BOTH";
}

export async function getBookedDates(id: string): Promise<BookedSlot[]> {
  const { data } = await apiClient.get<BookedSlot[]>(`/venues/${id}/booked-dates`);
  return data;
}
