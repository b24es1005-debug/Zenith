export default function MapLoading() {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#030712_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-4">
        <div className="h-10 w-2/3 animate-pulse rounded-2xl bg-white/5" />
        <div className="h-5 w-full max-w-2xl animate-pulse rounded-2xl bg-white/5" />
        <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex min-h-[28rem] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-sm text-white/60 sm:min-h-[34rem]">
            Loading interactive map...
          </div>
          <div className="space-y-4">
            <div className="h-32 animate-pulse rounded-[2rem] bg-white/5" />
            <div className="h-32 animate-pulse rounded-[2rem] bg-white/5" />
            <div className="h-32 animate-pulse rounded-[2rem] bg-white/5" />
          </div>
        </div>
      </section>
    </main>
  );
}