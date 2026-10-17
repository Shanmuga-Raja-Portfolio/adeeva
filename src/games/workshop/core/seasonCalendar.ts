import { nextSeasonStart as nextStartOf, seasonDay as clockDay } from "../../../engine/seasonClock";
import { FAIR_THEMES, type FairThemeDef } from "../content/fairTheme";
import { SEASON_DAYS, type SeasonDef } from "../content/season";
import { seasonByNumber } from "./catalog";
import type { GameState } from "./gameState";
import type { ShowroomState } from "./showroomState";

export const FAIR_SEASON_DAY = 13;
export const LATE_FAIR_SEASON_DAY = 14;
export const OPEN_HOUSE_SEASON_DAYS: readonly number[] = [7, 14];
export const THEME_SEASON_DAY = 1;

export function seasonDay(showroom: ShowroomState, day: number): number | null {
  return clockDay(showroom.seasonStartDay, day, SEASON_DAYS);
}

export function seasonBegun(showroom: ShowroomState, day: number): boolean {
  return seasonDay(showroom, day) !== null;
}

function activeShowroom(state: Pick<GameState, "career" | "showroom">): ShowroomState | null {
  const showroom = state.showroom;
  return state.career === "showroom" && showroom !== null && !showroom.rested ? showroom : null;
}

export function isFairDay(
  state: Pick<GameState, "career" | "showroom" | "calendar">,
  day = state.calendar.day,
): boolean {
  const showroom = activeShowroom(state);
  return showroom !== null && seasonDay(showroom, day) === FAIR_SEASON_DAY;
}

export function isLateFairDay(
  state: Pick<GameState, "career" | "showroom" | "calendar">,
  day = state.calendar.day,
): boolean {
  const showroom = activeShowroom(state);
  return showroom !== null && seasonDay(showroom, day) === LATE_FAIR_SEASON_DAY;
}

export function isOpenHouseDay(state: Pick<GameState, "career" | "showroom">, day: number): boolean {
  const showroom = activeShowroom(state);
  if (showroom === null) return false;
  const current = seasonDay(showroom, day);
  return current !== null && OPEN_HOUSE_SEASON_DAYS.includes(current);
}

export function fairDayOf(showroom: ShowroomState): number {
  return showroom.seasonStartDay + FAIR_SEASON_DAY - 1;
}

export function nextSeasonStart(showroom: ShowroomState): number {
  return nextStartOf(showroom.seasonStartDay, SEASON_DAYS);
}

export function currentSeason(showroom: ShowroomState): SeasonDef {
  return seasonByNumber(showroom.seasonNumber);
}

export function seasonThemes(seasonNumber: number): FairThemeDef[] {
  const season = seasonByNumber(seasonNumber);
  return FAIR_THEMES.filter((theme) => theme.season === season.id);
}

export function daysToFair(showroom: ShowroomState, day: number): number {
  return fairDayOf(showroom) - day;
}
