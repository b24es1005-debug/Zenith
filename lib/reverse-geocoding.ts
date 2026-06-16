import "server-only";

import { unstable_cache } from "next/cache";
import { getNominatimHeaders } from "@/lib/nominatim";
import type { LocationSearchResult } from "@/lib/location-search";

type NominatimReverseResponse = {
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

function buildAddress(address?: NominatimReverseResponse["address"]) {
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

async function fetchReverseGeocodeLocation(latitude: number, longitude: number): Promise<LocationSearchResult | null> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("zoom", "18");

  const response = await fetch(url, {
    headers: getNominatimHeaders(),
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimReverseResponse;

  if (!data.display_name) {
    return null;
  }

  return {
    name: data.name?.trim() || data.display_name.split(",")[0]?.trim() || "Selected location",
    displayName: data.display_name,
    address: buildAddress(data.address),
    latitude: Number(data.lat),
    longitude: Number(data.lon),
  };
}

const cachedReverseGeocodeLocation = unstable_cache(
  async (latitude: number, longitude: number) => fetchReverseGeocodeLocation(latitude, longitude),
  ["zenith-nominatim-reverse"],
  { revalidate: 60 * 60 * 24 },
);

export async function reverseGeocodeLocation(latitude: number, longitude: number): Promise<LocationSearchResult | null> {
  return cachedReverseGeocodeLocation(Number(latitude.toFixed(4)), Number(longitude.toFixed(4)));
}