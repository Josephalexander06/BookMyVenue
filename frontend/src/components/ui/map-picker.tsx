"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, Loader2 } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";

interface MapPickerProps {
  latitude?: number;
  longitude?: number;
  onChange: (lat: number, lng: number) => void;
  onAddressChange?: (address: string) => void;
  defaultAddress?: string;
}

export default function MapPicker({
  latitude,
  longitude,
  onChange,
  onAddressChange,
  defaultAddress = "",
}: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  const onChangeRef = useRef(onChange);
  const onAddressChangeRef = useRef(onAddressChange);

  // Sync callback refs to prevent map re-initialization
  useEffect(() => {
    onChangeRef.current = onChange;
    onAddressChangeRef.current = onAddressChange;
  });
  
  const [searchQuery, setSearchQuery] = useState(defaultAddress);
  const [searching, setSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [LInstance, setLInstance] = useState<any>(null);

  // Load Leaflet and CSS dynamically
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load stylesheet if not already present
    const linkId = "leaflet-css";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    import("leaflet").then((Leaflet) => {
      setLInstance(Leaflet);
      setLeafletLoaded(true);
    });
  }, []);

  // Reverse geocoding function to fetch address from coordinates
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
        {
          headers: {
            "User-Agent": "BookMyVenue/1.0",
          },
        }
      );
      const data = await response.json();
      if (data && data.display_name) {
        setSearchQuery(data.display_name);
        if (onAddressChangeRef.current) {
          onAddressChangeRef.current(data.display_name);
        }
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err);
    }
  };

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !LInstance || !mapContainerRef.current) return;

    const L = LInstance;

    // Default center Kochi: [9.9312, 76.2673]
    const initialLat = latitude !== undefined && latitude !== null ? latitude : 9.9312;
    const initialLng = longitude !== undefined && longitude !== null ? longitude : 76.2673;

    // Create custom SVG marker icon
    const customIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-[#F84464]/30 rounded-full animate-ping"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#F84464" class="w-10 h-10 drop-shadow-md z-10 -translate-y-1/2">
            <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </div>
      `,
      className: "",
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Initialize Map
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
    }).setView([initialLat, initialLng], 13);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    // Create marker
    const marker = L.marker([initialLat, initialLng], {
      icon: customIcon,
      draggable: true,
    }).addTo(map);

    // If initial coordinates were set, adjust marker
    if (latitude !== undefined && latitude !== null && longitude !== undefined && longitude !== null) {
      marker.setLatLng([latitude, longitude]);
    } else {
      // Trigger onChange once initially to capture default coordinates
      onChangeRef.current(initialLat, initialLng);
    }

    // Map click handler
    map.on("click", (e: any) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      onChangeRef.current(lat, lng);
      reverseGeocode(lat, lng);
    });

    // Marker drag handler
    marker.on("dragend", (e: any) => {
      const { lat, lng } = e.target.getLatLng();
      onChangeRef.current(lat, lng);
      reverseGeocode(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
    };
  }, [leafletLoaded, LInstance]);

  // Sync marker location when props change (from external source e.g. search)
  useEffect(() => {
    if (!mapRef.current || !markerRef.current || latitude === undefined || longitude === undefined) return;
    const currentLatLng = markerRef.current.getLatLng();
    if (currentLatLng.lat !== latitude || currentLatLng.lng !== longitude) {
      markerRef.current.setLatLng([latitude, longitude]);
      mapRef.current.panTo([latitude, longitude]);
    }
  }, [latitude, longitude]);

  // Update local search text when defaultAddress changes
  useEffect(() => {
    setSearchQuery(defaultAddress);
  }, [defaultAddress]);

  // Geocoding search function
  const searchAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || !leafletLoaded) return;

    setSearching(true);
    setErrorMsg("");

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
          searchQuery
        )}&format=json&limit=1`,
        {
          headers: {
            "User-Agent": "BookMyVenue/1.0",
          },
        }
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        onChangeRef.current(lat, lon);
        if (onAddressChangeRef.current) {
          onAddressChangeRef.current(data.display_name || searchQuery);
        }
        if (mapRef.current) {
          mapRef.current.setView([lat, lon], 15);
        }
      } else {
        setErrorMsg("Location not found. Try search terms like 'Kochi, Kerala'.");
      }
    } catch (err) {
      setErrorMsg("Failed to search location. Please try again or select manually.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-3.5">
      {/* Search Input Box */}
      <form onSubmit={searchAddress} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address or landmark..."
            className="h-10 rounded-xl pr-9 border-slate-200 shadow-sm focus-visible:ring-1"
          />
          <MapPin className="absolute right-3 top-3 h-4 w-4 text-slate-400 pointer-events-none" />
        </div>
        <Button
          type="submit"
          disabled={searching}
          className="h-10 px-4 rounded-xl gap-2 font-semibold shadow-soft hover:shadow-hover text-xs"
        >
          {searching ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Search className="h-3.5 w-3.5" />
          )}
          Find
        </Button>
      </form>

      {errorMsg && (
        <p className="text-xs font-semibold text-red-500">{errorMsg}</p>
      )}

      {/* Map Element Wrapper */}
      <div className="relative border border-slate-150 rounded-2xl overflow-hidden shadow-soft h-[260px] bg-slate-50">
        {!leafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <span className="text-xs font-medium">Loading interactive map...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>

      <div className="flex justify-between items-center bg-slate-50 border border-slate-100 rounded-xl p-3 text-[11px] text-slate-600 font-mono">
        <div>
          Lat: <span className="font-semibold text-slate-800">{latitude?.toFixed(6) ?? "N/A"}</span>
        </div>
        <div>
          Lng: <span className="font-semibold text-slate-800">{longitude?.toFixed(6) ?? "N/A"}</span>
        </div>
        <div className="text-[10px] text-slate-400 font-sans italic">
          Drag pin or click map to move
        </div>
      </div>
    </div>
  );
}
