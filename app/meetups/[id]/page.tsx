import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetupDetails } from "@/components/meetups/MeetupDetails";
import { deleteMeetupAction, joinMeetupAction, leaveMeetupAction } from "@/app/actions/meetups";
import { getMeetupById } from "@/lib/meetups/meetup-service";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const meetup = await getMeetupById(id);

  if (!meetup) {
    return {
      title: "Meetup not found",
      description: "The requested meetup could not be found.",
    };
  }

  return {
    title: meetup.title,
    description: meetup.description ?? `Join the meetup at ${meetup.location.locationName} on ${new Date(meetup.dateTime).toLocaleString()}.`,
    openGraph: {
      title: meetup.title,
      description: meetup.description ?? `Join the meetup at ${meetup.location.locationName}.`,
    },
  };
}

export default async function MeetupDetailPage({ params }: PageProps) {
  const { id } = await params;
  let meetup = null;
  let session = null;
  let loadFailed = false;

  try {
    [meetup, session] = await Promise.all([getMeetupById(id), auth()]);
  } catch {
    loadFailed = true;
  }

  if (loadFailed) {
    return (
      <main className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <section className="w-full max-w-2xl rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center text-white" role="alert">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/80">Meetup unavailable</p>
          <h1 className="mt-3 text-2xl font-semibold">We could not load this meetup.</h1>
          <p className="mt-3 text-sm leading-7 text-white/75">The meetup may have been deleted, or the database request failed. Please return to the meetup list and try again.</p>
          <Link href="/meetups" className="mt-6 inline-flex rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
            Back to meetups
          </Link>
        </section>
      </main>
    );
  }

  if (!meetup) {
    notFound();
  }

  if (!session?.user) {
    redirect(`/login?callbackUrl=/meetups/${id}`);
  }

  const isHost = session.user.id === meetup.hostUserId;
  const isJoined = meetup.attendees.some((attendee) => attendee.userId === session.user?.id);

  async function joinWrapper(formData: FormData) {
    "use server";
    await joinMeetupAction(formData);
  }

  async function leaveWrapper(formData: FormData) {
    "use server";
    await leaveMeetupAction(formData);
  }

  async function deleteWrapper(formData: FormData) {
    "use server";
    await deleteMeetupAction(formData);
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <MeetupDetails meetup={meetup} isHost={isHost} isJoined={isJoined} joinAction={joinWrapper} leaveAction={leaveWrapper} deleteAction={deleteWrapper} />
    </main>
  );
}
