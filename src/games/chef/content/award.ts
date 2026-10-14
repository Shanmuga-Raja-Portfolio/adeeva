import { CUISINE_IDS, type CuisineId } from "./cuisine";

export const CLEAN_PASS_STREAK = 5;

export type AwardId = `mentor-pin-${CuisineId}` | "clean-pass";

export interface AwardDef {
  readonly id: AwardId;
  readonly name: string;
  readonly rule: string;
  readonly cuisine: CuisineId | null;
}

export const AWARDS: readonly AwardDef[] = [
  ...CUISINE_IDS.map((cuisine): AwardDef => ({
    id: `mentor-pin-${cuisine}`,
    name: "Mentor's Pin",
    rule: "Reach Expert in this cuisine. Your mentor pins it on your apron.",
    cuisine,
  })),
  {
    id: "clean-pass",
    name: "Clean Pass Award",
    rule: `${CLEAN_PASS_STREAK} services in a row with every dish you cooked at 4 stars or more.`,
    cuisine: null,
  },
];

export const AWARD_IDS: readonly AwardId[] = AWARDS.map((award) => award.id);
