"use client";

import { useEffect, useState } from "react";

export default function HazardsPage() {
  const [hazards, setHazards] = useState([]);
  const [status, setStatus] = useState("Loading hazards…");

  useEffect(() => {
    async function loadHazards() {
      try {
        const response = await fetch("/api/fire-hazards");
        const data = await response.json();

        if (Array.isArray(data.hazards) && data.hazards.length > 0) {
          setHazards(data.hazards);
          setStatus("Live fire hazards");
        } else {
          setStatus(data.error || "No hazards returned");
        }
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Failed to load hazards");
      }
    }

    loadHazards();
  }, []);

  return (
    <main className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Hazard List</h1>
      <p className="text-sm text-gray-600">{status}</p>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left text-gray-900">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-3 font-semibold">ID</th>
              <th className="p-3 font-semibold">Type</th>
              <th className="p-3 font-semibold">Level</th>
              <th className="p-3 font-semibold">Reported</th>
              <th className="p-3 font-semibold">Location</th>
            </tr>
          </thead>

          <tbody>
            {hazards.map((h) => (
              <tr key={h.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{h.id}</td>

                <td
                  className={`p-3 font-semibold capitalize ${
                    h.type === "fire"
                      ? "text-red-700"
                      : h.type === "chemical"
                      ? "text-yellow-700"
                      : "text-gray-900"
                  }`}
                >
                  {h.type}
                </td>

                <td
                  className={`p-3 font-semibold ${
                    String(h.level || "").toLowerCase().includes("high")
                      ? "text-red-700"
                      : String(h.level || "").toLowerCase().includes("medium")
                      ? "text-yellow-700"
                      : "text-green-700"
                  }`}
                >
                  {h.level}
                </td>

                <td className="p-3">{h.time}</td>

                <td className="p-3">
                  {Array.isArray(h.position) && h.position.length === 2
                    ? `${h.position[0].toFixed(4)}, ${h.position[1].toFixed(4)}`
                    : "Unknown"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
