import "server-only";

import * as SunCalc from "suncalc";
import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import { formatAstronomyTime, getMoonPhaseName } from "@/lib/astronomy/moon-phase";
import type { AstronomyData, AstronomyEvent } from "@/lib/astronomy/astronomy-types";

function getTimeValue(date: Date | null, fallback: string) {
  return {
    iso: formatAstronomyTime(date),
    label: date ? new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", hour12: true, timeZone: "UTC" }).format(date) : fallback,
  };
}

async function fetchUpcomingAstronomicalEvents(): Promise<AstronomyEvent[]> {
  const events = await prisma.astronomicalEvent.findMany({
    where: {
      startDate: {
        gte: new Date(),
      },
    },
    orderBy: {
      startDate: "asc",
    },
    take: 8,
  });

  return events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    eventType: event.eventType,
    startDate: event.startDate.toISOString(),
    endDate: event.endDate ? event.endDate.toISOString() : null,
    visibilityInfo: (event.visibilityInfo as Record<string, unknown> | null) ?? null,
  }));
}

function fetchAstronomyForLocation(latitude: number, longitude: number, dayKey: string): Promise<AstronomyData> {
  const date = new Date(dayKey);
  const moonIllumination = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, latitude, longitude);
  const sunTimes = SunCalc.getTimes(date, latitude, longitude);

  return fetchUpcomingAstronomicalEvents().then((upcomingEvents) => ({
    locationName: "Selected location",
    latitude,
    longitude,
    moonPhase: {
      name: getMoonPhaseName(moonIllumination.phase, moonIllumination.fraction * 100),
      illuminationPct: Math.round(moonIllumination.fraction * 100),
    },
    moonrise: getTimeValue(moonTimes.rise ?? null, "No moonrise today"),
    moonset: getTimeValue(moonTimes.set ?? null, "No moonset today"),
    sunrise: getTimeValue(sunTimes.sunrise ?? null, "No sunrise today"),
    sunset: getTimeValue(sunTimes.sunset ?? null, "No sunset today"),
    upcomingEvents,
    generatedAt: new Date().toISOString(),
  }));
}

const cachedAstronomyForLocation = unstable_cache(
  async (latitude: number, longitude: number, dayKey: string) => fetchAstronomyForLocation(latitude, longitude, dayKey),
  ["zenith-astronomy"],
  { revalidate: 600 },
);

export async function getAstronomyForLocation(latitude: number, longitude: number) {
  const roundedLatitude = Number(latitude.toFixed(2));
  const roundedLongitude = Number(longitude.toFixed(2));
  const dayKey = new Date().toISOString().slice(0, 10);

  return cachedAstronomyForLocation(roundedLatitude, roundedLongitude, dayKey);
}
