import { FAIR_THEME_IDS, FAIR_THEMES, type FairThemeId } from "../content/fairTheme";
import type { RosetteId } from "../content/rosette";
import { SEASON_IDS } from "../content/season";
import type { FairState } from "./fairState";
import { rosetteRank } from "./fairPrize";

export const SILVER: RosetteId = "silver";
export const GOLD: RosetteId = "gold";

export function atLeast(rosette: RosetteId | undefined, floor: RosetteId): boolean {
  return rosette !== undefined && rosetteRank(rosette) >= rosetteRank(floor);
}

export function hangRosette(
  rail: Readonly<Partial<Record<FairThemeId, RosetteId>>>,
  themeId: FairThemeId,
  rosette: RosetteId,
): Partial<Record<FairThemeId, RosetteId>> {
  return atLeast(rail[themeId], rosette) ? { ...rail } : { ...rail, [themeId]: rosette };
}

export function railFinished(fair: FairState): boolean {
  const everySeason = SEASON_IDS.every((season) =>
    FAIR_THEMES.some((theme) => theme.season === season && atLeast(fair.rosetteRail[theme.id], SILVER)),
  );
  const anyGold = Object.values(fair.rosettesBySet).some((rosette) => atLeast(rosette, GOLD));
  return everySeason && anyGold;
}

export function everyHookGold(fair: FairState): boolean {
  return FAIR_THEME_IDS.every((themeId) => atLeast(fair.rosetteRail[themeId], GOLD));
}
