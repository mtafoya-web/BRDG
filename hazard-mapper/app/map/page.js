"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const MapView = dynamic(() => import("../../components/MapView"), {
  ssr: false,
});

export default function MapPage() {
  return (
    <div className="page-shell">
      <section className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end">
        <div>
          <div className="section-kicker">Live map</div>
          <h1 className="section-title">Ground-level hazard awareness.</h1>
          <p className="section-copy">
            The map fits all matching U.S. wildfire reports and uses the same
            nationwide feed and filters as the hazard data table.
          </p>
        </div>

        <div className="theme-card p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-orange-600">
            Map workflow
          </p>
          <p className="mt-3 text-lg font-bold text-[#0b1623]">
            Click any marker to inspect severity, timestamp, image evidence, and
            summary details.
          </p>
          <Link href="/hazards" className="btn-secondary mt-5">
            View Data Table
          </Link>
        </div>
      </section>

      <section className="theme-card mt-10 overflow-hidden p-4 sm:p-6">
        <MapView />
      </section>
    </div>
  );
}
