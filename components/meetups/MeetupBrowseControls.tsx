"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { MeetupSortOption, MeetupStatusFilter } from "@/lib/meetups/meetup-service";

type MeetupBrowseControlsProps = {
  status: MeetupStatusFilter;
  sort: MeetupSortOption;
};

export function MeetupBrowseControls({ status, sort }: MeetupBrowseControlsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const updateUrl = (nextValues: Partial<MeetupBrowseControlsProps>) => {
    const params = new URLSearchParams(searchParams.toString());

    params.set("page", "1");
    params.set("status", nextValues.status ?? status);
    params.set("sort", nextValues.sort ?? sort);

    router.push(`/meetups?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <label className="flex items-center gap-3 text-sm text-white/70">
        <span>Status</span>
        <select
          value={status}
          onChange={(event) => updateUrl({ status: event.target.value as MeetupStatusFilter })}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          aria-label="Filter meetups by status"
        >
          <option value="upcoming">Upcoming</option>
          <option value="all">All</option>
          <option value="past">Past</option>
        </select>
      </label>

      <label className="flex items-center gap-3 text-sm text-white/70">
        <span>Sort</span>
        <select
          value={sort}
          onChange={(event) => updateUrl({ sort: event.target.value as MeetupSortOption })}
          className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-cyan-300/50 focus:ring-2 focus:ring-cyan-300/20"
          aria-label="Sort meetups"
        >
          <option value="soonest">Soonest</option>
          <option value="newest">Newest</option>
          <option value="popular">Most popular</option>
        </select>
      </label>
    </div>
  );
}