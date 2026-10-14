import { FAIR_THEMES, FAIR_THEME_IDS, type FairThemeId } from "../content/fairTheme";
import { SEASON_IDS } from "../content/season";
import type { RibbonId } from "../content/ribbon";
import type { FairState } from "./fairState";
import { ribbonRank } from "./fairPrize";

export const SILVER: RibbonId = "silver";
export const GOLD: RibbonId = "gold";

export function hangRibbon(
  wall: Readonly<Partial<Record<FairThemeId, RibbonId>>>,
  themeId: FairThemeId,
  ribbon: RibbonId,
): Partial<Record<FairThemeId, RibbonId>> {
  const current = wall[themeId];
  return current !== undefined && ribbonRank(current) >= ribbonRank(ribbon)
    ? { ...wall }
    : { ...wall, [themeId]: ribbon };
}

function atLeast(ribbon: RibbonId | undefined, floor: RibbonId): boolean {
  return ribbon !== undefined && ribbonRank(ribbon) >= ribbonRank(floor);
}

export function wallFinished(fair: FairState): boolean {
  const everySeason = SEASON_IDS.every((season) =>
    FAIR_THEMES.some((theme) => theme.season === season && atLeast(fair.ribbonWall[theme.id], SILVER)),
  );
  const anyGold = Object.values(fair.ribbonsByRun).some((ribbon) => atLeast(ribbon, GOLD));
  return everySeason && anyGold;
}

export function everyHookGold(fair: FairState): boolean {
  return FAIR_THEME_IDS.every((themeId) => atLeast(fair.ribbonWall[themeId], GOLD));
}
