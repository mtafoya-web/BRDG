"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const STORAGE_PREFIX = "hazard-mapper-filter-";
const HazardFiltersContext = createContext(null);

function getStoredFilter(name, fallback) {
  try {
    if (typeof window === "undefined") {
      return fallback;
    }

    return window.localStorage.getItem(`${STORAGE_PREFIX}${name}`) || fallback;
  } catch {
    return fallback;
  }
}

function storeFilter(name, value) {
  try {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(`${STORAGE_PREFIX}${name}`, value);
    }
  } catch {}
}

export default function HazardFiltersProvider({ children }) {
  const [stateFilterValue, setStateFilterValue] = useState("All states");
  const [cityFilterValue, setCityFilterValue] = useState("All cities / areas");
  const [levelFilterValue, setLevelFilterValue] = useState("All levels");
  const [typeFilterValue, setTypeFilterValue] = useState("All types");

  useEffect(() => {
    queueMicrotask(() => {
      setStateFilterValue(getStoredFilter("state", "All states"));
      setCityFilterValue(getStoredFilter("city", "All cities / areas"));
      setLevelFilterValue(getStoredFilter("level", "All levels"));
      setTypeFilterValue(getStoredFilter("type", "All types"));
    });
  }, []);

  const setStateFilter = useCallback((value) => {
    setStateFilterValue(value);
    setCityFilterValue("All cities / areas");
    storeFilter("state", value);
    storeFilter("city", "All cities / areas");
  }, []);
  const setCityFilter = useCallback((value) => {
    setCityFilterValue(value);
    storeFilter("city", value);
  }, []);
  const setLevelFilter = useCallback((value) => {
    setLevelFilterValue(value);
    storeFilter("level", value);
  }, []);
  const setTypeFilter = useCallback((value) => {
    setTypeFilterValue(value);
    storeFilter("type", value);
  }, []);

  const value = useMemo(
    () => ({
      cityFilter: cityFilterValue,
      levelFilter: levelFilterValue,
      setCityFilter,
      setLevelFilter,
      setStateFilter,
      setTypeFilter,
      stateFilter: stateFilterValue,
      typeFilter: typeFilterValue,
    }),
    [
      cityFilterValue,
      levelFilterValue,
      setCityFilter,
      setLevelFilter,
      setStateFilter,
      setTypeFilter,
      stateFilterValue,
      typeFilterValue,
    ]
  );

  return (
    <HazardFiltersContext.Provider value={value}>
      {children}
    </HazardFiltersContext.Provider>
  );
}

export function useHazardFilters() {
  const context = useContext(HazardFiltersContext);

  if (!context) {
    throw new Error("useHazardFilters must be used inside HazardFiltersProvider");
  }

  return context;
}
