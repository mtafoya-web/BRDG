"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function HazardsPage() {
  const [hazards, setHazards] = useState([]);
  const [status, setStatus] = useState("Loading hazards...");

  useEffect(() => {
    async function loadHazards() {
      try {
        const response = await fetch("/api/fire-hazards");
        const data = await response.json();

        if (Array.isArray(data.hazards) && data.hazards.length > 0) {
          setHazards(data.hazards);
          setStatus(
            data.source === "fallback"
              ? "Showing sample hazard data"
              : "Showing live fire hazard data"
          );
        } else {
          setStatus(data.error || "No hazards returned");
        }
      } catch (error) {
        setStatus(
          error instanceof Error ? error.message : "Failed to load hazards"
        );
      }
    }

    loadHazards();
  }, []);

  const highCount = hazards.filter((h) =>
    String(h.level || "").toLowerCase().includes("high")
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

          <Link href="/map" className="btn-secondary">
            View Map
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Level</th>
                <th>Reported</th>
                <th>Location</th>
              </tr>
            </thead>

            <tbody>
              {hazards.map((h) => (
                <tr key={h.id} className="transition hover:bg-white/55">
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
                </tr>
              ))}
            </tbody>
          </table>
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
    normalized.includes("high") || normalized.includes("fire")
      ? "bg-red-100 text-red-800"
      : normalized.includes("medium") || normalized.includes("chemical")
      ? "bg-orange-100 text-orange-800"
      : "bg-green-100 text-green-800";

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${color}`}
    >
      {value || "Unknown"}
    </span>
  );
}