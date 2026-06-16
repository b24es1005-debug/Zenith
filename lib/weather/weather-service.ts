import "server-only";

import { unstable_cache } from "next/cache";
import { env } from "@/lib/env";
import type { OpenWeatherCurrentResponse, WeatherCloudCoverLabel, WeatherData } from "@/lib/weather/weather-types";

type OpenMeteoCurrentResponse = {
  latitude: number;
  longitude: number;
  timezone: string;
  current?: {
    temperature_2m?: number;
    relative_humidity_2m?: number;
    cloud_cover?: number;
    visibility?: number;
    wind_speed_10m?: number;
    weather_code?: number;
    time?: string;
  };
  daily?: {
    sunrise?: string[];
    sunset?: string[];
  };
};

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

function mapOpenMeteoWeatherCode(weatherCode: number | undefined) {
  switch (weatherCode) {
    case 0:
      return { main: "Clear", description: "Clear sky", icon: "01n" };
    case 1:
    case 2:
      return { main: "Clouds", description: "Partly cloudy", icon: "02n" };
    case 3:
      return { main: "Clouds", description: "Overcast", icon: "04n" };
    case 45:
    case 48:
      return { main: "Mist", description: "Fog or mist", icon: "50n" };
    case 51:
    case 53:
    case 55:
    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
    case 71:
    case 73:
    case 75:
    case 77:
    case 80:
    case 81:
    case 82:
    case 85:
    case 86:
      return { main: "Rain", description: "Precipitation likely", icon: "10n" };
    case 95:
    case 96:
    case 99:
      return { main: "Thunderstorm", description: "Thunderstorms possible", icon: "11n" };
    default:
      return { main: "Unknown", description: "Weather data available", icon: "01n" };
  }
}

function formatOpenMeteoPayload(payload: OpenMeteoCurrentResponse, latitude: number, longitude: number): WeatherData {
  const current = payload.current ?? {};
  const condition = mapOpenMeteoWeatherCode(current.weather_code);
  const sunrise = payload.daily?.sunrise?.[0] ? Math.floor(new Date(payload.daily.sunrise[0]).getTime() / 1000) : Math.floor(Date.now() / 1000);
  const sunset = payload.daily?.sunset?.[0] ? Math.floor(new Date(payload.daily.sunset[0]).getTime() / 1000) : Math.floor(Date.now() / 1000);

  return {
    latitude,
    longitude,
    locationName: payload.timezone,
    temperatureC: current.temperature_2m ?? 0,
    cloudCoverPct: current.cloud_cover ?? 50,
    visibilityKm: typeof current.visibility === "number" ? Number((current.visibility / 1000).toFixed(1)) : null,
    humidityPct: current.relative_humidity_2m ?? 0,
    windSpeedMps: current.wind_speed_10m ?? 0,
    weatherCondition: condition,
    sunrise,
    sunset,
    timezoneOffsetSeconds: 0,
    cloudCoverLabel: classifyCloudCover(current.cloud_cover ?? 50),
    skyLikelyClear: isSkyLikelyClear(current.cloud_cover ?? 50),
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

async function fetchOpenMeteo(latitude: number, longitude: number): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", latitude.toString());
  url.searchParams.set("longitude", longitude.toString());
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,cloud_cover,visibility,wind_speed_10m,weather_code");
  url.searchParams.set("daily", "sunrise,sunset");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Open-Meteo request failed with status ${response.status}`);
  }

  const payload = (await response.json()) as OpenMeteoCurrentResponse;
  return formatOpenMeteoPayload(payload, latitude, longitude);
}

async function fetchWeatherWithFallback(latitude: number, longitude: number): Promise<WeatherData> {
  try {
    return await fetchOpenWeather(latitude, longitude);
  } catch {
    return fetchOpenMeteo(latitude, longitude);
  }
}

const getCachedWeather = unstable_cache(
  async (latitude: number, longitude: number) => fetchWeatherWithFallback(latitude, longitude),
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