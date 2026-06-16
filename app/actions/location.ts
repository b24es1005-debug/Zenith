"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getZenithScoreForLocation } from "@/lib/zenith-score/zenith-score-service";

export type SaveLocationState = {
  status: "idle" | "success" | "error";
  message: string | null;
  locationId: string | null;
};

const initialState: SaveLocationState = {
  status: "idle",
  message: null,
  locationId: null,
};

function parseNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return Number.NaN;
  }

  return Number(value);
}

function parseString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}

export async function saveLocationAction(
  _previousState: SaveLocationState = initialState,
  formData: FormData,
): Promise<SaveLocationState> {
  void _previousState;

  const session = await auth();

  if (!session?.user?.id) {
    return {
      status: "error",
      message: "Sign in to save locations.",
      locationId: null,
    };
  }

  const name = parseString(formData.get("name")) || "Selected stargazing location";
  const address = parseString(formData.get("address"));
  const latitude = parseNumber(formData.get("latitude"));
  const longitude = parseNumber(formData.get("longitude"));
  const description = parseString(formData.get("description")) || null;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return {
      status: "error",
      message: "Latitude and longitude are required.",
      locationId: null,
    };
  }

  const roundedLatitude = Number(latitude.toFixed(6));
  const roundedLongitude = Number(longitude.toFixed(6));
  const zenithScore = await getZenithScoreForLocation(roundedLatitude, roundedLongitude);

  const existingLocation = await prisma.location.findFirst({
    where: {
      createdById: session.user.id,
      latitude: roundedLatitude,
      longitude: roundedLongitude,
    },
  });

  const savedLocation = existingLocation
    ? await prisma.location.update({
        where: { id: existingLocation.id },
        data: {
          name,
          address: address || null,
          description,
          latitude: roundedLatitude,
          longitude: roundedLongitude,
          lightPollutionScore: zenithScore.lightPollution.normalizedScore,
          bortleClass: zenithScore.lightPollution.bortleClass,
          lightPollutionLevel: zenithScore.lightPollution.lightPollutionLevel,
          skyQualityRating: zenithScore.lightPollution.skyQualityRating,
          zenithScore: zenithScore.score,
          zenithCategory: zenithScore.category,
          zenithRecommendation: zenithScore.recommendation,
        },
      })
    : await prisma.location.create({
        data: {
          name,
          address: address || null,
          description,
          latitude: roundedLatitude,
          longitude: roundedLongitude,
          createdById: session.user.id,
          lightPollutionScore: zenithScore.lightPollution.normalizedScore,
          bortleClass: zenithScore.lightPollution.bortleClass,
          lightPollutionLevel: zenithScore.lightPollution.lightPollutionLevel,
          skyQualityRating: zenithScore.lightPollution.skyQualityRating,
          zenithScore: zenithScore.score,
          zenithCategory: zenithScore.category,
          zenithRecommendation: zenithScore.recommendation,
        },
      });

  revalidatePath("/map");
  revalidatePath("/dashboard");

  return {
    status: "success",
    message: `${savedLocation.name} saved to your locations.`,
    locationId: savedLocation.id,
  };
}