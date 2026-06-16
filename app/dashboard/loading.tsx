export default function DashboardLoading() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <div className="h-36 animate-pulse rounded-[2rem] bg-white/5" role="status" aria-live="polite" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-32 animate-pulse rounded-3xl bg-white/5" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-[2rem] bg-white/5" />
    </main>
  );
}