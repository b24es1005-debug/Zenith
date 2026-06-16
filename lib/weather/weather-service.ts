import "server-only";

import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import type { OpenWeatherCurrentResponse, WeatherCloudCoverLabel, WeatherData } from "@/lib/weather/weather-types";

export function classifyCloudCover(cloudCoverPct: number): WeatherCloudCoverLabel {
  if (cloudCoverPct <= 10) {
    return "Excellent";
  }

  if (cloudCoverPct <= 25) {
    return "Good";
  }

  if (cloudCoverPct <= 50) {
    return "Fair";
  }

  return "Poor";
}

export function isSkyLikelyClear(cloudCoverPct: number) {
  return cloudCoverPct <= 25;
}

function formatWeatherPayload(payload: OpenWeatherCurrentResponse, latitude: number, longitude: number): WeatherData {
  const current = payload.current;
  const condition = current.weather[0] ?? {
    main: "Unknown",
    description: "No weather conditions available",
    icon: "01n",
  };

  return {
    latitude,
    longitude,
    locationName: payload.timezone,
    temperatureC: current.temp,
    cloudCoverPct: current.clouds,
    visibilityKm: typeof current.visibility === "number" ? Number((current.visibility / 1000).toFixed(1)) : null,
    humidityPct: current.humidity,
    windSpeedMps: current.wind_speed,
    weatherCondition: {
      main: condition.main,
      description: condition.description,
      icon: condition.icon,
    },
    sunrise: current.sunrise,
    sunset: current.sunset,
    timezoneOffsetSeconds: payload.timezone_offset,
    cloudCoverLabel: classifyCloudCover(current.clouds),
    skyLikelyClear: isSkyLikelyClear(current.clouds),
  };
}

async function fetchOpenWeather(latitude: number, longitude: number): Promise<WeatherData> {
  const apiKey = env.OPENWEATHER_API_KEY;

  const url = new URL("https://api.openweathermap.org/data/3.0/onecall");
  url.searchParams.set("lat", latitude.toString());
  url.searchParams.set("lon", longitude.toString());
  url.searchParams.set("appid", apiKey);
  url.searchParams.set("units", "metric");
  url.searchParams.set("exclude", "minutely,hourly,daily,alerts");

  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`OpenWeather request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OpenWeatherCurrentResponse;
  return formatWeatherPayload(payload, latitude, longitude);
}

const getCachedWeather = unstable_cache(
  async (latitude: number, longitude: number) => fetchOpenWeather(latitude, longitude),
  ["zenith-weather"],
  { revalidate: 600 },
);

export async function getWeatherForLocation(latitude: number, longitude: number): Promise<WeatherData> {
  const roundedLatitude = Number(latitude.toFixed(2));
  const roundedLongitude = Number(longitude.toFixed(2));

  return getCachedWeather(roundedLatitude, roundedLongitude);
}

export function formatWeatherTime(epochSeconds: number, timezoneOffsetSeconds: number) {
  const date = new Date((epochSeconds + timezoneOffsetSeconds) * 1000);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}