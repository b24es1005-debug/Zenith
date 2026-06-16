"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type MeetupState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

const initialState: MeetupState = { status: "idle", message: null };

function parseString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function parseNumber(value: FormDataEntryValue | null) {
  return typeof value === "string" ? Number(value) : Number.NaN;
}

function getMeetupId(formData: FormData) {
  return parseString(formData.get("meetupId"));
}

export async function saveMeetupAction(_previousState: MeetupState = initialState, formData: FormData): Promise<MeetupState> {
  void _previousState;

  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Sign in to manage meetups." };
  }

  const title = parseString(formData.get("title"));
  const description = parseString(formData.get("description")) || null;
  const dateTime = new Date(parseString(formData.get("dateTime")));
  const maxParticipantsValue = parseNumber(formData.get("maxParticipants"));
  const latitude = parseNumber(formData.get("latitude"));
  const longitude = parseNumber(formData.get("longitude"));
  const locationName = parseString(formData.get("locationName"));
  const meetupId = getMeetupId(formData);

  if (!title || !locationName || !Number.isFinite(latitude) || !Number.isFinite(longitude) || Number.isNaN(dateTime.getTime())) {
    return { status: "error", message: "Complete all required fields." };
  }

  if (dateTime.getTime() < Date.now()) {
    return { status: "error", message: "Meetup date must be in the future." };
  }

  const maxParticipants = Number.isFinite(maxParticipantsValue) && maxParticipantsValue > 0 ? Math.floor(maxParticipantsValue) : null;
  const roundedLatitude = Number(latitude.toFixed(6));
  const roundedLongitude = Number(longitude.toFixed(6));

  if (meetupId) {
    const existing = await prisma.meetup.findUnique({ where: { id: meetupId } });
    if (!existing) {
      return { status: "error", message: "Meetup not found." };
    }

    if (existing.hostUserId !== session.user.id) {
      return { status: "error", message: "Only the host can edit this meetup." };
    }

    await prisma.meetup.update({
      where: { id: meetupId },
      data: { title, description, dateTime, maxParticipants, latitude: roundedLatitude, longitude: roundedLongitude, locationName },
    });
  } else {
    await prisma.meetup.create({
      data: { title, description, dateTime, maxParticipants, latitude: roundedLatitude, longitude: roundedLongitude, locationName, hostUserId: session.user.id },
    });
  }

  revalidatePath("/meetups");
  revalidatePath("/dashboard");
  revalidatePath("/map");

  return { status: "success", message: meetupId ? "Meetup updated." : "Meetup created." };
}

export async function deleteMeetupAction(formData: FormData): Promise<MeetupState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Sign in to manage meetups." };
  }

  const meetupId = getMeetupId(formData);
  if (!meetupId) {
    return { status: "error", message: "Meetup not found." };
  }

  const meetup = await prisma.meetup.findUnique({ where: { id: meetupId } });
  if (!meetup) {
    return { status: "error", message: "Meetup not found." };
  }

  if (meetup.hostUserId !== session.user.id) {
    return { status: "error", message: "Only the host can delete this meetup." };
  }

  await prisma.meetupParticipant.deleteMany({ where: { meetupId } });
  await prisma.meetup.delete({ where: { id: meetupId } });

  revalidatePath("/meetups");
  revalidatePath("/dashboard");
  return { status: "success", message: "Meetup deleted." };
}

export async function joinMeetupAction(formData: FormData): Promise<MeetupState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Sign in to join meetups." };
  }

  const meetupId = getMeetupId(formData);
  if (!meetupId) {
    return { status: "error", message: "Meetup not found." };
  }

  const meetup = await prisma.meetup.findUnique({ where: { id: meetupId }, include: { participants: true } });
  if (!meetup) {
    return { status: "error", message: "Meetup not found." };
  }

  if (meetup.dateTime.getTime() < Date.now()) {
    return { status: "error", message: "Cannot join a meetup in the past." };
  }

  if (meetup.hostUserId === session.user.id) {
    return { status: "error", message: "Hosts are already part of their meetup." };
  }

  if (meetup.maxParticipants !== null && meetup.participants.length >= meetup.maxParticipants) {
    return { status: "error", message: "This meetup is full." };
  }

  const existingParticipant = await prisma.meetupParticipant.findUnique({
    where: { meetupId_userId: { meetupId, userId: session.user.id } },
  });

  if (existingParticipant) {
    return { status: "error", message: "You have already joined this meetup." };
  }

  await prisma.meetupParticipant.create({ data: { meetupId, userId: session.user.id } });
  revalidatePath(`/meetups/${meetupId}`);
  revalidatePath("/meetups");
  revalidatePath("/dashboard");
  return { status: "success", message: "You joined the meetup." };
}

export async function leaveMeetupAction(formData: FormData): Promise<MeetupState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { status: "error", message: "Sign in to leave meetups." };
  }

  const meetupId = getMeetupId(formData);
  if (!meetupId) {
    return { status: "error", message: "Meetup not found." };
  }

  await prisma.meetupParticipant.deleteMany({ where: { meetupId, userId: session.user.id } });
  revalidatePath(`/meetups/${meetupId}`);
  revalidatePath("/meetups");
  revalidatePath("/dashboard");
  return { status: "success", message: "You left the meetup." };
}