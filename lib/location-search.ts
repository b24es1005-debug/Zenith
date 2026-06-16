import "server-only";

import { unstable_cache } from "next/cache";
import { getNominatimHeaders } from "@/lib/nominatim";

export type LocationSearchResult = {
  name: string;
  displayName: string;
  address: string | null;
  latitude: number;
  longitude: number;
};

type NominatimSearchItem = {
  display_name: string;
  lat: string;
  lon: string;
  name?: string;
  address?: {
    house_number?: string;
    road?: string;
    neighbourhood?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    state?: string;
    country?: string;
  };
};

function buildAddress(address?: NominatimSearchItem["address"]) {
  if (!address) {
    return null;
  }

  const parts = [
    address.house_number,
    address.road,
    address.neighbourhood,
    address.suburb,
    address.city ?? address.town ?? address.village,
    address.county,
    address.state,
    address.country,
  ].filter(Boolean);

  return parts.length > 0 ? parts.join(", ") : null;
}

function toLocationResult(item: NominatimSearchItem): LocationSearchResult {
  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  const name = item.name?.trim() || item.display_name.split(",")[0]?.trim() || "Selected location";

  return {
    name,
    displayName: item.display_name,
    address: buildAddress(item.address),
    latitude,
    longitude,
  };
}

async function fetchLocations(query: string): Promise<LocationSearchResult[]> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 2) {
    return [];
  }

  if (trimmedQuery.length > 120) {
    throw new Error("Location search query is too long.");
  }

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", trimmedQuery);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "8");

  const response = await fetch(url, {
    headers: getNominatimHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Location search failed with status ${response.status}`);
  }

  const data = (await response.json()) as NominatimSearchItem[];
  return data.map(toLocationResult);
}

const cachedSearchLocations = unstable_cache(async (query: string) => fetchLocations(query), ["zenith-nominatim-search"], { revalidate: 300 });

export async function searchLocations(query: string): Promise<LocationSearchResult[]> {
  return cachedSearchLocations(query.trim().toLowerCase());
}