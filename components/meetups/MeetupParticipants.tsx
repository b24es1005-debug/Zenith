import type { MeetupParticipantSummary } from "@/lib/meetups/meetup-types";

type MeetupParticipantsProps = {
  participants: MeetupParticipantSummary[];
};

export function MeetupParticipants({ participants }: MeetupParticipantsProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold uppercase tracking-[0.24em] text-white/55">Attendees</h3>
      <div className="space-y-2">
        {participants.map((participant) => (
          <div key={participant.userId} className="rounded-2xl border border-white/8 bg-white/5 p-3">
            <p className="text-sm font-medium text-white">{participant.name ?? participant.email ?? "Anonymous attendee"}</p>
            <p className="mt-1 text-xs text-white/45">Joined {new Date(participant.joinedAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
