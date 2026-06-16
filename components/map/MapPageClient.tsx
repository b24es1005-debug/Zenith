"use client";

import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/map/MapView"), {
  ssr: false,
  loading: () => (
    <div className="relative flex min-h-[34rem] flex-1 overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 shadow-2xl shadow-black/40">
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.02)_8%,rgba(255,255,255,0.08)_18%,rgba(255,255,255,0.02)_33%)] bg-[length:200%_100%] animate-pulse" />
      <div className="relative z-10 flex w-full flex-col justify-between p-6">
        <div className="space-y-4">
          <div className="h-6 w-56 rounded-full bg-white/10" />
          <div className="h-12 w-3/4 rounded-2xl bg-white/10" />
          <div className="h-4 w-full max-w-2xl rounded-full bg-white/10" />
          <div className="h-4 w-2/3 rounded-full bg-white/10" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="h-40 rounded-3xl border border-white/10 bg-white/5" />
          <div className="space-y-4">
            <div className="h-28 rounded-3xl border border-white/10 bg-white/5" />
            <div className="h-24 rounded-3xl border border-white/10 bg-white/5" />
          </div>
        </div>
      </div>
    </div>
  ),
});

export function MapPageClient() {
  return <MapView />;
}