import type { Metadata } from "next";
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
  const meetup = await getMeetupById(id);
  const session = await auth();

  if (!meetup) {
    notFound();
  }

  const isHost = session?.user?.id === meetup.hostUserId;
  const isJoined = session?.user ? meetup.attendees.some((attendee) => attendee.userId === session.user?.id) : false;

  if (!session?.user) {
    redirect(`/login?callbackUrl=/meetups/${id}`);
  }

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
