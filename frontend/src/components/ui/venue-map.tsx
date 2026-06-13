"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";

interface VenueMapProps {
  latitude?: number;
  longitude?: number;
  address: string;
}

export default function VenueMap({ latitude, longitude, address }: VenueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [LInstance, setLInstance] = useState<any>(null);

  // Load Leaflet and CSS dynamically
  useEffect(() => {
    if (typeof window === "undefined" || !latitude || !longitude) return;

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
  }, [latitude, longitude]);

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || !LInstance || !mapContainerRef.current || !latitude || !longitude) return;

    const L = LInstance;

    // Create custom SVG marker icon
    const customIcon = L.divIcon({
      html: `
        <div class="relative flex items-center justify-center">
          <div class="absolute w-8 h-8 bg-blue-500/30 rounded-full animate-ping"></div>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3B82F6" class="w-9 h-9 drop-shadow-md z-10 -translate-y-1/2">
            <path fill-rule="evenodd" d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
          </svg>
        </div>
      `,
      className: "",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      scrollWheelZoom: false, // Prevent map zooming when scrolling the page
    }).setView([latitude, longitude], 15);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20,
    }).addTo(map);

    L.control.zoom({
      position: "bottomright",
    }).addTo(map);

    L.marker([latitude, longitude], {
      icon: customIcon,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, [leafletLoaded, LInstance, latitude, longitude]);

  if (!latitude || !longitude) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center shadow-sm flex flex-col items-center justify-center min-h-[220px]">
        <AlertCircle className="h-8 w-8 text-slate-400 mb-2" />
        <h4 className="font-semibold text-sm text-slate-700">Map location not set</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          The owner has not specified map coordinates for this venue. You can use the address listed above to find it.
        </p>
      </div>
    );
  }

  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900">Location</h3>
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all"
        >
          Get Directions
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="relative border border-slate-100 rounded-2xl overflow-hidden shadow-soft h-[300px] bg-slate-50">
        {!leafletLoaded && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50 text-slate-400">
            <Loader2 className="h-8 w-8 animate-spin text-slate-300" />
            <span className="text-xs font-medium">Loading map...</span>
          </div>
        )}
        <div ref={mapContainerRef} className="h-full w-full z-0" />
      </div>
      
      <p className="text-xs text-slate-500 leading-relaxed italic flex items-start gap-1.5 px-1">
        <span className="font-semibold not-italic">Address:</span> {address}
      </p>
    </div>
  );
}
