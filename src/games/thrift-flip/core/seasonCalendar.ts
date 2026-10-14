import { weekNumber } from "../../../engine/weekday";
import {
  SEASON_IDS,
  SEASON_LENGTH_DAYS,
  SHOWCASE_FIRST_DAY,
  SHOWCASE_LAST_DAY,
  SWAP_SEASON_DAY,
  type SeasonDef,
  type SeasonId,
} from "../content/season";
import type { BoutiqueSeason } from "./boutique";
import { seasonById } from "./catalog";
import type { GameState } from "./gameState";

type SeasonState = Pick<GameState, "boutique" | "calendar">;

function seasonAt(index: number): SeasonId {
  return SEASON_IDS[((index % SEASON_IDS.length) + SEASON_IDS.length) % SEASON_IDS.length] ?? "blossom-mend";
}

export function themeForDay(day: number): SeasonId {
  return seasonAt(weekNumber(day) - 1);
}

export function freshSeason(number: number, themeId: SeasonId, startDay: number): BoutiqueSeason {
  return { number, themeId, startDay, capsule: [], showcase: null, swapDay: null };
}

export function firstSeason(day: number): BoutiqueSeason {
  return freshSeason(1, themeForDay(day), day);
}

export function followingSeason(season: BoutiqueSeason, startDay: number): BoutiqueSeason {
  return freshSeason(season.number + 1, seasonAt(SEASON_IDS.indexOf(season.themeId) + 1), startDay);
}

export function seasonDayOf(season: BoutiqueSeason, day: number): number {
  return day - season.startDay + 1;
}

export function seasonDay(state: SeasonState): number | null {
  const season = state.boutique?.season ?? null;
  return season === null ? null : seasonDayOf(season, state.calendar.day);
}

export function seasonTheme(state: Pick<GameState, "boutique">): SeasonDef | null {
  const season = state.boutique?.season ?? null;
  return season === null ? null : seasonById(season.themeId);
}

export function isSwapDay(state: SeasonState): boolean {
  return seasonDay(state) === SWAP_SEASON_DAY;
}

export function isShowcaseDay(state: SeasonState): boolean {
  const day = seasonDay(state);
  return day !== null && day >= SHOWCASE_FIRST_DAY && day <= SHOWCASE_LAST_DAY;
}

export function isLateShowcaseDay(state: SeasonState): boolean {
  return seasonDay(state) === SHOWCASE_LAST_DAY;
}

export function seasonEnds(season: BoutiqueSeason, day: number): boolean {
  return seasonDayOf(season, day) >= SEASON_LENGTH_DAYS;
}

export function inWelcomeWeek(state: Pick<GameState, "boutique">, day: number): boolean {
  const boutique = state.boutique;
  return boutique !== null && weekNumber(day) === weekNumber(boutique.openedDay);
}
