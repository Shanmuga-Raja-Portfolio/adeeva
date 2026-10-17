export const LOFT_SEASON_IDS = ["spring", "summer", "autumn", "winter"] as const;
export type LoftSeasonId = (typeof LOFT_SEASON_IDS)[number];

export const SEASON_DAYS = 14;

export interface LoftSeasonDef {
  readonly id: LoftSeasonId;
  readonly name: string;
  readonly dusk: string;
}

export const LOFT_SEASONS: readonly LoftSeasonDef[] = [
  { id: "spring", name: "Spring", dusk: "#3d3a6b" },
  { id: "summer", name: "Summer", dusk: "#2c3f72" },
  { id: "autumn", name: "Autumn", dusk: "#4a2f55" },
  { id: "winter", name: "Winter", dusk: "#22284f" },
];
