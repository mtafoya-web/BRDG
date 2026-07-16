"use client";

import { useCallback, useEffect, useState } from "react";
import { hazards as fallbackHazards } from "../data/hazards";

const REFRESH_INTERVAL_MS = 60_000;

export default function useHazards() {
  const [hazards, setHazards] = useState([]);
  const [status, setStatus] = useState("Loading hazards...");
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => {
    setRefreshKey((current) => current + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadHazards(silent = false) {
      if (!silent) {
        setLoading(true);
      }

      try {
        const response = await fetch("/api/fire-hazards", {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(`Hazard API returned ${response.status}`);
        }

        const data = await response.json();
        const nextHazards =
          Array.isArray(data.hazards) && data.hazards.length > 0
            ? data.hazards
            : fallbackHazards;

        setHazards(nextHazards);
        setSource(data.source || "fallback");
        setStatus(
          data.source === "fallback"
            ? "Showing sample hazard data"
            : "Showing live fire hazard data"
        );
        setLastUpdated(new Date());
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Failed to fetch fire hazards", error);
        setHazards((current) =>
          current.length > 0 ? current : fallbackHazards
        );
        setSource("fallback");
        setStatus(
          error instanceof Error
            ? `${error.message}. Showing the latest available data`
            : "Unable to refresh hazards. Showing the latest available data"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadHazards();
    const intervalId = window.setInterval(
      () => loadHazards(true),
      REFRESH_INTERVAL_MS
    );

    return () => {
      controller.abort();
      window.clearInterval(intervalId);
    };
  }, [refreshKey]);

  return {
    hazards,
    lastUpdated,
    loading,
    refresh,
    source,
    status,
  };
}
