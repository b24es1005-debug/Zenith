import Link from "next/link";
import type { Metadata } from "next";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Astronomy planning platform",
  description: "Find stargazing locations, compare sky conditions, and organize astronomy meetups with Zenith.",
  openGraph: {
    title: "Zenith",
    description: "Find dark-sky locations, check weather and light pollution, and coordinate observation nights.",
  },
};

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-16">
      <section className="w-full max-w-5xl rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/4 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-12">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-100">
              Zenith
            </p>
            <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Plan dark-sky sessions, meetups, and celestial events.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-white/65">
              Find stargazing locations, check light pollution and cloud cover, and coordinate observation nights in
              one astronomy-first workspace.
            </p>

            <div className="flex flex-wrap gap-3">
              <Link
                href={session?.user ? "/dashboard" : "/login"}
                className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
              >
                {session?.user ? "Open dashboard" : "Sign in"}
              </Link>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explore dashboard
              </Link>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6">
            <div className="space-y-4">
              {[
                ["Google login", "Authenticate with your Google account."],
                ["GitHub login", "Use GitHub for quick access and profile sync."],
                ["Protected dashboard", "Dashboard access stays behind auth middleware."],
              ].map(([title, description]) => (
                <div key={title} className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <h2 className="font-semibold text-white">{title}</h2>
                  <p className="mt-1 text-sm leading-6 text-white/55">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
