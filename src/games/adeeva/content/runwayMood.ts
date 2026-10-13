export const RUNWAY_MOODS = [
  { id: "dreamy-strings", name: "Dreamy Strings" },
  { id: "beach-pop", name: "Beach Pop" },
  { id: "synth-pulse", name: "Synth Pulse" },
  { id: "classic-jazz", name: "Classic Jazz" },
] as const;
export type RunwayMoodId = (typeof RUNWAY_MOODS)[number]["id"];
