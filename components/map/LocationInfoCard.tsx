"use client";

import { useActionState } from "react";
import { saveLocationAction, type SaveLocationState } from "@/app/actions/location";

export type MapLocation = {
  name: string;
  displayName: string;
  address: string | null;
  latitude: number;
  longitude: number;
  source: string;
};

type LocationInfoCardProps = {
  location: MapLocation | null;
};

const initialState: SaveLocationState = {
  status: "idle",
  message: null,
  locationId: null,
};

export function LocationInfoCard({ location }: LocationInfoCardProps) {
  const [state, formAction, isPending] = useActionState(saveLocationAction, initialState);

  if (!location) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
        <h2 className="text-lg font-semibold text-white">Location details</h2>
        <p className="mt-2 text-sm leading-6 text-white/55">Select a point on the map or choose a result from search to save it.</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
      <div className="space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{location.name}</h2>
              <p className="mt-1 text-sm leading-6 text-white/55">{location.displayName}</p>
            </div>
            <span className="rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-100">
              {location.source}
            </span>
          </div>
        </div>

        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-[0.24em] text-white/40">Latitude</dt>
            <dd className="mt-1 text-sm font-medium text-white">{location.latitude.toFixed(6)}</dd>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
            <dt className="text-xs uppercase tracking-[0.24em] text-white/40">Longitude</dt>
            <dd className="mt-1 text-sm font-medium text-white">{location.longitude.toFixed(6)}</dd>
          </div>
        </dl>

        {location.address ? (
          <div className="rounded-2xl border border-white/8 bg-white/5 p-3">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Address</p>
            <p className="mt-1 text-sm leading-6 text-white/75">{location.address}</p>
          </div>
        ) : null}

        <form action={formAction} className="space-y-3">
          <input type="hidden" name="name" value={location.name} />
          <input type="hidden" name="address" value={location.address ?? location.displayName} />
          <input type="hidden" name="latitude" value={location.latitude.toString()} />
          <input type="hidden" name="longitude" value={location.longitude.toString()} />
          <input type="hidden" name="description" value={`Saved from Zenith map (${location.source})`} />

          <button
            type="submit"
            disabled={isPending}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Saving location..." : "Save location"}
          </button>
        </form>

        {state.message ? (
          <p className={`text-sm ${state.status === "success" ? "text-emerald-200" : "text-rose-200"}`} aria-live="polite">
            {state.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}