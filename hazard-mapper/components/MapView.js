"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { useEffect, useState } from "react";
import useHazards from "../hooks/useHazards";

const fallbackImage =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="240" viewBox="0 0 400 240">
      <rect width="400" height="240" fill="#f8faf7" />
      <rect x="24" y="24" width="352" height="192" rx="16" fill="#fff7ed" stroke="#e85d04" stroke-width="3" />
      <path d="M72 168 L140 104 L188 148 L246 86 L324 168" fill="none" stroke="#2f5f32" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="128" cy="94" r="20" fill="#e85d04" />
      <text x="200" y="208" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#0b1623">Hazard Image</text>
    </svg>
  `);

function getMarkerColor(level) {
  const normalized = String(level || "").toLowerCase();

  if (
    normalized.includes("high") ||
    normalized.includes("severe") ||
    normalized.includes("critical")
  ) {
    return "#dc2626";
  }

  if (
    normalized.includes("medium") ||
    normalized.includes("moderate") ||
    normalized.includes("warning")
  ) {
    return "#e85d04";
  }

  return "#2f5f32";
}

function getMarkerIcon(level) {
  return L.divIcon({
    html: `<div style="background-color:${getMarkerColor(level)}; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(11,22,35,0.38);"></div>`,
    className: "",
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/marker-icon-2x.png",
  iconUrl: "/leaflet/marker-icon.png",
  shadowUrl: "/leaflet/marker-shadow.png",
});

export default function MapView() {
  const { hazards, lastUpdated, loading, refresh, status } = useHazards();
  const [selectedHazardId, setSelectedHazardId] = useState(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("hazard")
  );
  const [mapCenter, setMapCenter] = useState([33.8353, -117.9145]);
  const [locationReady, setLocationReady] = useState(false);
  const [locationMessage, setLocationMessage] = useState(
    "Requesting your location..."
  );

  const selectedHazard = hazards.find(
    (hazard) => String(hazard.id) === String(selectedHazardId)
  );

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (isMounted) {
            setMapCenter([position.coords.latitude, position.coords.longitude]);
            setLocationReady(true);
            setLocationMessage("Using your current location.");
          }
        },
        () => {
          if (isMounted) {
            setMapCenter([33.8353, -117.9145]);
            setLocationReady(true);
            setLocationMessage(
              "Location access was blocked. Showing Anaheim instead."
            );
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      queueMicrotask(() => {
        if (isMounted) {
          setLocationReady(true);
          setLocationMessage(
            "Geolocation is not supported. Showing Anaheim instead."
          );
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="relative z-10 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">
            {status}. Auto-refreshes every 60 seconds.
          </p>
          <p className="text-xs text-slate-500">
            {locationMessage}
            {lastUpdated
              ? ` Last updated ${lastUpdated.toLocaleTimeString()}.`
              : ""}
          </p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="btn-secondary min-h-0 px-4 py-2 text-sm disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Refreshing..." : "Refresh now"}
        </button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={12}
        style={{ height: "500px", width: "100%" }}
        className="border border-white/70 bg-white shadow-xl"
      >
        <MapController
          center={selectedHazard?.position || mapCenter}
          zoom={selectedHazard ? 10 : 12}
        />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        {hazards.filter(hasValidPosition).map((h) => (
          <Marker
            key={h.id}
            position={h.position}
            icon={getMarkerIcon(h.level)}
            eventHandlers={{
              click: () => setSelectedHazardId(h.id),
            }}
          />
        ))}

        {selectedHazard && (
          <Popup
            position={selectedHazard.position}
            onClose={() => setSelectedHazardId(null)}
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
              <Link
                href={{
                  pathname: "/hazards",
                  query: { hazard: String(selectedHazard.id) },
                }}
                className="mt-2 inline-flex font-bold text-[#2f5f32] underline"
              >
                View complete data record
              </Link>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  );
}

function hasValidPosition(hazard) {
  return (
    Array.isArray(hazard.position) &&
    hazard.position.length === 2 &&
    hazard.position.every((coordinate) => Number.isFinite(Number(coordinate)))
  );
}

function MapController({ center, zoom }) {
  const map = useMap();
  const latitude = Number(center?.[0]);
  const longitude = Number(center?.[1]);

  useEffect(() => {
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      map.setView([latitude, longitude], zoom);
    }
  }, [latitude, longitude, map, zoom]);

  return null;
}
