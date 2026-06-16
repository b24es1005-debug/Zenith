import "server-only";

import { unstable_cache } from "next/cache";
import { calculateZenithScore } from "@/lib/zenith-score/score-calculator";
import type { ZenithScoreResult } from "@/lib/zenith-score/zenith-score-types";
import { getWeatherForLocation } from "@/lib/weather/weather-service";
import { getLightPollutionForLocation } from "@/lib/light-pollution/light-pollution-service";

type ZenithScoreOptions = {
  weather?: Awaited<ReturnType<typeof getWeatherForLocation>>;
  lightPollution?: Awaited<ReturnType<typeof getLightPollutionForLocation>>;
};

async function fetchZenithScore(latitude: number, longitude: number, options?: ZenithScoreOptions): Promise<ZenithScoreResult> {
  const [weather, lightPollution] = await Promise.all([
    options?.weather ?? getWeatherForLocation(latitude, longitude),
    options?.lightPollution ?? getLightPollutionForLocation(latitude, longitude),
  ]);

  return calculateZenithScore({
    weather,
    lightPollution: {
      bortleClass: lightPollution.bortleClass,
      normalizedScore: lightPollution.normalizedScore,
      lightPollutionLevel: lightPollution.lightPollutionLevel,
      skyQualityRating: lightPollution.skyQualityRating,
    },
  });
}

const cachedZenithScore = unstable_cache(
  async (latitude: number, longitude: number) => fetchZenithScore(latitude, longitude),
  ["zenith-score"],
  { revalidate: 600 },
);

export async function getZenithScoreForLocation(latitude: number, longitude: number, options?: ZenithScoreOptions) {
  const roundedLatitude = Number(latitude.toFixed(2));
  const roundedLongitude = Number(longitude.toFixed(2));

  if (options?.weather || options?.lightPollution) {
    return fetchZenithScore(roundedLatitude, roundedLongitude, options);
  }

  return cachedZenithScore(roundedLatitude, roundedLongitude);
}