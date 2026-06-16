-- AlterTable
ALTER TABLE "Location"
ADD COLUMN     "lightPollutionScore" INTEGER,
ADD COLUMN     "bortleClass" INTEGER,
ADD COLUMN     "lightPollutionLevel" TEXT,
ADD COLUMN     "skyQualityRating" TEXT;