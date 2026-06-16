import { NextResponse } from "next/server";
import { reverseGeocodeLocation } from "@/lib/reverse-geocoding";
import { assertNominatimRateLimit, getClientIdentifier, NominatimRateLimitError } from "@/lib/nominatim";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ message: "Latitude and longitude are required." }, { status: 400 });
  }

  try {
    assertNominatimRateLimit("reverse", getClientIdentifier(request));
    const location = await reverseGeocodeLocation(latitude, longitude);
    return NextResponse.json({ location });
  } catch (error) {
    if (error instanceof NominatimRateLimitError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Unable to reverse geocode location.";
    return NextResponse.json({ message }, { status: 500 });
  }
}