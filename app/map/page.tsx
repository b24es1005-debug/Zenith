import type { Metadata } from "next";
import { MapPageClient } from "@/components/map/MapPageClient";

export const metadata: Metadata = {
  title: "Map",
  description: "Search for dark-sky locations, review weather, light pollution, and Zenith Score intelligence on the map.",
  openGraph: {
    title: "Zenith Map",
    description: "Explore and save stargazing locations with live weather and sky-quality intelligence.",
  },
};

export default function MapPage() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.18),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#030712_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Interactive stargazing map</p>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Discover and save dark-sky locations</h1>
            <p className="max-w-2xl text-sm leading-7 text-white/60">
              Search places by name, drop a pin anywhere on Earth, or use your current location to start building your astronomy map.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/60">
            Search, click, drag, then save the location to your profile.
          </div>
        </div>

        <div className="min-h-[34rem] flex-1">
          <MapPageClient />
        </div>
      </section>
    </main>
  );
}