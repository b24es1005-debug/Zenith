import type { Metadata } from "next";
import Link from "next/link";
import { auth } from "@/auth";
import { MeetupBrowseControls } from "@/components/meetups/MeetupBrowseControls";
import { MeetupCard } from "@/components/meetups/MeetupCard";
import { getPaginatedMeetups, type MeetupSortOption, type MeetupStatusFilter } from "@/lib/meetups/meetup-service";

export const metadata: Metadata = {
  title: "Meetups",
  description: "Browse astronomy meetups, filter by status, and organize your next stargazing session.",
  openGraph: {
    title: "Zenith Meetups",
    description: "Browse and join astronomy meetups with pagination and filter controls.",
  },
};

type SearchParams = Promise<{
  page?: string | string[];
  sort?: string | string[];
  status?: string | string[];
}> | {
  page?: string | string[];
  sort?: string | string[];
  status?: string | string[];
};

type PageProps = {
  searchParams?: SearchParams;
};

const pageSize = 6;

function readQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeStatus(value: string | undefined): MeetupStatusFilter {
  if (value === "all" || value === "past" || value === "upcoming") {
    return value;
  }

  return "upcoming";
}

function normalizeSort(value: string | undefined): MeetupSortOption {
  if (value === "newest" || value === "popular" || value === "soonest") {
    return value;
  }

  return "soonest";
}

function buildMeetupHref(pageNumber: number, status: MeetupStatusFilter, sort: MeetupSortOption) {
  const params = new URLSearchParams();

  params.set("page", String(pageNumber));
  params.set("status", status);
  params.set("sort", sort);

  return `/meetups?${params.toString()}`;
}

export default async function MeetupsPage({ searchParams }: PageProps) {
  const session = await auth();
  const resolvedSearchParams = await Promise.resolve(searchParams);
  const page = Math.max(1, Number.parseInt(readQueryValue(resolvedSearchParams?.page) ?? "1", 10) || 1);
  const status = normalizeStatus(readQueryValue(resolvedSearchParams?.status));
  const sort = normalizeSort(readQueryValue(resolvedSearchParams?.sort));
  const meetupPage = await getPaginatedMeetups({ page, pageSize, status, sort });
  const pageLabel = `${meetupPage.page} / ${meetupPage.totalPages}`;

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-black/30 backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyan-200/70">Community meetups</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white">Organize and join stargazing sessions</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">
              Coordinate observation nights, share coordinates, and meet other astronomy enthusiasts under the sky.
            </p>
          </div>
          <Link href="/meetups/create" className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100">
            Create meetup
          </Link>
        </div>
      </section>

      <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-white/40">Browse controls</p>
            <p className="mt-2 text-sm text-white/60">
              Showing {meetupPage.totalMeetups} meetup{meetupPage.totalMeetups === 1 ? "" : "s"} across {meetupPage.totalPages} page{meetupPage.totalPages === 1 ? "" : "s"}.
            </p>
          </div>

          <MeetupBrowseControls status={status} sort={sort} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {meetupPage.meetups.length > 0 ? (
          meetupPage.meetups.map((meetup) => <MeetupCard key={meetup.id} meetup={meetup} />)
        ) : (
          <div className="col-span-full rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-8 text-sm leading-7 text-white/60">
            No meetups found for the selected status and sort order. Try switching to a different filter, or create the first event for your community.
          </div>
        )}
      </section>

      <section className="flex flex-col items-center justify-between gap-4 rounded-[2rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:flex-row">
        <p className="text-sm text-white/60" aria-live="polite">
          Page {pageLabel}
        </p>

        <div className="flex items-center gap-3">
          <Link
            href={buildMeetupHref(meetupPage.hasPreviousPage ? meetupPage.page - 1 : 1, status, sort)}
            aria-disabled={!meetupPage.hasPreviousPage}
            tabIndex={meetupPage.hasPreviousPage ? 0 : -1}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${meetupPage.hasPreviousPage ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "pointer-events-none border-white/5 bg-white/5 text-white/30"}`}
          >
            Previous
          </Link>
          <Link
            href={buildMeetupHref(meetupPage.hasNextPage ? meetupPage.page + 1 : meetupPage.totalPages, status, sort)}
            aria-disabled={!meetupPage.hasNextPage}
            tabIndex={meetupPage.hasNextPage ? 0 : -1}
            className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${meetupPage.hasNextPage ? "border-white/10 bg-white/5 text-white hover:bg-white/10" : "pointer-events-none border-white/5 bg-white/5 text-white/30"}`}
          >
            Next
          </Link>
        </div>
      </section>

      {!session?.user ? (
        <p className="text-sm text-white/55">Sign in to create, join, and manage meetups.</p>
      ) : null}
    </main>
  );
}
