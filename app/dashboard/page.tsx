import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { DashboardStats } from "@/lib/dashboard/dashboard-service";
import { getDashboardStats } from "@/lib/dashboard/dashboard-service";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your saved locations, meetup activity, and astronomy stats in one place.",
  openGraph: {
    title: "Zenith Dashboard",
    description: "Review saved locations, meetup activity, and the current astronomy summary.",
  },
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard");
  }

  const stats: DashboardStats = await getDashboardStats(session.user.id);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Protected route</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
          Welcome, {session.user.name ?? session.user.email}. Your session is loaded from Auth.js with Prisma-backed
          database sessions.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {[
          ["Saved locations", stats.savedLocationsCount, "favorites stored for quick revisits"],
          ["Meetups hosted", stats.meetupsHosted, "sessions organized by you"],
          ["Meetups joined", stats.meetupsJoined, "events you RSVP'd to"],
          ["Average Zenith score", stats.averageZenithScore ?? "—", "your saved sky quality average"],
          ["Upcoming events", stats.upcomingEventsCount, "astronomy events on the horizon"],
        ].map(([title, value, description]) => (
          <div key={String(title)} className="rounded-3xl border border-white/10 bg-slate-950/70 p-6">
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">{title}</p>
            <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
            <p className="mt-2 text-sm leading-6 text-white/55">{description}</p>
          </div>
        ))}
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Saved places</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Your favorite locations</h2>
          </div>
          <Link href="/map" className="text-sm text-cyan-200 transition hover:text-cyan-100">Open map</Link>
        </div>

        {stats.savedLocations.length > 0 ? (
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {stats.savedLocations.map((location) => (
              <div key={location.id} className="rounded-3xl border border-white/10 bg-white/5 p-6">
                <p className="text-lg font-semibold text-white">{location.name}</p>
                <p className="mt-2 text-sm text-white/55">
                  {location.zenithScore !== null ? `Zenith Score ${location.zenithScore}` : "No Zenith Score yet"}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.24em] text-white/40">{location.lightPollutionLevel ?? "Unknown sky quality"}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm leading-7 text-white/60">
            No saved locations yet. Open the map, search a dark-sky site, and save a location to start building your personal astronomy shortlist.
          </div>
        )}
      </section>
    </main>
  );
}