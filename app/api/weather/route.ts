import { NextResponse } from "next/server";
import { getWeatherForLocation } from "@/lib/weather/weather-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ message: "Latitude and longitude are required." }, { status: 400 });
  }

  try {
    const weather = await getWeatherForLocation(latitude, longitude);
    return NextResponse.json({ weather });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load weather data.";
    return NextResponse.json({ message }, { status: 500 });
  }
}