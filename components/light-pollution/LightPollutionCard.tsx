"use client";

import { useEffect, useRef, useState } from "react";
import { BortleBadge } from "@/components/light-pollution/BortleBadge";
import type { LightPollutionData } from "@/lib/light-pollution/light-pollution-types";

type SelectedLocation = {
  latitude: number;
  longitude: number;
  displayName: string;
  name: string;
  source: string;
};

type LightPollutionCardProps = {
  location: SelectedLocation | null;
};

type LightPollutionState =
  | { status: "idle"; lightPollution: null; message: string | null }
  | { status: "loading"; lightPollution: null; message: string | null }
  | { status: "success"; lightPollution: LightPollutionData; message: string | null }
  | { status: "error"; lightPollution: null; message: string };

const initialState: LightPollutionState = {
  status: "idle",
  lightPollution: null,
  message: null,
};

function LightPollutionSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-44 animate-pulse rounded-full bg-white/8" />
      <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
      </div>
      <div className="h-16 animate-pulse rounded-2xl bg-white/5" />
    </div>
  );
}

function getRecommendationTone(bortleClass: number) {
  if (bortleClass <= 2) return "excellent" as const;
  if (bortleClass <= 4) return "good" as const;
  if (bortleClass <= 6) return "fair" as const;
  return "poor" as const;
}

export function LightPollutionCard({ location }: LightPollutionCardProps) {
  const [state, setState] = useState<LightPollutionState>(initialState);
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
          lightPollution: null,
          message: "Light pollution will appear here after a location is selected.",
        });
        return;
      }

      const requestController = new AbortController();
      controller = requestController;
      setState({ status: "loading", lightPollution: null, message: null });

      fetch(`/api/light-pollution?lat=${latitude}&lng=${longitude}`, { signal: requestController.signal })
        .then(async (response) => {
          if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { message?: string };
            throw new Error(payload.message ?? "Light pollution service is temporarily unavailable.");
          }

          return (await response.json()) as { lightPollution: LightPollutionData };
        })
        .then((payload) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setState({ status: "success", lightPollution: payload.lightPollution, message: null });
        })
        .catch((error) => {
          if (requestController.signal.aborted || requestId !== requestIdRef.current) {
            return;
          }

          setState({
            status: "error",
            lightPollution: null,
            message: error instanceof Error ? error.message : "Unable to load light pollution data.",
          });
        });
    }, 0);

    return () => {
      controller?.abort();
      window.clearTimeout(timeoutId);
    };
  }, [location?.latitude, location?.longitude]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Light pollution intelligence</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">Estimated sky brightness for {location?.name ?? "the selected location"}.</p>
          </div>
          {state.status === "success" && state.lightPollution ? (
            <BortleBadge bortleClass={state.lightPollution.bortleClass} label={state.lightPollution.lightPollutionLevel} />
          ) : null}
        </div>

        {state.status === "idle" ? (
          <p className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/55">{state.message}</p>
        ) : null}

        {state.status === "loading" ? <LightPollutionSkeleton /> : null}

        {state.status === "error" ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100">{state.message}</div>
        ) : null}

        {state.status === "success" && state.lightPollution ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-white/40">Human-readable description</p>
              <p className="mt-1 text-sm font-medium text-white">{state.lightPollution.description}</p>
              <p className="mt-2 text-xs leading-6 text-white/50">Source context: {state.lightPollution.sourceLabel}</p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-[0.24em] text-white/40">Bortle Class</dt>
                <dd className="mt-1 text-sm font-medium text-white">{state.lightPollution.bortleClass}</dd>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
                <dt className="text-xs uppercase tracking-[0.24em] text-white/40">Sky Quality Score</dt>
                <dd className="mt-1 text-sm font-medium text-white">{state.lightPollution.normalizedScore}/100</dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Stargazing recommendation</p>
                <span className="text-xs text-white/45">{state.lightPollution.skyQualityRating}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-white/75">{state.lightPollution.stargazingRecommendation}</p>
            </div>

            <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">Stargazing quality rating</span>
                <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${getRecommendationTone(state.lightPollution.bortleClass) === "excellent" ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-100" : getRecommendationTone(state.lightPollution.bortleClass) === "good" ? "border-cyan-300/20 bg-cyan-300/10 text-cyan-100" : getRecommendationTone(state.lightPollution.bortleClass) === "fair" ? "border-amber-300/20 bg-amber-300/10 text-amber-100" : "border-rose-300/20 bg-rose-300/10 text-rose-100"}`}>
                  {state.lightPollution.skyQualityRating}
                </span>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}