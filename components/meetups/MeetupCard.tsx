import Link from "next/link";
import type { MeetupSummary } from "@/lib/meetups/meetup-types";

type MeetupCardProps = {
  meetup: MeetupSummary;
};

export function MeetupCard({ meetup }: MeetupCardProps) {
  return (
    <Link href={`/meetups/${meetup.id}`} className="block rounded-3xl border border-white/10 bg-slate-950/70 p-6 transition hover:border-cyan-300/30 hover:bg-slate-950/90">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{meetup.title}</h3>
          <p className="mt-2 text-sm leading-6 text-white/55 line-clamp-2">{meetup.description ?? "No description provided."}</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/65">{meetup.participantCount}/{meetup.maxParticipants ?? "∞"}</span>
      </div>

      <div className="mt-4 grid gap-3 text-sm text-white/65 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">When</p>
          <p className="mt-1">{new Date(meetup.dateTime).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Location</p>
          <p className="mt-1">{meetup.location.locationName}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-white/40">Host</p>
          <p className="mt-1">{meetup.host.name ?? meetup.host.email}</p>
        </div>
      </div>
    </Link>
  );
}
