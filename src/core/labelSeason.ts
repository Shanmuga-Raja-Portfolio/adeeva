import type { ShowThemeDef } from "../content/showTheme";
import { themeById } from "./catalog";
import type { FinishedLook } from "./finishedLook";
import type { RunwayChoice, RunwayResult } from "./runwayScore";

export const LOOKS_PER_SEASON = 3;
export const SEASON_LENGTH_DAYS = 14;
export const VENUE_STAGES = ["", " Main Hall", " Grand Stage"] as const;

export interface LabelSeason {
  readonly number: number;
  readonly themeId: string;
  readonly venue: string;
  readonly startDay: number;
  readonly deadlineDay: number;
  readonly looks: readonly (FinishedLook | null)[];
  readonly runway: RunwayChoice | null;
  readonly result: RunwayResult | null;
}

export function venueName(theme: ShowThemeDef, seasonNumber: number): string {
  const stage = VENUE_STAGES[Math.min(seasonNumber, VENUE_STAGES.length) - 1] ?? "";
  return `${theme.venue}${stage}`;
}

export function createSeason(seasonNumber: number, theme: ShowThemeDef, day: number): LabelSeason {
  return {
    number: seasonNumber,
    themeId: theme.id,
    venue: venueName(theme, seasonNumber),
    startDay: day,
    deadlineDay: day + SEASON_LENGTH_DAYS - 1,
    looks: Array.from({ length: LOOKS_PER_SEASON }, () => null),
    runway: null,
    result: null,
  };
}

export function seasonTheme(season: LabelSeason): ShowThemeDef {
  const theme = themeById(season.themeId);
  if (theme === undefined) throw new Error(`Missing show theme in catalog: ${season.themeId}`);
  return theme;
}

export function finishedLooks(season: LabelSeason): FinishedLook[] {
  return season.looks.filter((look): look is FinishedLook => look !== null);
}
