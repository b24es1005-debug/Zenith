import { NextResponse } from "next/server";
import { searchLocations } from "@/lib/location-search";
import { assertNominatimRateLimit, getClientIdentifier, NominatimRateLimitError } from "@/lib/nominatim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? "";

  try {
    assertNominatimRateLimit("search", getClientIdentifier(request));
    const results = await searchLocations(query);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof NominatimRateLimitError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Unable to search locations.";
    return NextResponse.json({ message }, { status: 500 });
  }
}