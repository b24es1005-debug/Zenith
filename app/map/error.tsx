"use client";

export default function MapError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),linear-gradient(180deg,_#020617_0%,_#020617_45%,_#030712_100%)] px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full max-w-xl rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center text-white shadow-2xl shadow-black/30" role="alert">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/80">Map failed</p>
        <h1 className="mt-3 text-2xl font-semibold">We could not load the stargazing map.</h1>
        <p className="mt-3 text-sm leading-7 text-white/70">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
        >
          Try again
        </button>
      </section>
    </main>
  );
}