export const SEASON_IDS = ["spring", "summer", "autumn", "winter"] as const;
export type SeasonId = (typeof SEASON_IDS)[number];

export const SEASON_DAYS = 14;

export interface SeasonDef {
  readonly id: SeasonId;
  readonly name: string;
  readonly sky: string;
}

export const SEASONS: readonly SeasonDef[] = [
  { id: "spring", name: "Spring", sky: "#cfe7f2" },
  { id: "summer", name: "Summer", sky: "#bfe0f7" },
  { id: "autumn", name: "Autumn", sky: "#f2d9b8" },
  { id: "winter", name: "Winter", sky: "#dfe6ef" },
];
