import { NextResponse } from "next/server";
import { getZenithScoreForLocation } from "@/lib/zenith-score/zenith-score-service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const latitude = Number(searchParams.get("lat"));
  const longitude = Number(searchParams.get("lng"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ message: "Latitude and longitude are required." }, { status: 400 });
  }

  try {
    const zenithScore = await getZenithScoreForLocation(latitude, longitude);
    return NextResponse.json({ zenithScore });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load Zenith Score.";
    return NextResponse.json({ message }, { status: 500 });
  }
}