"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("../../components/MapView"), {
  ssr: false,
});

export default function MapPage() {
  return (
    <main className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Live Hazard Map</h1>
      <MapView />
    </main>
  );
}
