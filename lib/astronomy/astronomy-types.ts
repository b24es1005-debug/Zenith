import type { EventType } from "@prisma/client";

export type AstronomyMoonPhase = {
  name: string;
  illuminationPct: number;
};

export type AstronomyEvent = {
  id: string;
  title: string;
  description: string | null;
  eventType: EventType;
  startDate: string;
  endDate: string | null;
  visibilityInfo: Record<string, unknown> | null;
};

export type AstronomyTimeValue = {
  iso: string | null;
  label: string;
};

export type AstronomyData = {
  locationName: string;
  latitude: number;
  longitude: number;
  moonPhase: AstronomyMoonPhase;
  moonrise: AstronomyTimeValue;
  moonset: AstronomyTimeValue;
  sunrise: AstronomyTimeValue;
  sunset: AstronomyTimeValue;
  upcomingEvents: AstronomyEvent[];
  generatedAt: string;
};
