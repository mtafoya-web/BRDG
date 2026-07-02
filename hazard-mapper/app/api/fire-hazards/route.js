import { NextResponse } from "next/server";
import { hazards as fallbackHazards } from "../../../data/hazards";

function isPlaceholder(value) {
  return !value || /your-api\.example\.com|example\.com|placeholder/i.test(value);
}

function getApiUrl() {
  const configuredUrl = process.env.FIRE_HAZARDS_API_URL?.trim();

  if (configuredUrl && !isPlaceholder(configuredUrl)) {
    return configuredUrl;
  }

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
  const brightness = Number(row.brightness || 0);
  const confidence = Number(row.confidence || 0);

  if (brightness >= 350 || confidence >= 80) {
    return "High";
  }

  if (brightness >= 300 || confidence >= 60) {
    return "Medium";
  }

  return "Low";
}

function normalizeHazards(payload) {
  if (typeof payload === "string") {
    const csvRows = parseCsv(payload);

    return csvRows
      .filter((row) => row.latitude && row.longitude)
      .slice(0, 15)
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

  if (Array.isArray(payload?.hazards)) {
    return payload.hazards;
  }

  if (Array.isArray(payload?.features)) {
    return payload.features.map((feature, index) => ({
      id: feature.id || `feature-${index}`,
      type: "Fire",
      title: feature.properties?.title || "NASA FIRMS alert",
      level: feature.properties?.confidence >= 80 ? "High" : "Medium",
      time: feature.properties?.datetime || new Date().toISOString(),
      position: [feature.geometry?.coordinates?.[1], feature.geometry?.coordinates?.[0]],
      summary: feature.properties?.summary || "Fire alert from NASA FIRMS.",
      media: null,
      source: "NASA FIRMS",
      details: feature.properties || {},
    }));
  }

  return [];
}

export async function GET() {
  try {
    const apiUrl = getApiUrl();

    if (!apiUrl) {
      return NextResponse.json(
        {
          hazards: fallbackHazards,
          source: "fallback",
          error: "Set FIRMS_API_KEY to use NASA FIRMS live fire alerts.",
        },
        { status: 200 }
      );
    }

    const res = await fetch(apiUrl, {
      next: { revalidate: 60 },
      headers: {
        "User-Agent": "hazard-mapper/1.0",
      },
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`NASA FIRMS responded with ${res.status} ${res.statusText}. ${body.slice(0,200)}`);
    }

    const text = await res.text();
    const hazards = normalizeHazards(text);

    if (hazards.length === 0) {
      return NextResponse.json(
        {
          hazards: fallbackHazards,
          source: "fallback",
          error: "NASA FIRMS returned no fire alerts for the selected region.",
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ hazards, source: "nasa-firms" }, { status: 200 });
  } catch (error) {
    console.error("Unable to load fire hazards", error);

    return NextResponse.json(
      {
        hazards: fallbackHazards,
        source: "fallback",
        error:
          error instanceof Error
            ? error.message
            : "Unable to load fire hazards right now.",
      },
      { status: 200 }
    );
  }
}
