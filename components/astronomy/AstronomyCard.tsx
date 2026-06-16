"use client";

import { useEffect, useRef, useState } from "react";
import { MoonPhaseCard } from "@/components/astronomy/MoonPhaseCard";
import type { AstronomyData } from "@/lib/astronomy/astronomy-types";

type SelectedLocation = {
  latitude: number;
  longitude: number;
  displayName: string;
  name: string;
  source: string;
};

type AstronomyCardProps = {
  location: SelectedLocation | null;
};

type AstronomyState =
  | { status: "idle"; astronomy: null; message: string | null }
  | { status: "loading"; astronomy: null; message: string | null }
  | { status: "success"; astronomy: AstronomyData; message: string | null }
  | { status: "error"; astronomy: null; message: string };

const initialState: AstronomyState = {
  status: "idle",
  astronomy: null,
  message: null,
};

function AstronomySkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-44 animate-pulse rounded-full bg-white/8" />
      <div className="h-32 animate-pulse rounded-3xl bg-white/5" />
      <div className="h-56 animate-pulse rounded-3xl bg-white/5" />
    </div>
  );
}

function EventTimeline({ astronomy }: { astronomy: AstronomyData }) {
  if (astronomy.upcomingEvents.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/55">
        No upcoming astronomical events are currently seeded.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {astronomy.upcomingEvents.map((event) => (
        <div key={event.id} className="rounded-2xl border border-white/8 bg-white/5 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-sm font-semibold text-white">{event.title}</h4>
              <p className="mt-1 text-xs leading-5 text-white/55">{event.description ?? "No description available."}</p>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.24em] text-cyan-100">
              {event.eventType.replaceAll("_", " ")}
            </span>
          </div>

          <div className="mt-3 text-xs text-white/45">Starts {new Date(event.startDate).toISOString().slice(0, 16).replace("T", " ")} UTC</div>

          {event.visibilityInfo ? (
            <p className="mt-2 text-xs leading-5 text-white/50">Visibility: {JSON.stringify(event.visibilityInfo)}</p>
          ) : null}
        </div>
      ))}
    </div>
  );
}

export function AstronomyCard({ location }: AstronomyCardProps) {
  const [state, setState] = useState<AstronomyState>(initialState);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;

    const timeoutId = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        setState({
          status: "idle",
          astronomy: null,
          message: "Astronomy details will appear here after a location is selected.",
        });
        return;
      }

      const controller = new AbortController();
      setState({ status: "loading", astronomy: null, message: null });

      fetch(`/api/astronomy?lat=${latitude}&lng=${longitude}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { message?: string };
            throw new Error(payload.message ?? "Astronomy service is temporarily unavailable.");
          }

          return (await response.json()) as { astronomy: AstronomyData };
        })
        .then((payload) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setState({ status: "success", astronomy: payload.astronomy, message: null });
        })
        .catch((error) => {
          if (controller.signal.aborted || requestId !== requestIdRef.current) {
            return;
          }

          setState({
            status: "error",
            astronomy: null,
            message: error instanceof Error ? error.message : "Unable to load astronomy data.",
          });
        });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [location?.latitude, location?.longitude]);

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5" aria-busy={state.status === "loading"}>
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Astronomy intelligence</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">Moon phase, solar times, and upcoming astronomical events for {location?.name ?? "the selected location"}.</p>
          </div>
        </div>

        {state.status === "idle" ? (
          <p className="rounded-2xl border border-dashed border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/55" role="status" aria-live="polite">
            {state.message}
          </p>
        ) : null}

        {state.status === "loading" ? <AstronomySkeleton /> : null}

        {state.status === "error" ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100" role="alert">
            {state.message}
          </div>
        ) : null}

        {state.status === "success" && state.astronomy ? (
          <div className="space-y-4">
            <MoonPhaseCard
              moonPhaseName={state.astronomy.moonPhase.name}
              moonIlluminationPct={state.astronomy.moonPhase.illuminationPct}
              moonrise={state.astronomy.moonrise.label}
              moonset={state.astronomy.moonset.label}
              sunrise={state.astronomy.sunrise.label}
              sunset={state.astronomy.sunset.label}
            />

            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Upcoming events</p>
                  <p className="mt-1 text-sm text-white/60">Timeline from the astronomy database</p>
                </div>
                <span className="text-xs text-white/45">{state.astronomy.upcomingEvents.length} events</span>
              </div>

              <div className="mt-4 space-y-3">
                <EventTimeline astronomy={state.astronomy} />
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
