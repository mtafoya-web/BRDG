"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import { hazards as fallbackHazards } from "../data/hazards";

const fallbackImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
      <rect width="400" height="240" fill="#fef2f2" />
      <rect x="24" y="24" width="352" height="192" rx="16" fill="#fee2e2" stroke="#f87171" stroke-width="3" />
      <path d="M72 168 L140 104 L188 148 L246 86 L324 168" fill="none" stroke="#dc2626" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="128" cy="94" r="20" fill="#ef4444" />
      <text x="200" y="208" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#991b1b">Hazard Image</text>
    </svg>
  `);

function getMarkerColor(level) {
  const normalized = String(level || "").toLowerCase();

  if (normalized.includes("high") || normalized.includes("severe") || normalized.includes("critical")) {
    return "#dc2626";
  }

  if (normalized.includes("medium") || normalized.includes("moderate") || normalized.includes("warning")) {
    return "#f59e0b";
  }

  return "#3b82f6";
}

function getMarkerIcon(level) {
  return L.divIcon({
    html: `<div style="background-color:${getMarkerColor(level)}; width: 16px; height: 16px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    className: "",
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

// Fix default Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export default function MapView() {
  const [hazards, setHazards] = useState([]);
  const [selectedHazard, setSelectedHazard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState("Loading fire hazard data…");
  const [mapCenter, setMapCenter] = useState([33.8353, -117.9145]);
  const [locationReady, setLocationReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setMapCenter([position.coords.latitude, position.coords.longitude]);
            setLocationReady(true);
            setStatusMessage("Using your current location.");
          }
        },
        () => {
          if (isMounted) {
            setMapCenter([33.8353, -117.9145]);
            setLocationReady(true);
            setStatusMessage("Location access was blocked. Showing Anaheim instead.");
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setLocationReady(true);
      setStatusMessage("Geolocation is not supported. Showing Anaheim instead.");
    }

    async function loadHazards() {
      try {
        const response = await fetch("/api/fire-hazards");
        const data = await response.json();

        if (!isMounted) {
          return;
        }

        if (Array.isArray(data.hazards) && data.hazards.length > 0) {
          setHazards(data.hazards);
          setStatusMessage("Showing live fire hazard data.");
        } else {
          setHazards(fallbackHazards);
          setStatusMessage(
            data.error
              ? `Live API error: ${data.error}. Showing sample data.`
              : "No live fire hazards returned. Showing sample data."
          );
        }
      } catch (error) {
        console.error("Failed to fetch fire hazards", error);
        if (isMounted) {
          setHazards(fallbackHazards);
          setStatusMessage(
            error instanceof Error
              ? `Live API error: ${error.message}. Showing sample data.`
              : "Unable to load live API data. Showing sample data."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadHazards();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative z-10 space-y-2">
      <p className="text-sm text-gray-600">{statusMessage}</p>
      {!locationReady && (
        <p className="text-sm text-gray-500">Requesting your location…</p>
      )}

      {loading && (
        <p className="text-sm text-gray-600">Loading fire hazard data…</p>
      )}

      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
        className="bg-white"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {hazards.map((h) => (
          <Marker
            key={h.id}
            position={h.position}
            icon={getMarkerIcon(h.level)}
            eventHandlers={{
              click: () => setSelectedHazard(h),
            }}
          />
        ))}

        {selectedHazard && (
          <Popup
            position={selectedHazard.position}
            onClose={() => setSelectedHazard(null)}
          >
            <div className="max-w-[240px] space-y-1">
              <h2 className="font-bold text-gray-900">
                {selectedHazard.title || `${selectedHazard.type} Hazard`}
              </h2>
              <p className="text-sm text-gray-700">
                Type: {selectedHazard.type}
              </p>
              <p className="text-sm text-gray-700">
                Level: {selectedHazard.level}
              </p>
              <p className="text-sm text-gray-700">
                Reported: {selectedHazard.time}
              </p>
              {(selectedHazard.media || fallbackImage) && (
                <img
                  src={selectedHazard.media || fallbackImage}
                  alt={selectedHazard.title || "Hazard image"}
                  className="w-full rounded-md border border-gray-200"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
              )}
              {selectedHazard.summary && (
                <p className="text-sm text-gray-600">
                  {selectedHazard.summary}
                </p>
              )}
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}
