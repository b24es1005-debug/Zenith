-- Rename Meetup columns to match the current Prisma model.
ALTER TABLE "Meetup" RENAME COLUMN "hostId" TO "hostUserId";
ALTER TABLE "Meetup" RENAME COLUMN "scheduledAt" TO "dateTime";
ALTER TABLE "Meetup" RENAME COLUMN "capacity" TO "maxParticipants";

-- Preserve existing meetup records by backfilling from the linked Location rows.
ALTER TABLE "Meetup"
ADD COLUMN "latitude" DOUBLE PRECISION,
ADD COLUMN "longitude" DOUBLE PRECISION,
ADD COLUMN "locationName" TEXT;

UPDATE "Meetup" AS meetup
SET
	"latitude" = location."latitude",
	"longitude" = location."longitude",
	"locationName" = location."name"
FROM "Location" AS location
WHERE location."id" = meetup."locationId";

-- Safety fallback for any historical row that does not have a linked Location.
UPDATE "Meetup"
SET
	"latitude" = COALESCE("latitude", 0),
	"longitude" = COALESCE("longitude", 0),
	"locationName" = COALESCE("locationName", 'Unknown location')
WHERE "latitude" IS NULL OR "longitude" IS NULL OR "locationName" IS NULL;

ALTER TABLE "Meetup"
ALTER COLUMN "latitude" SET NOT NULL,
ALTER COLUMN "longitude" SET NOT NULL,
ALTER COLUMN "locationName" SET NOT NULL;

CREATE INDEX "Meetup_dateTime_idx" ON "Meetup"("dateTime");
CREATE INDEX "Meetup_hostUserId_idx" ON "Meetup"("hostUserId");