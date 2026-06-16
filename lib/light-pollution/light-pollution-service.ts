import "server-only";

import { unstable_cache } from "next/cache";
import { clampScore, getBortleClassFromScore, getBortleDescription, getLightPollutionLevelLabel, getSkyQualityRating, getStargazingRecommendation } from "@/lib/light-pollution/bortle-classification";
import type { LightPollutionData, NominatimReverseResponse } from "@/lib/light-pollution/light-pollution-types";

function getSourceLabel(response: NominatimReverseResponse) {
  const parts = [response.category, response.type].filter(Boolean);
  return parts.length > 0 ? parts.join(" / ") : "estimated";
}

function getSettlementWeight(response: NominatimReverseResponse) {
  const category = response.category?.toLowerCase() ?? "";
  const type = response.type?.toLowerCase() ?? "";
  const placeName = response.name?.toLowerCase() ?? response.display_name.toLowerCase();

  if (["city", "town", "suburb", "borough", "administrative"].includes(category) || ["city", "metropolis", "municipality"].includes(type)) {
    return 0.95;
  }

  if (["village", "hamlet", "locality"].includes(type) || placeName.includes("village")) {
    return 0.62;
  }

  if (["peak", "mountain", "forest", "desert", "beach", "island", "natural"].includes(category)) {
    return 0.22;
  }

  if (["county", "state", "region"].includes(type)) {
    return 0.4;
  }

  return 0.3;
}

function getLatitudeModifier(latitude: number) {
  const distanceFromEquator = Math.min(1, Math.abs(latitude) / 90);
  return 0.16 * (1 - distanceFromEquator);
}

function getLongitudeModifier(longitude: number) {
  const normalized = Math.abs(longitude % 60) / 60;
  return normalized * 0.06;
}

function deriveNormalizedScore(latitude: number, longitude: number, response: NominatimReverseResponse) {
  const settlementWeight = getSettlementWeight(response);
  const baseScore = settlementWeight * 100;
  const geographicModifier = getLatitudeModifier(latitude) * 100 + getLongitudeModifier(longitude) * 100;

  return clampScore(baseScore + geographicModifier);
}

async function fetchReverseContext(latitude: number, longitude: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      "User-Agent": "Zenith/1.0 (+https://github.com)",
    },
  });

  if (!response.ok) {
    throw new Error(`Reverse geocoding failed with status ${response.status}`);
  }

  return (await response.json()) as NominatimReverseResponse;
}

async function fetchLightPollution(latitude: number, longitude: number): Promise<LightPollutionData> {
  const context = await fetchReverseContext(latitude, longitude);
  const normalizedScore = deriveNormalizedScore(latitude, longitude, context);
  const bortleClass = getBortleClassFromScore(normalizedScore);

  return {
    latitude,
    longitude,
    locationName: context.name?.trim() || context.display_name.split(",")[0]?.trim() || "Selected location",
    bortleClass,
    lightPollutionLevel: getLightPollutionLevelLabel(bortleClass),
    skyQualityRating: getSkyQualityRating(bortleClass),
    normalizedScore,
    stargazingRecommendation: getStargazingRecommendation(bortleClass),
    description: getBortleDescription(bortleClass),
    sourceLabel: getSourceLabel(context),
  };
}

const cachedLightPollution = unstable_cache(
  async (latitude: number, longitude: number) => fetchLightPollution(latitude, longitude),
  ["zenith-light-pollution"],
  { revalidate: 60 * 60 * 24 },
);

export async function getLightPollutionForLocation(latitude: number, longitude: number) {
  const roundedLatitude = Number(latitude.toFixed(2));
  const roundedLongitude = Number(longitude.toFixed(2));

  return cachedLightPollution(roundedLatitude, roundedLongitude);
}