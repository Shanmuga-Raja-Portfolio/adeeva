export const TOUR_TIME_IDS = ["morning", "afternoon", "evening"] as const;
export type TourTimeId = (typeof TOUR_TIME_IDS)[number];

export interface TourTimeDef {
  readonly id: TourTimeId;
  readonly name: string;
  readonly word: string;
  readonly sky: string;
  readonly glow: string;
}

export const TOUR_TIMES: readonly TourTimeDef[] = [
  { id: "morning", name: "Morning", word: "fresh", sky: "#bfe6f7", glow: "#fff6d6" },
  { id: "afternoon", name: "Afternoon", word: "golden", sky: "#f6c86a", glow: "#ffe39c" },
  { id: "evening", name: "Evening", word: "cosy", sky: "#5b4a8a", glow: "#ffc98a" },
];
