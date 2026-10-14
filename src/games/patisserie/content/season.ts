import type { StyleTag } from "../../../engine/styleTag";

export const SEASON_IDS = ["spring", "summer", "autumn", "winter"] as const;
export type SeasonId = (typeof SEASON_IDS)[number];

export interface SeasonDef {
  readonly id: SeasonId;
  readonly name: string;
  readonly menuTags: readonly StyleTag[];
}

export const SEASONS: readonly SeasonDef[] = [
  { id: "spring", name: "Spring", menuTags: ["romantic", "dreamy"] },
  { id: "summer", name: "Summer", menuTags: ["playful", "casual"] },
  { id: "autumn", name: "Autumn", menuTags: ["classic", "bold"] },
  { id: "winter", name: "Winter", menuTags: ["elegant", "regal"] },
];

export const SEASON_DAYS = 14;
