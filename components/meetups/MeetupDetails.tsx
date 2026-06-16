import type { MeetupDetails as MeetupDetailsType } from "@/lib/meetups/meetup-types";
import { MeetupParticipants } from "@/components/meetups/MeetupParticipants";
import { MeetupMapPreview } from "@/components/meetups/MeetupMapPreview";

type MeetupDetailsProps = {
  meetup: MeetupDetailsType;
  isHost: boolean;
  isJoined: boolean;
  joinAction: (formData: FormData) => void | Promise<void>;
  leaveAction: (formData: FormData) => void | Promise<void>;
  deleteAction: (formData: FormData) => void | Promise<void>;
};

export function MeetupDetails({ meetup, isHost, isJoined, joinAction, leaveAction, deleteAction }: MeetupDetailsProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Meetup details</p>
          <h1 className="mt-3 text-3xl font-semibold text-white">{meetup.title}</h1>
          <p className="mt-3 text-sm leading-7 text-white/65">{meetup.description ?? "No description provided."}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Date and time</p>
            <p className="mt-1 text-sm text-white">{new Date(meetup.dateTime).toLocaleString()}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Location</p>
            <p className="mt-1 text-sm text-white">{meetup.location.locationName}</p>
          </div>
          <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Attendees</p>
            <p className="mt-1 text-sm text-white">{meetup.participantCount}/{meetup.maxParticipants ?? "∞"}</p>
          </div>
        </div>

        <form action={joinAction}>
          <input type="hidden" name="meetupId" value={meetup.id} />
          <button type="submit" disabled={isJoined || isHost || meetup.isFull || meetup.isPast} className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60">
            {isJoined ? "Already joined" : meetup.isPast ? "Meetup passed" : meetup.isFull ? "Meetup full" : "Join meetup"}
          </button>
        </form>

        {isJoined && !isHost ? (
          <form action={leaveAction}>
            <input type="hidden" name="meetupId" value={meetup.id} />
            <button type="submit" className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">Leave meetup</button>
          </form>
        ) : null}

        {isHost ? (
          <div className="flex flex-wrap gap-3">
            <a href={`/meetups/create?edit=${meetup.id}`} className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100">Edit meetup</a>
            <form action={deleteAction}>
              <input type="hidden" name="meetupId" value={meetup.id} />
              <button type="submit" className="rounded-2xl border border-rose-300/20 bg-rose-300/10 px-5 py-3 text-sm font-semibold text-rose-100">Delete meetup</button>
            </form>
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <h2 className="mb-4 text-lg font-semibold text-white">Meetup location preview</h2>
          <MeetupMapPreview latitude={meetup.location.latitude} longitude={meetup.location.longitude} title={meetup.location.locationName} />
        </div>

        <MeetupParticipants participants={meetup.attendees} />
      </div>
    </div>
  );
}
