"use client";

export default function DashboardError({ error, reset }: Readonly<{ error: Error & { digest?: string }; reset: () => void }>) {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-[2rem] border border-rose-500/20 bg-rose-500/10 p-8 text-center text-white" role="alert">
        <p className="text-sm font-semibold uppercase tracking-[0.35em] text-rose-200/80">Dashboard failed</p>
        <h1 className="mt-3 text-2xl font-semibold">We could not load your dashboard data.</h1>
        <p className="mt-3 text-sm leading-7 text-white/75">{error.message}</p>
        <button type="button" onClick={reset} className="mt-6 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950">
          Try again
        </button>
      </section>
    </main>
  );
}