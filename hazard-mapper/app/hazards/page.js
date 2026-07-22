"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import useHazards from "@/hooks/useHazards";
import { sortHazards } from "@/utils/hazardTime";
import { useHazardFilters } from "@/components/HazardFiltersProvider";

const PAGE_SIZE = 50;
const FIRE_LEVELS = ["Low", "Moderate", "High", "Very High", "Critical"];
const HAZARD_TYPES = ["Wildfire", "Prescribed Fire", "Fire", "Chemical"];

export default function HazardsPage() {
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
  const [cityOrder, setCityOrder] = useState("none");
  const [timeOrder, setTimeOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

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
  const filteredHazards = useMemo(
    () =>
      sortHazards(
        hazards.filter(
          (hazard) =>
            (stateFilter === "All states" || hazard.state === stateFilter) &&
            (levelFilter === "All levels" || hazard.level === levelFilter) &&
            (typeFilter === "All types" || hazard.type === typeFilter) &&
            (cityFilter === "All cities / areas" ||
              hazard.city === cityFilter)
        ),
        { cityOrder, timeOrder }
      ),
    [
      cityFilter,
      cityOrder,
      hazards,
      levelFilter,
      stateFilter,
      timeOrder,
      typeFilter,
    ]
  );
  const totalPages = Math.max(
    1,
    Math.ceil(filteredHazards.length / PAGE_SIZE)
  );
  const selectedIndex = selectedHazardId
    ? filteredHazards.findIndex(
        (hazard) => String(hazard.id) === String(selectedHazardId)
      )
    : -1;
  const selectedPage =
    selectedIndex >= 0 ? Math.floor(selectedIndex / PAGE_SIZE) + 1 : null;
  const activePage = Math.min(selectedPage || currentPage, totalPages);
  const visibleHazards = useMemo(
    () =>
      filteredHazards.slice(
        (activePage - 1) * PAGE_SIZE,
        activePage * PAGE_SIZE
      ),
    [activePage, filteredHazards]
  );

  useEffect(() => {
    if (!selectedHazardId || visibleHazards.length === 0) {
      return;
    }

    document
      .getElementById(`hazard-${selectedHazardId}`)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [visibleHazards, selectedHazardId]);

  const highCount = filteredHazards.filter((h) =>
    /high|critical/i.test(String(h.level || ""))
  ).length;

  return (
    <div className="page-shell">
      <section className="space-y-8">
        <div className="max-w-4xl">
          <div className="section-kicker">Hazard data</div>

          <h1 className="section-title">
            Active fire and field hazard reports.
          </h1>

          <p className="section-copy">
            Review the same API-backed hazard feed used by the map, including
            severity, report time, and coordinates for each event.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <SummaryCard label="Reports" value={hazards.length} />
          <SummaryCard label="Filtered" value={filteredHazards.length} />
          <SummaryCard label="High risk" value={highCount} />
          <SummaryCard label="Feed status" value={status} compact />
        </div>
      </section>

      <section className="theme-card mt-10 overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0b1623]">Hazard list</h2>
            <p className="mt-1 text-sm text-slate-600">{status}</p>
          </div>
        </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-black/10 bg-white/40 px-5 py-3 text-xs font-semibold text-slate-600">
            <label className="inline-flex items-center gap-1.5">
              <span>State</span>
              <select
                value={stateFilter}
                onChange={(event) => {
                  setStateFilter(event.target.value);
                  setCurrentPage(1);
                  setSelectedHazardId(null);
                }}
                className="max-w-48 rounded-md border border-slate-300 bg-white px-2 py-1 outline-none"
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
                  setCurrentPage(1);
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
                  setCurrentPage(1);
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
              <span>City order</span>
              <select
                value={cityOrder}
                onChange={(event) => {
                  setCityOrder(event.target.value);
                  setCurrentPage(1);
                  setSelectedHazardId(null);
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 outline-none"
              >
                <option value="none">Default</option>
                <option value="az">A–Z</option>
                <option value="za">Z–A</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span>Report time</span>
              <select
                value={timeOrder}
                onChange={(event) => {
                  setTimeOrder(event.target.value);
                  setCurrentPage(1);
                  setSelectedHazardId(null);
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 outline-none"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
              </select>
            </label>
            <label className="inline-flex items-center gap-1.5">
              <span>Type</span>
              <select
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value);
                  setCurrentPage(1);
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
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="btn-secondary min-h-0 px-4 py-2 text-sm disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Refreshing..." : "Refresh now"}
            </button>
            <Link href="/map" className="btn-secondary min-h-0 px-4 py-2 text-sm">
              View Map
            </Link>
        </div>

        <p className="border-b border-black/10 px-5 py-3 text-xs text-slate-500">
          Auto-refreshes every 60 seconds
          {lastUpdated ? ` · Last updated ${lastUpdated.toLocaleTimeString()}` : ""}
          {` · Page ${activePage} of ${totalPages} · Up to ${PAGE_SIZE} reports per page`}
        </p>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Level</th>
                <th>Reported</th>
                <th>Location</th>
                <th>State</th>
                <th>City / area</th>
                <th>Map</th>
              </tr>
            </thead>

            <tbody>
              {visibleHazards.map((h) => (
                <tr
                  id={`hazard-${h.id}`}
                  key={h.id}
                  className={`transition hover:bg-white/55 ${
                    String(h.id) === String(selectedHazardId)
                      ? "bg-orange-100/80 ring-2 ring-inset ring-orange-400"
                      : ""
                  }`}
                >
                  <td className="font-semibold">{h.id}</td>

                  <td className="capitalize">
                    <RiskLabel type={h.type} value={h.type} />
                  </td>

                  <td>
                    <RiskLabel type={h.level} value={h.level} />
                  </td>

                  <td>{h.time}</td>

                  <td>
                    {Array.isArray(h.position) && h.position.length === 2
                      ? `${Number(h.position[0]).toFixed(4)}, ${Number(
                          h.position[1]
                        ).toFixed(4)}`
                      : "Unknown"}
                  </td>

                  <td>{h.state || "International / Other"}</td>

                  <td>{h.city || "Unknown"}</td>

                  <td>
                    <Link
                      href={{
                        pathname: "/map",
                        query: { hazard: String(h.id) },
                      }}
                      className="font-bold text-[#2f5f32] underline"
                    >
                      Show on map
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-slate-600">
            Showing {visibleHazards.length} of {filteredHazards.length} matching
            reports
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={activePage <= 1}
              onClick={() => {
                setSelectedHazardId(null);
                setCurrentPage(Math.max(1, activePage - 1));
              }}
              className="btn-secondary min-h-0 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm font-black text-[#0b1623]">
              {activePage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={activePage >= totalPages}
              onClick={() => {
                setSelectedHazardId(null);
                setCurrentPage(Math.min(totalPages, activePage + 1));
              }}
              className="btn-secondary min-h-0 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, compact = false }) {
  return (
    <div className="theme-card flex-1 p-5">
      <p className="text-sm font-semibold text-slate-500">{label}</p>

      <p
        className={`mt-3 font-black text-[#2f5f32] ${
          compact ? "text-lg leading-tight" : "text-4xl"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function RiskLabel({ type, value }) {
  const normalized = String(type || "").toLowerCase();

  const color =
    normalized.includes("critical")
      ? "bg-red-200 text-red-950"
      : normalized.includes("very high")
        ? "bg-red-100 text-red-800"
        : normalized.includes("high") || normalized.includes("fire")
          ? "bg-orange-100 text-orange-800"
          : normalized.includes("moderate") ||
              normalized.includes("chemical")
            ? "bg-yellow-100 text-yellow-800"
            : "bg-green-100 text-green-800";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${color}`}
    >
      {value || "Unknown"}
    </span>
  );
}
