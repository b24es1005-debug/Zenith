import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetupForm } from "@/components/meetups/MeetupForm";

export const metadata: Metadata = {
  title: "Create meetup",
  description: "Create a new astronomy meetup and plan a stargazing night with your community.",
  openGraph: {
    title: "Create Meetup | Zenith",
    description: "Plan and publish a new astronomy meetup in Zenith.",
  },
};

export default async function CreateMeetupPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/meetups/create");
  }

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Create meetup</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Plan a stargazing night</h1>
      </section>
      <MeetupForm />
    </main>
  );
}
