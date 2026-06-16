"use client";

import { useEffect, useRef, useState } from "react";
import { ScoreBadge } from "@/components/zenith-score/ScoreBadge";
import { ScoreBreakdown } from "@/components/zenith-score/ScoreBreakdown";
import type { ZenithScoreResult } from "@/lib/zenith-score/zenith-score-types";

type SelectedLocation = {
  latitude: number;
  longitude: number;
  displayName: string;
  name: string;
  source: string;
};

type ZenithScoreCardProps = {
  location: SelectedLocation | null;
};

type ZenithScoreState =
  | { status: "idle"; zenithScore: null; message: string | null }
  | { status: "loading"; zenithScore: null; message: string | null }
  | { status: "success"; zenithScore: ZenithScoreResult; message: string | null }
  | { status: "error"; zenithScore: null; message: string };

const initialState: ZenithScoreState = {
  status: "idle",
  zenithScore: null,
  message: null,
};

function ZenithScoreSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-6 w-52 animate-pulse rounded-full bg-white/8" />
      <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-20 animate-pulse rounded-2xl bg-white/5" />
        ))}
      </div>
    </div>
  );
}

export function ZenithScoreCard({ location }: ZenithScoreCardProps) {
  const [state, setState] = useState<ZenithScoreState>(initialState);
  const requestIdRef = useRef(0);

  useEffect(() => {
    const latitude = location?.latitude;
    const longitude = location?.longitude;

    const timeoutId = window.setTimeout(() => {
      const requestId = ++requestIdRef.current;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        setState({
          status: "idle",
          zenithScore: null,
          message: "Zenith Score will appear here after a location is selected.",
        });
        return;
      }

      const controller = new AbortController();
      setState({ status: "loading", zenithScore: null, message: null });

      fetch(`/api/zenith-score?lat=${latitude}&lng=${longitude}`, { signal: controller.signal })
        .then(async (response) => {
          if (!response.ok) {
            const payload = (await response.json().catch(() => ({}))) as { message?: string };
            throw new Error(payload.message ?? "Zenith Score service is temporarily unavailable.");
          }

          return (await response.json()) as { zenithScore: ZenithScoreResult };
        })
        .then((payload) => {
          if (requestId !== requestIdRef.current) {
            return;
          }

          setState({ status: "success", zenithScore: payload.zenithScore, message: null });
        })
        .catch((error) => {
          if (controller.signal.aborted || requestId !== requestIdRef.current) {
            return;
          }

          setState({
            status: "error",
            zenithScore: null,
            message: error instanceof Error ? error.message : "Unable to load Zenith Score.",
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
            <h2 className="text-lg font-semibold text-white">Zenith Score</h2>
            <p className="mt-1 text-sm leading-6 text-white/55">Astronomy suitability for {location?.name ?? "the selected location"}.</p>
          </div>
          {state.status === "success" && state.zenithScore ? <ScoreBadge score={state.zenithScore.score} category={state.zenithScore.category} /> : null}
        </div>

        {state.status === "idle" ? (
          <p className="rounded-2xl border border-dashed border-white/8 bg-white/5 p-4 text-sm leading-6 text-white/55" role="status" aria-live="polite">
            {state.message}
          </p>
        ) : null}

        {state.status === "loading" ? <ZenithScoreSkeleton /> : null}

        {state.status === "error" ? (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm leading-6 text-rose-100" role="alert">
            {state.message}
          </div>
        ) : null}

        {state.status === "success" && state.zenithScore ? (
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/8 bg-white/5 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Rating category</p>
                  <p className="mt-1 text-xl font-semibold text-white">{state.zenithScore.category}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-[0.24em] text-white/40">Score</p>
                  <p className="mt-1 text-3xl font-semibold text-white">{state.zenithScore.score}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/75">{state.zenithScore.recommendation}</p>
            </div>

            <ScoreBreakdown breakdown={state.zenithScore.breakdown} />
          </div>
        ) : null}
      </div>
    </div>
  );
}