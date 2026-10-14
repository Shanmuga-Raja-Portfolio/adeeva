import { FAIR_THEMES, type FairThemeDef } from "../content/fairTheme";
import { SEASON_DAYS, type SeasonDef } from "../content/season";
import { seasonByNumber } from "./catalog";
import { isCounterDay } from "./counter";
import type { FairState } from "./fairState";
import type { GameState } from "./gameState";

export const SALON_SEASON_DAY = 5;
export const FAIR_SEASON_DAY = 12;
export const SHOWPIECE_FIRST_SEASON_DAY = 2;
export const SHOWPIECE_LAST_SEASON_DAY = 11;

export type DayKind = "baking" | "salon" | "fair" | "counter";

export const COUNTER_DAY_REST = "It's Counter Day, so the oven rests. Open the counter instead!";
export const SALON_DAY_REST = "It's Salon Day, so the oven rests. Open the Comet Room instead!";
export const FAIR_DAY_REST = "It's Fair Day! The oven rests while you head to the glasshouse.";

export function seasonDay(fair: FairState, day: number): number | null {
  const offset = day - fair.seasonStartDay;
  return offset >= 0 && offset < SEASON_DAYS ? offset : null;
}

export function seasonBegun(fair: FairState, day: number): boolean {
  return seasonDay(fair, day) !== null;
}

function parlourOpen(state: GameState): boolean {
  return state.career === "salon" && state.salon !== null && state.salon.parlour !== "resting";
}

export function isSalonDay(state: GameState, day = state.calendar.day): boolean {
  return state.fair !== null && parlourOpen(state) && seasonDay(state.fair, day) === SALON_SEASON_DAY;
}

export function isFairDay(state: GameState, day = state.calendar.day): boolean {
  return state.fair !== null && parlourOpen(state) && seasonDay(state.fair, day) === FAIR_SEASON_DAY;
}

export function isFairLateDay(state: GameState, day = state.calendar.day): boolean {
  return state.fair !== null && parlourOpen(state) && seasonDay(state.fair, day) === FAIR_SEASON_DAY + 1;
}

export function dayKind(state: GameState, day = state.calendar.day): DayKind {
  if (isCounterDay(day)) return "counter";
  if (isSalonDay(state, day)) return "salon";
  if (isFairDay(state, day)) return "fair";
  return "baking";
}

export function restDayIssue(state: GameState): string | null {
  switch (dayKind(state)) {
    case "counter":
      return COUNTER_DAY_REST;
    case "salon":
      return SALON_DAY_REST;
    case "fair":
      return FAIR_DAY_REST;
    case "baking":
      return null;
  }
}

export function currentSeason(fair: FairState): SeasonDef {
  return seasonByNumber(fair.seasonNumber);
}

export function seasonThemes(seasonNumber: number): FairThemeDef[] {
  const season = seasonByNumber(seasonNumber);
  return FAIR_THEMES.filter((theme) => theme.season === season.id);
}

export function salonDayOf(fair: FairState): number {
  return fair.seasonStartDay + SALON_SEASON_DAY;
}

export function fairDayOf(fair: FairState): number {
  return fair.seasonStartDay + FAIR_SEASON_DAY;
}

export function nextSeasonStart(fair: FairState): number {
  return fair.seasonStartDay + SEASON_DAYS;
}
