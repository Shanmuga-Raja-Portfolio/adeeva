export const ROOM_TAGS = [
  "cosy",
  "calm",
  "bright",
  "playful",
  "modern",
  "classic",
  "natural",
  "bold",
] as const;
export type RoomTag = (typeof ROOM_TAGS)[number];

export const NEUTRAL_TAG: RoomTag = "classic";
