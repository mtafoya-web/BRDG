import { NextResponse } from "next/server";

const CAMERA_QUERY_URL =
  "https://services8.arcgis.com/X84q166Srnyl4JMV/ArcGIS/rest/services/ALERTCalifornia_Camera_Feed/FeatureServer/0/query";
const MAX_DISTANCE_MILES = 100;

function getAllowedUrl(value) {
  try {
    const url = new URL(value);

    return url.protocol === "https:" &&
      url.hostname === "cameras.alertcalifornia.org"
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function getDistanceMiles(latitudeA, longitudeA, latitudeB, longitudeB) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const a =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(toRadians(latitudeA)) *
      Math.cos(toRadians(latitudeB)) *
      Math.sin(longitudeDelta / 2) ** 2;

  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(a));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return NextResponse.json(
      { error: "Valid latitude and longitude are required." },
      { status: 400 }
    );
  }

  const query = new URLSearchParams({
    where: "isOnline='online'",
    geometry: `${longitude},${latitude}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    distance: String(MAX_DISTANCE_MILES),
    units: "esriSRUnit_StatuteMile",
    outFields: "cameraName,cameraURL,imageURL,viewTime,isOnline",
    returnGeometry: "true",
    outSR: "4326",
    f: "json",
  });

  try {
    const response = await fetch(`${CAMERA_QUERY_URL}?${query}`, {
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`Camera service returned ${response.status}`);
    }

    const payload = await response.json();
    const cameras = (payload.features || [])
      .map((feature) => {
        const cameraLatitude = Number(feature.geometry?.y);
        const cameraLongitude = Number(feature.geometry?.x);

        const imageUrl = getAllowedUrl(feature.attributes?.imageURL);

        if (
          !Number.isFinite(cameraLatitude) ||
          !Number.isFinite(cameraLongitude) ||
          !imageUrl
        ) {
          return null;
        }

        return {
          name: feature.attributes.cameraName || "ALERTCalifornia camera",
          imageUrl,
          liveUrl: getAllowedUrl(feature.attributes.cameraURL),
          viewTime: feature.attributes.viewTime || null,
          position: [cameraLatitude, cameraLongitude],
          distanceMiles: getDistanceMiles(
            latitude,
            longitude,
            cameraLatitude,
            cameraLongitude
          ),
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.distanceMiles - b.distanceMiles);

    return NextResponse.json(
      {
        camera: cameras[0]
          ? {
              ...cameras[0],
              distanceMiles: Number(cameras[0].distanceMiles.toFixed(1)),
            }
          : null,
        provider: "ALERTCalifornia | UC San Diego",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Unable to load nearby public camera", error);

    return NextResponse.json(
      {
        camera: null,
        error: "Nearby public camera imagery is temporarily unavailable.",
      },
      { status: 200 }
    );
  }
}
