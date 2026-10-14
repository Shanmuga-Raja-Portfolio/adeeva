import { CUISINE_IDS, type CuisineId } from "./cuisine";
import type { PathId } from "./path";

export const CLEAN_PASS_STREAK = 5;
export const COMMUNITY_ORDERS = 3;
export const RIBBONS_FOR_FAVOURITE = 3;

export const PATH_AWARD_IDS = [
  "warmest-kitchen",
  "best-new-table",
  "community-table",
  "festival-favourite",
  "golden-page",
  "clean-pass",
] as const;
export type PathAwardId = (typeof PATH_AWARD_IDS)[number];

export type AwardId = `mentor-pin-${CuisineId}` | PathAwardId | "larkspur-ladle";

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
  {
    id: "warmest-kitchen",
    name: "Warmest Kitchen",
    rule: "A two-week season averaging 85 or more, with all three critics giving 4 spoons or more.",
    cuisine: null,
  },
  {
    id: "best-new-table",
    name: "Best New Table",
    rule: "A two-week season with money left over and less than a tenth of the ingredients unserved.",
    cuisine: null,
  },
  {
    id: "community-table",
    name: "Community Table",
    rule: `Finish ${COMMUNITY_ORDERS} community orders after your path begins.`,
    cuisine: null,
  },
  {
    id: "festival-favourite",
    name: "Festival Favourite",
    rule: `Win the ribbon at ${RIBBONS_FOR_FAVOURITE} different festivals.`,
    cuisine: null,
  },
  {
    id: "golden-page",
    name: "Golden Page",
    rule: "Launch your cookbook at the Larkspur Library.",
    cuisine: null,
  },
  {
    id: "larkspur-ladle",
    name: "Larkspur Ladle",
    rule: "Hold all three awards of your path. The Hall gives you a big brass ladle for the wall.",
    cuisine: null,
  },
];

export const AWARD_IDS: readonly AwardId[] = AWARDS.map((award) => award.id);

export const PATH_AWARDS: Readonly<Record<PathId, readonly [PathAwardId, PathAwardId, PathAwardId]>> = {
  restaurant: ["warmest-kitchen", "best-new-table", "community-table"],
  truck: ["festival-favourite", "community-table", "clean-pass"],
  tv: ["golden-page", "community-table", "clean-pass"],
};
