"use client";

import { useActionState } from "react";
import { saveMeetupAction } from "@/app/actions/meetups";

type MeetupFormProps = {
  initialValues?: {
    meetupId?: string;
    title?: string;
    description?: string;
    dateTime?: string;
    maxParticipants?: number | null;
    latitude?: number;
    longitude?: number;
    locationName?: string;
  };
};

const initialState = { status: "idle" as const, message: null as string | null };

export function MeetupForm({ initialValues }: MeetupFormProps) {
  const [state, formAction, isPending] = useActionState(saveMeetupAction, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
      {initialValues?.meetupId ? <input type="hidden" name="meetupId" value={initialValues.meetupId} /> : null}
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-white/70">Title</span>
          <input name="title" defaultValue={initialValues?.title ?? ""} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/70">Date and time</span>
          <input type="datetime-local" name="dateTime" defaultValue={initialValues?.dateTime ?? ""} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        </label>
      </div>

      <label className="space-y-2 block">
        <span className="text-sm text-white/70">Description</span>
        <textarea name="description" defaultValue={initialValues?.description ?? ""} rows={4} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-white/70">Maximum participants</span>
          <input type="number" name="maxParticipants" min={1} defaultValue={initialValues?.maxParticipants ?? ""} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/70">Location name</span>
          <input name="locationName" defaultValue={initialValues?.locationName ?? ""} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm text-white/70">Latitude</span>
          <input type="number" step="any" name="latitude" defaultValue={initialValues?.latitude ?? ""} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        </label>
        <label className="space-y-2">
          <span className="text-sm text-white/70">Longitude</span>
          <input type="number" step="any" name="longitude" defaultValue={initialValues?.longitude ?? ""} className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" />
        </label>
      </div>

      <button type="submit" disabled={isPending} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100 disabled:opacity-60">
        {isPending ? "Saving..." : initialValues?.meetupId ? "Update meetup" : "Create meetup"}
      </button>

      {state.message ? <p className={`text-sm ${state.status === "success" ? "text-emerald-200" : "text-rose-200"}`}>{state.message}</p> : null}
    </form>
  );
}
