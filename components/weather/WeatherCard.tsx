"use client";

import { useEffect, useRef, useState } from "react";
import { WeatherDetails } from "@/components/weather/WeatherDetails";
import { WeatherBadge } from "@/components/weather/WeatherBadge";
import type { WeatherData } from "@/lib/weather/weather-types";

type SelectedLocation = {
  latitude: number;
  longitude: number;
  displayName: string;
  name: string;
  source: string;
};

type WeatherCardProps = {
  location: SelectedLocation | null;
};

type WeatherState =
  | { status: "idle"; weather: null; message: string | null }
  | { status: "loading"; weather: null; message: string | null }
  | { status: "success"; weather: WeatherData; message: string | null }
  | { status: "error"; weather: null; message: string };

const initialState: WeatherState = {
  status: "idle",
  weather: null,
  message: null,
};

function formatWeatherTime(epochSeconds: number, timezoneOffsetSeconds: number) {
  const date = new Date((epochSeconds + timezoneOffsetSeconds) * 1000);
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
  }).format(date);
}

function WeatherSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-40 animate-pulse rounded-full bg-white/8" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
      <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

export function WeatherCard({ location }: WeatherCardProps) {
  const [state, setState] = useState<WeatherState>(initialState);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;
    let controller: AbortController | null = null;
    const timeoutId = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        setState({
          status: "idle",
          weather: null,
          message: "Weather will appear here after a location is selected.",
        });
        return;
      }

      const requestController = new AbortController();
      controller = requestController;
      setState({ status: "loading", weather: null, message: null });

      fetch(`/api/weather?lat=${latitude}&lng=${longitude}`, { signal: requestController.signal })
        .then(async (response) => {
          if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { message?: string };
            throw new Error(payload.message ?? "Weather service is temporarily unavailable.");
          }

          return (await response.json()) as { weather: WeatherData };
        })
        .then((payload) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setState({ status: "success", weather: payload.weather, message: null });
        })
        .catch((error) => {
          if (requestController.signal.aborted || requestId !== requestIdRef.current) {
            return;
          }

          setState({
            status: "error",
            weather: null,
            message: error instanceof Error ? error.message : "Unable to load weather data.",
          });
        });
    }, 0);

    return () => {
      controller?.abort();
      window.clearTimeout(timeoutId);
    };
  }, [location?.latitude, location?.longitude]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5" aria-busy={state.status === "loading"}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Weather intelligence</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">
              Astronomy-friendly weather for {location?.name ?? "the selected location"}.
            </p>
          </div>
          {state.status === "success" && state.weather ? (
            <WeatherBadge
              label={state.weather.skyLikelyClear ? "Clear sky likely" : "Mixed sky"}
              tone={state.weather.skyLikelyClear ? "excellent" : state.weather.cloudCoverLabel === "Good" ? "good" : state.weather.cloudCoverLabel === "Fair" ? "fair" : "poor"}
            />
          ) : null}
        </div>

        {state.status === "idle" ? (
          <p className="rounded-2xl border border-dashed border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/55" role="status" aria-live="polite">
            {state.message}
          </p>
        ) : null}

        {state.status === "loading" ? <WeatherSkeleton /> : null}

        {state.status === "error" ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100" role="alert">
            {state.message}
          </div>
        ) : null}

        {state.status === "success" && state.weather ? (
          <WeatherDetails
            temperatureC={state.weather.temperatureC}
            cloudCoverPct={state.weather.cloudCoverPct}
            visibilityKm={state.weather.visibilityKm}
            humidityPct={state.weather.humidityPct}
            windSpeedMps={state.weather.windSpeedMps}
            sunrise={formatWeatherTime(state.weather.sunrise, state.weather.timezoneOffsetSeconds)}
            sunset={formatWeatherTime(state.weather.sunset, state.weather.timezoneOffsetSeconds)}
            conditionDescription={state.weather.weatherCondition.description}
            cloudCoverLabel={state.weather.cloudCoverLabel}
            skyLikelyClear={state.weather.skyLikelyClear}
          />
        ) : null}
      </div>
    </div>
  );
}