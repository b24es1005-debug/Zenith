import "server-only";

import { prisma } from "@/lib/prisma";

export type DashboardSavedLocation = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zenithScore: number | null;
  lightPollutionLevel: string | null;
};

export type DashboardStats = {
  savedLocationsCount: number;
  meetupsHosted: number;
  meetupsJoined: number;
  averageZenithScore: number | null;
  upcomingEventsCount: number;
  savedLocations: DashboardSavedLocation[];
};

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  const [savedLocationsCount, meetupsHosted, meetupsJoined, averageZenithScoreResult, upcomingEventsCount, savedLocations] =
    await Promise.all([
      prisma.favoriteLocation.count({ where: { userId } }),
      prisma.meetup.count({ where: { hostUserId: userId } }),
      prisma.meetupParticipant.count({ where: { userId } }),
      prisma.location.aggregate({
        where: { favorites: { some: { userId } } },
        _avg: { zenithScore: true },
      }),
      prisma.astronomicalEvent.count({
        where: {
          startDate: {
            gte: new Date(),
          },
        },
      }),
      prisma.favoriteLocation.findMany({
        where: { userId },
        include: {
          location: {
            select: {
              id: true,
              name: true,
              latitude: true,
              longitude: true,
              zenithScore: true,
              lightPollutionLevel: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
    ]);

  return {
    savedLocationsCount,
    meetupsHosted,
    meetupsJoined,
    averageZenithScore: averageZenithScoreResult._avg.zenithScore ?? null,
    upcomingEventsCount,
    savedLocations: savedLocations.map((favoriteLocation) => favoriteLocation.location),
  };
}