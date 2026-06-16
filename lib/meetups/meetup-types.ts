export type MeetupLocation = {
  latitude: number;
  longitude: number;
  locationName: string;
};

export type MeetupParticipantSummary = {
  userId: string;
  joinedAt: string;
  name: string | null;
  email: string | null;
};

export type MeetupSummary = {
  id: string;
  title: string;
  description: string | null;
  dateTime: string;
  maxParticipants: number | null;
  hostUserId: string;
  createdAt: string;
  updatedAt: string;
  participantCount: number;
  isFull: boolean;
  isPast: boolean;
  location: MeetupLocation;
  host: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

export type MeetupDetails = MeetupSummary & {
  attendees: MeetupParticipantSummary[];
};
