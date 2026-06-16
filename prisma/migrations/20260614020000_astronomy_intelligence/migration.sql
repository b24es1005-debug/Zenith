-- AlterTable
ALTER TABLE "AstronomicalEvent" RENAME COLUMN "startAt" TO "startDate";
ALTER TABLE "AstronomicalEvent" RENAME COLUMN "endAt" TO "endDate";
ALTER TABLE "AstronomicalEvent" RENAME COLUMN "visibilityRegions" TO "visibilityInfo";

-- AlterEnum
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'LUNAR_ECLIPSE';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'SOLAR_ECLIPSE';
ALTER TYPE "EventType" ADD VALUE IF NOT EXISTS 'PLANETARY_CONJUNCTION';