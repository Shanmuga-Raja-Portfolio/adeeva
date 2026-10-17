import { AWARDS, AWARD_IDS, type AwardId } from "../content/launchAward";
import { LAUNCH_THEMES, type LaunchThemeId } from "../content/launchTheme";
import { LOFT_SEASON_IDS } from "../content/loftSeason";
import type { Garland } from "./launchState";

function rank(award: AwardId | null): number {
  return award === null ? -1 : AWARD_IDS.indexOf(award);
}

export function awardFor(overall: number): AwardId {
  return [...AWARDS].reverse().find((award) => overall >= award.from)?.id ?? "lantern-ribbon";
}

export function atLeast(award: AwardId | null, floor: AwardId): boolean {
  return rank(award) >= rank(floor);
}

export function betterAward(current: AwardId | null, next: AwardId): AwardId {
  return current === null || rank(next) > rank(current) ? next : current;
}

export function hangLantern(garland: Garland, themeId: LaunchThemeId, award: AwardId): Garland {
  return { ...garland, [themeId]: betterAward(garland[themeId], award) };
}

export function garlandGlows(garland: Garland): boolean {
  const everySeason = LOFT_SEASON_IDS.every((season) =>
    LAUNCH_THEMES.some((theme) => theme.season === season && atLeast(garland[theme.id], "silver-lantern")),
  );
  const gold = LAUNCH_THEMES.some((theme) => atLeast(garland[theme.id], "gold-lantern"));
  return everySeason && gold;
}

export function everyLanternGold(garland: Garland): boolean {
  return LAUNCH_THEMES.every((theme) => atLeast(garland[theme.id], "gold-lantern"));
}
