import "server-only";

import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { MeetupDetails, MeetupSummary } from "@/lib/meetups/meetup-types";

export type MeetupStatusFilter = "all" | "upcoming" | "past";
export type MeetupSortOption = "soonest" | "newest" | "popular";

export type MeetupPageOptions = {
  page: number;
  pageSize: number;
  status: MeetupStatusFilter;
  sort: MeetupSortOption;
};

export type MeetupPageResult = {
  meetups: MeetupSummary[];
  page: number;
  pageSize: number;
  totalMeetups: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

function mapMeetupSummary(meetup: {
  id: string;
  title: string;
  description: string | null;
  dateTime: Date;
  maxParticipants: number | null;
  hostUserId: string;
  createdAt: Date;
  updatedAt: Date;
  latitude: number;
  longitude: number;
  locationName: string;
  host: { id: string; name: string | null; email: string | null };
  participants: Array<{ userId: string }>;
}): MeetupSummary {
  const participantCount = meetup.participants.length;

  return {
    id: meetup.id,
    title: meetup.title,
    description: meetup.description,
    dateTime: meetup.dateTime.toISOString(),
    maxParticipants: meetup.maxParticipants,
    hostUserId: meetup.hostUserId,
    createdAt: meetup.createdAt.toISOString(),
    updatedAt: meetup.updatedAt.toISOString(),
    participantCount,
    isFull: meetup.maxParticipants !== null ? participantCount >= meetup.maxParticipants : false,
    isPast: meetup.dateTime.getTime() < Date.now(),
    location: {
      latitude: meetup.latitude,
      longitude: meetup.longitude,
      locationName: meetup.locationName,
    },
    host: meetup.host,
  };
}

export async function getMeetups(): Promise<MeetupSummary[]> {
  const meetups = await prisma.meetup.findMany({
    orderBy: { dateTime: "asc" },
    include: {
      host: { select: { id: true, name: true, email: true } },
      participants: { select: { userId: true } },
    },
  });

  return meetups.map(mapMeetupSummary);
}

const cachedMeetups = unstable_cache(async () => getMeetups(), ["zenith-meetups"], { revalidate: 60 });

export async function getCachedMeetups() {
  return cachedMeetups();
}

function buildMeetupWhere(status: MeetupStatusFilter) {
  if (status === "upcoming") {
    return { dateTime: { gte: new Date() } };
  }

  if (status === "past") {
    return { dateTime: { lt: new Date() } };
  }

  return {};
}

function buildMeetupOrderBy(sort: MeetupSortOption) {
  if (sort === "newest") {
    return [{ dateTime: "desc" as const }];
  }

  if (sort === "popular") {
    return [{ participants: { _count: "desc" as const } }, { dateTime: "asc" as const }];
  }

  return [{ dateTime: "asc" as const }];
}

export async function getPaginatedMeetups({ page, pageSize, status, sort }: MeetupPageOptions): Promise<MeetupPageResult> {
  const currentPage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Math.max(1, Math.min(12, Math.floor(pageSize)));
  const where = buildMeetupWhere(status);

  const [totalMeetups, meetups] = await Promise.all([
    prisma.meetup.count({ where }),
    prisma.meetup.findMany({
      where,
      orderBy: buildMeetupOrderBy(sort),
      skip: (currentPage - 1) * safePageSize,
      take: safePageSize,
      include: {
        host: { select: { id: true, name: true, email: true } },
        participants: { select: { userId: true } },
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalMeetups / safePageSize));
  const normalizedPage = Math.min(currentPage, totalPages);

  return {
    meetups: meetups.map(mapMeetupSummary),
    page: normalizedPage,
    pageSize: safePageSize,
    totalMeetups,
    totalPages,
    hasPreviousPage: normalizedPage > 1,
    hasNextPage: normalizedPage < totalPages,
  };
}

export async function getMeetupById(id: string): Promise<MeetupDetails | null> {
  const meetup = await prisma.meetup.findUnique({
    where: { id },
    include: {
      host: { select: { id: true, name: true, email: true } },
      participants: {
        include: { user: { select: { id: true, name: true, email: true } } },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!meetup) {
    return null;
  }

  const participantCount = meetup.participants.length;

  return {
    ...mapMeetupSummary({
      id: meetup.id,
      title: meetup.title,
      description: meetup.description,
      dateTime: meetup.dateTime,
      maxParticipants: meetup.maxParticipants,
      hostUserId: meetup.hostUserId,
      createdAt: meetup.createdAt,
      updatedAt: meetup.updatedAt,
      latitude: meetup.latitude,
      longitude: meetup.longitude,
      locationName: meetup.locationName,
      host: meetup.host,
      participants: meetup.participants.map((participant) => ({ userId: participant.userId })),
    }),
    participantCount,
    attendees: meetup.participants.map((participant) => ({
      userId: participant.userId,
      joinedAt: participant.joinedAt.toISOString(),
      name: participant.user.name,
      email: participant.user.email,
    })),
  };
}
