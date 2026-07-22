import { after, NextResponse } from "next/server";
import { hazards as fallbackHazards } from "../../../data/hazards";

const US_STATES = [
  "Alabama",
  "Alaska",
  "Arizona",
  "Arkansas",
  "California",
  "Colorado",
  "Connecticut",
  "Delaware",
  "Florida",
  "Georgia",
  "Hawaii",
  "Idaho",
  "Illinois",
  "Indiana",
  "Iowa",
  "Kansas",
  "Kentucky",
  "Louisiana",
  "Maine",
  "Maryland",
  "Massachusetts",
  "Michigan",
  "Minnesota",
  "Mississippi",
  "Missouri",
  "Montana",
  "Nebraska",
  "Nevada",
  "New Hampshire",
  "New Jersey",
  "New Mexico",
  "New York",
  "North Carolina",
  "North Dakota",
  "Ohio",
  "Oklahoma",
  "Oregon",
  "Pennsylvania",
  "Rhode Island",
  "South Carolina",
  "South Dakota",
  "Tennessee",
  "Texas",
  "Utah",
  "Vermont",
  "Virginia",
  "Washington",
  "West Virginia",
  "Wisconsin",
  "Wyoming",
  "District of Columbia",
].sort((a, b) => b.length - a.length);

let lastKnownLiveResult = null;
let refreshInFlight = null;
const LIVE_CACHE_MS = 60_000;

function getStateFromTitle(title) {
  const normalizedTitle = String(title || "");
  const state = US_STATES.find((candidate) =>
    new RegExp(`\\b${candidate.replace(/ /g, "\\s+")}\\b`, "i").test(
      normalizedTitle
    )
  );

  return state || "International / Other";
}

function getCityFromTitle(title, state) {
  const parts = String(title || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  if (state !== "International / Other" && parts.length >= 2) {
    return parts.at(-2) || "Unknown";
  }

  return "Unknown";
}

function getHazardType(title) {
  const normalizedTitle = String(title || "").toLowerCase();

  if (normalizedTitle.includes("prescribed fire")) {
    return "Prescribed Fire";
  }

  if (normalizedTitle.includes("wildfire")) {
    return "Wildfire";
  }

  if (normalizedTitle.includes("chemical")) {
    return "Chemical";
  }

  return "Fire";
}

function getFireLevelFromAcres(value) {
  const acres = Number(value || 0);

  if (acres >= 5000) {
    return "Critical";
  }

  if (acres >= 1000) {
    return "Very High";
  }

  if (acres >= 500) {
    return "High";
  }

  if (acres >= 100) {
    return "Moderate";
  }

  return "Low";
}

function getFireLevelFromConfidence(value) {
  const confidence = Number(value || 0);

  if (confidence >= 90) return "Critical";
  if (confidence >= 80) return "Very High";
  if (confidence >= 60) return "High";
  if (confidence >= 40) return "Moderate";
  return "Low";
}

function isPlaceholder(value) {
  return !value || /your-api\.example\.com|example\.com|placeholder/i.test(value);
}

function getConfiguredApiUrl() {
  const configuredUrl = process.env.FIRE_HAZARDS_API_URL?.trim();
  return configuredUrl && !isPlaceholder(configuredUrl) ? configuredUrl : null;
}

function getFirmsApiUrl() {
  const accessKey = (
    process.env.FIRMS_API_KEY?.trim() ||
    process.env.MAP_KEY?.trim() ||
    process.env.FIRMS_MAP_KEY?.trim()
  );

  if (!accessKey || isPlaceholder(accessKey)) {
    return null;
  }

  const bbox = (process.env.FIRMS_BBOX?.trim() || "-125,32,-114,42").replace(/\s+/g, "");
  const satellite = process.env.FIRMS_SATELLITE?.trim() || "VIIRS_SNPP_NRT";
  const date = process.env.FIRMS_DATE?.trim() || new Date().toISOString().slice(0, 10);
  const days = process.env.FIRMS_DAYS?.trim() || "1";

  return `https://firms.modaps.eosdis.nasa.gov/api/area/csv/${accessKey}/${satellite}/${bbox}/${date}/${days}`;
}

function parseCsv(text) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    return [];
  }

  const rawHeaders = lines[0].split(",");
  const headers = rawHeaders.map((h) =>
    String(h || "")
      .trim()
      .replace(/^"|"$/g, "")
      .toLowerCase()
  );

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const entry = {};

    headers.forEach((header, index) => {
      entry[header] = String(values[index] ?? "").trim().replace(/^"|"$/g, "");
    });

    return entry;
  });
}

function getLevel(row) {
  const brightness = Number(row.brightness || row.bright_ti4 || 0);
  const confidenceValue = String(row.confidence || "").toLowerCase();
  const confidence =
    confidenceValue === "h"
      ? 90
      : confidenceValue === "n"
        ? 60
        : confidenceValue === "l"
          ? 30
          : Number(confidenceValue || 0);

  if (brightness >= 400 || confidence >= 90) {
    return "Critical";
  }

  if (brightness >= 350 || confidence >= 80) {
    return "Very High";
  }

  if (brightness >= 325 || confidence >= 60) {
    return "High";
  }

  if (brightness >= 300 || confidence >= 40) {
    return "Moderate";
  }

  return "Low";
}

function normalizeFirmsCsv(text) {
  const rows = parseCsv(text);

  return rows
    .filter((row) => row.latitude && row.longitude)
    .map((row, index) => {
      const latitude = Number(row.latitude || row.lat || row.latitude_deg || row.lat_deg || row.y || row.latitud);
      const longitude = Number(row.longitude || row.lon || row.longitude_deg || row.lon_deg || row.x || row.longitud);

      return {
        id: `${row.acq_date || "firms"}-${row.acq_time || index}-${index}`,
        type: "Fire",
        title: `NASA FIRMS alert ${index + 1}`,
        level: getLevel(row),
        time: `${row.acq_date || "Unknown"} ${row.acq_time || ""}`.trim(),
        position: [latitude, longitude],
        summary: `Detected by ${row.instrument || "FIRMS"} with brightness ${row.brightness || "unknown"} and confidence ${row.confidence || "unknown"}.`,
        media: null,
        source: "NASA FIRMS",
        state:
          row.state ||
          process.env.FIRMS_STATE?.trim() ||
          "International / Other",
        city: row.city || "Unknown",
        details: {
          brightness: row.brightness || null,
          confidence: row.confidence || null,
          satellite: row.satellite || null,
          frp: row.frp || null,
          daynight: row.daynight || null,
        },
      };
    });
}

function normalizeEonetPayload(payload) {
  const events = Array.isArray(payload?.events) ? payload.events : [];

  return events
    .filter((event) => event?.geometry?.length)
    .map((event, index) => {
      const pointGeometry = [...(event.geometry || [])]
        .reverse()
        .find((geometry) => Array.isArray(geometry?.coordinates) && geometry.coordinates.length >= 2);
      const [longitude, latitude] = pointGeometry?.coordinates || [];

      const state = getStateFromTitle(event.title);
      const magnitudeValue = pointGeometry?.magnitudeValue;
      const magnitudeUnit = pointGeometry?.magnitudeUnit;

      return {
        id: event.id || `eonet-${index}`,
        type: getHazardType(event.title),
        title: event.title || "NASA wildfire alert",
        level: getFireLevelFromAcres(
          String(magnitudeUnit || "").toLowerCase() === "acres"
            ? magnitudeValue
            : 0
        ),
        time: pointGeometry?.date || event.closed || new Date().toISOString(),
        position: [Number(latitude), Number(longitude)],
        summary: event.description || event.title || "Wildfire event from NASA EONET.",
        media: null,
        source: "NASA EONET",
        state,
        city: getCityFromTitle(event.title, state),
        details: {
          categories: event.categories || [],
          sources: event.sources || [],
          magnitudeValue: magnitudeValue || null,
          magnitudeUnit: magnitudeUnit || null,
          levelBasis: "Reported fire acreage",
        },
      };
    });
}

function normalizeHazards(payload) {
  if (typeof payload === "string") {
    const trimmed = payload.trim();

    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith("{")) {
      try {
        return normalizeEonetPayload(JSON.parse(trimmed));
      } catch {
        return [];
      }
    }

    return normalizeFirmsCsv(trimmed);
  }

  if (Array.isArray(payload?.hazards)) {
    return payload.hazards.map((hazard) => {
      const state = hazard.state || getStateFromTitle(hazard.title);

      return {
        ...hazard,
        state,
        city: hazard.city || getCityFromTitle(hazard.title, state),
      };
    });
  }

  if (Array.isArray(payload?.events)) {
    return normalizeEonetPayload(payload);
  }

  if (Array.isArray(payload?.features)) {
    return payload.features.map((feature, index) => ({
      id: feature.id || `feature-${index}`,
      type: "Fire",
      title: feature.properties?.title || "NASA fire alert",
      level: getFireLevelFromConfidence(feature.properties?.confidence),
      time: feature.properties?.datetime || new Date().toISOString(),
      position: [feature.geometry?.coordinates?.[1], feature.geometry?.coordinates?.[0]],
      summary: feature.properties?.summary || "Fire alert from NASA.",
      media: null,
      source: "NASA",
      state: getStateFromTitle(feature.properties?.title),
      city: getCityFromTitle(
        feature.properties?.title,
        getStateFromTitle(feature.properties?.title)
      ),
      details: feature.properties || {},
    }));
  }

  return [];
}

async function fetchHazardsFromUrl(url) {
  const res = await fetch(url, {
    next: { revalidate: 60 },
    headers: {
      "User-Agent": "hazard-mapper/1.0",
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`NASA fire API responded with ${res.status} ${res.statusText}. ${body.slice(0, 200)}`);
  }

  const text = await res.text();
  const payload = text.trim().startsWith("{") ? JSON.parse(text) : text;

  return normalizeHazards(payload);
}

function getCandidateUrls() {
  const configuredApiUrl = getConfiguredApiUrl();
  const candidateUrls = [];

  if (configuredApiUrl) {
    candidateUrls.push(configuredApiUrl);
  }

  candidateUrls.push(
    "https://eonet.gsfc.nasa.gov/api/v3/categories/wildfires?status=open&source=IRWIN",
    "https://eonet.gsfc.nasa.gov/api/v3/categories/wildfires?status=open",
    "https://eonet.gsfc.nasa.gov/api/v3/events?status=open&category=wildfires"
  );

  const firmsApiUrl = getFirmsApiUrl();
  if (firmsApiUrl) {
    candidateUrls.push(firmsApiUrl);
  }

  return candidateUrls;
}

async function refreshLiveHazards() {
  let lastError = null;

  for (const url of getCandidateUrls()) {
    try {
      const hazards = await fetchHazardsFromUrl(url);

      const unitedStatesHazards = hazards.filter(
        (hazard) => hazard.state && hazard.state !== "International / Other"
      );

      if (unitedStatesHazards.length > 0) {
        const source = url.includes("eonet")
          ? "nasa-eonet"
          : url.includes("firms")
            ? "nasa-firms"
            : "custom-api";
        lastKnownLiveResult = {
          hazards: unitedStatesHazards,
          source,
          updatedAt: new Date().toISOString(),
        };

        return lastKnownLiveResult;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("Live fire providers returned no U.S. hazards.");
}

function compactHazard(hazard) {
  return {
    id: hazard.id,
    type: hazard.type,
    title: hazard.title,
    level: hazard.level,
    time: hazard.time,
    position: hazard.position,
    summary: hazard.summary,
    media: hazard.media,
    source: hazard.source,
    state: hazard.state,
    city: hazard.city,
  };
}

function createHazardResponse(result, compact) {
  return NextResponse.json(
    {
      ...result,
      hazards: compact ? result.hazards.map(compactHazard) : result.hazards,
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "private, max-age=15, stale-while-revalidate=60",
      },
    }
  );
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const compact = searchParams.get("compact") === "1";
  const forceRefresh = searchParams.get("refresh") === "1";

  try {
    if (lastKnownLiveResult && !forceRefresh) {
      const cacheAge = Date.now() - Date.parse(lastKnownLiveResult.updatedAt);

      if (cacheAge >= LIVE_CACHE_MS && !refreshInFlight) {
        const refreshPromise = refreshLiveHazards();
        refreshInFlight = refreshPromise;

        after(async () => {
          try {
            await refreshPromise;
          } catch (error) {
            console.error("Background hazard refresh failed", error);
          } finally {
            refreshInFlight = null;
          }
        });
      }

      return createHazardResponse(lastKnownLiveResult, compact);
    }

    const result = await refreshLiveHazards();
    return createHazardResponse(result, compact);
  } catch (error) {
    console.error("Unable to refresh live fire hazards", error);

    if (lastKnownLiveResult) {
      return createHazardResponse(
        {
          ...lastKnownLiveResult,
          source: "last-known-live",
          error: error instanceof Error ? error.message : "Refresh failed.",
        },
        compact
      );
    }

    return NextResponse.json(
      {
        hazards: fallbackHazards,
        source: "fallback",
        updatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Live data unavailable.",
      },
      { status: 200 }
    );
  }
}
