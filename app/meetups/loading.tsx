export default function MeetupsLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-40 animate-pulse rounded-[2rem] bg-white/5" role="status" aria-live="polite" />
      <div className="h-20 animate-pulse rounded-[2rem] bg-white/5" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="h-44 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
      <div className="flex items-center justify-between rounded-[2rem] border border-white/10 bg-white/5 px-5 py-4">
        <div className="h-4 w-28 animate-pulse rounded-full bg-white/10" />
        <div className="flex gap-3">
          <div className="h-11 w-24 animate-pulse rounded-2xl bg-white/10" />
          <div className="h-11 w-24 animate-pulse rounded-2xl bg-white/10" />
        </div>
      </div>
    </main>
  );
}
