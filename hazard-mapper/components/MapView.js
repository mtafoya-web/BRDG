"use client";

import "leaflet/dist/leaflet.css";
import Link from "next/link";
import {
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import useHazards from "../hooks/useHazards";
import { useHazardFilters } from "./HazardFiltersProvider";

const FIRE_LEVELS = ["Low", "Moderate", "High", "Very High", "Critical"];
const HAZARD_TYPES = ["Wildfire", "Prescribed Fire", "Fire", "Chemical"];
const USA_CENTER = [39.8283, -98.5795];

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

  if (normalized.includes("critical")) {
    return "#7f1d1d";
  }

  if (normalized.includes("very high") || normalized.includes("severe")) {
    return "#dc2626";
  }

  if (normalized.includes("high")) {
    return "#f97316";
  }

  if (normalized.includes("moderate") || normalized.includes("warning")) {
    return "#eab308";
  }

  return "#2f5f32";
}

export default function MapView() {
  const { hazards, lastUpdated, loading, refresh, status } = useHazards();
  const {
    cityFilter,
    levelFilter,
    setCityFilter,
    setLevelFilter,
    setStateFilter,
    setTypeFilter,
    stateFilter,
    typeFilter,
  } = useHazardFilters();
  const [selectedHazardId, setSelectedHazardId] = useState(() =>
    typeof window === "undefined"
      ? null
      : new URLSearchParams(window.location.search).get("hazard")
  );

  const stateOptions = useMemo(
    () =>
      [...new Set(hazards.map((hazard) => hazard.state).filter(Boolean))].sort(
        (a, b) => a.localeCompare(b)
      ),
    [hazards]
  );
  const cityOptions = useMemo(
    () =>
      [
        ...new Set(
          hazards
            .filter(
              (hazard) =>
                stateFilter === "All states" || hazard.state === stateFilter
            )
            .map((hazard) => hazard.city)
            .filter((city) => city && city !== "Unknown")
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [hazards, stateFilter]
  );
  const visibleHazards = useMemo(
    () =>
      hazards.filter(
        (hazard) =>
          (stateFilter === "All states" || hazard.state === stateFilter) &&
          (levelFilter === "All levels" || hazard.level === levelFilter) &&
          (typeFilter === "All types" || hazard.type === typeFilter) &&
          (cityFilter === "All cities / areas" || hazard.city === cityFilter)
      ),
    [cityFilter, hazards, levelFilter, stateFilter, typeFilter]
  );
  const mappableHazards = useMemo(
    () => visibleHazards.filter(hasValidPosition),
    [visibleHazards]
  );
  const fitKey = `${stateFilter}|${cityFilter}|${levelFilter}|${typeFilter}`;

  const selectedHazard = visibleHazards.find(
    (hazard) => String(hazard.id) === String(selectedHazardId)
  );

  return (
    <div className="relative z-10 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-600">
            {status}. Auto-refreshes every 60 seconds.
          </p>
          <p className="text-xs text-slate-500">
            Showing all matching U.S. reports. Browser location does not limit
            hazard coverage.
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

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-black/10 bg-white/65 px-4 py-3 text-xs font-semibold text-slate-600">
        <span>
          {mappableHazards.length} of {hazards.length} hazards on map
        </span>
        <label className="inline-flex items-center gap-1.5">
          <span>State</span>
          <select
            value={stateFilter}
            onChange={(event) => {
              setStateFilter(event.target.value);
              setSelectedHazardId(null);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 outline-none"
          >
            <option>All states</option>
            {stateOptions.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5">
          <span>City</span>
          <select
            value={cityFilter}
            onChange={(event) => {
              setCityFilter(event.target.value);
              setSelectedHazardId(null);
            }}
            className="max-w-48 rounded-md border border-slate-300 bg-white px-2 py-1 outline-none"
          >
            <option>All cities / areas</option>
            {cityOptions.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5">
          <span>Level</span>
          <select
            value={levelFilter}
            onChange={(event) => {
              setLevelFilter(event.target.value);
              setSelectedHazardId(null);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 outline-none"
          >
            <option>All levels</option>
            {FIRE_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <label className="inline-flex items-center gap-1.5">
          <span>Type</span>
          <select
            value={typeFilter}
            onChange={(event) => {
              setTypeFilter(event.target.value);
              setSelectedHazardId(null);
            }}
            className="rounded-md border border-slate-300 bg-white px-2 py-1 outline-none"
          >
            <option>All types</option>
            {HAZARD_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>
        <MapLegend color="#7f1d1d" label="Critical" />
        <MapLegend color="#dc2626" label="Very High" />
        <MapLegend color="#f97316" label="High" />
        <MapLegend color="#eab308" label="Moderate" />
        <MapLegend color="#2f5f32" label="Low" />
        <span className="font-normal text-slate-500">
          The map automatically fits all current reports.
        </span>
      </div>

      <MapContainer
        center={USA_CENTER}
        zoom={4}
        preferCanvas
        style={{ height: "500px", width: "100%" }}
        className="border border-white/70 bg-white shadow-xl"
      >
        <MapController
          fallbackCenter={USA_CENTER}
          fitKey={fitKey}
          hazards={mappableHazards}
          selectedHazard={selectedHazard}
        />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <HazardLayer hazards={mappableHazards} onSelect={setSelectedHazardId} />

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
              <p className="text-sm text-gray-700">
                Location: {selectedHazard.city || "Unknown"},{" "}
                {selectedHazard.state || "Unknown"}
              </p>
              {selectedHazard.media ? (
                <img
                  src={selectedHazard.media}
                  alt={selectedHazard.title || "Hazard image"}
                  className="w-full rounded-md border border-gray-200"
                  onError={(event) => {
                    event.currentTarget.src = fallbackImage;
                  }}
                />
              ) : (
                <CameraPreview
                  key={selectedHazard.id}
                  position={selectedHazard.position}
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

function MapController({ fallbackCenter, fitKey, hazards, selectedHazard }) {
  const map = useMap();
  const lastFitKey = useRef(null);
  const selectedLatitude = Number(selectedHazard?.position?.[0]);
  const selectedLongitude = Number(selectedHazard?.position?.[1]);
  const fallbackLatitude = Number(fallbackCenter?.[0]);
  const fallbackLongitude = Number(fallbackCenter?.[1]);
  const validPositions = useMemo(
    () =>
      hazards.filter(hasValidPosition).map((hazard) => [
        Number(hazard.position[0]),
        Number(hazard.position[1]),
      ]),
    [hazards]
  );

  useEffect(() => {
    if (
      Number.isFinite(selectedLatitude) &&
      Number.isFinite(selectedLongitude)
    ) {
      map.setView([selectedLatitude, selectedLongitude], 10);
      return;
    }

    if (validPositions.length > 0 && lastFitKey.current !== fitKey) {
      map.fitBounds(validPositions, {
        padding: [40, 40],
        maxZoom: 9,
      });
      lastFitKey.current = fitKey;
      return;
    }

    if (Number.isFinite(fallbackLatitude) && Number.isFinite(fallbackLongitude)) {
      map.setView([fallbackLatitude, fallbackLongitude], 12);
    }
  }, [
    fallbackLatitude,
    fallbackLongitude,
    fitKey,
    map,
    selectedLatitude,
    selectedLongitude,
    validPositions,
  ]);

  return null;
}

function HazardLayer({ hazards, onSelect }) {
  const map = useMap();

  useEffect(() => {
    const layer = L.layerGroup().addTo(map);
    const renderer = L.canvas({ padding: 0.5 });

    hazards.forEach((hazard) => {
      L.circleMarker(hazard.position, {
        renderer,
        radius: 6,
        color: "#ffffff",
        fillColor: getMarkerColor(hazard.level),
        fillOpacity: 0.9,
        weight: 2,
      })
        .on("click", () => onSelect(hazard.id))
        .addTo(layer);
    });

    return () => {
      layer.remove();
      renderer.remove();
    };
  }, [hazards, map, onSelect]);

  return null;
}

function MapLegend({ color, label }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-3 w-3 rounded-full border-2 border-white shadow"
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}

function CameraPreview({ position }) {
  const [result, setResult] = useState({ status: "loading", camera: null });
  const [imageFailed, setImageFailed] = useState(false);
  const latitude = Number(position?.[0]);
  const longitude = Number(position?.[1]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCamera() {
      try {
        const response = await fetch(
          `/api/nearby-camera?lat=${encodeURIComponent(latitude)}&lng=${encodeURIComponent(longitude)}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(`Camera lookup returned ${response.status}`);
        }

        const data = await response.json();
        setResult({
          status: data.camera ? "ready" : "unavailable",
          camera: data.camera || null,
        });
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setResult({ status: "unavailable", camera: null });
      }
    }

    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      loadCamera();
    }

    return () => controller.abort();
  }, [latitude, longitude]);

  if (result.status === "loading") {
    return (
      <p className="rounded-md bg-slate-100 p-2 text-xs text-slate-600">
        Looking for a nearby public wildfire camera...
      </p>
    );
  }

  if (!result.camera) {
    return (
      <p className="rounded-md bg-slate-100 p-2 text-xs text-slate-600">
        No compatible public camera was found within 100 miles of this report.
      </p>
    );
  }

  const camera = result.camera;

  return (
    <div className="space-y-1 rounded-md border border-gray-200 p-2">
      {!imageFailed ? (
        <img
          src={camera.imageUrl}
          alt={`Current view from ${camera.name}`}
          className="w-full rounded-md"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <p className="bg-slate-100 p-2 text-xs text-slate-600">
          The current camera image could not be loaded.
        </p>
      )}
      <p className="text-xs font-bold text-gray-800">
        {camera.name} · {camera.distanceMiles} miles away
      </p>
      {camera.viewTime && (
        <p className="text-xs text-gray-600">Camera time: {camera.viewTime}</p>
      )}
      <p className="text-[11px] leading-4 text-gray-500">
        Public image: ALERTCalifornia | UC San Diego. A nearby camera may not
        be facing the incident and does not confirm visible fire.
      </p>
      {camera.liveUrl && (
        <a
          href={camera.liveUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-bold text-[#2f5f32] underline"
        >
          Open live public camera
        </a>
      )}
    </div>
  );
}
