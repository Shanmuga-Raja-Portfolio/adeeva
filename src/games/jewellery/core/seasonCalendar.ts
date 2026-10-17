import { nextSeasonStart as nextStartOf, seasonDay as clockDay } from "../../../engine/seasonClock";
import { LAUNCH_THEMES, type LaunchThemeDef } from "../content/launchTheme";
import { SEASON_DAYS } from "../content/loftSeason";
import { seasonByNumber } from "./catalog";
import type { CollectionState } from "./collectionState";
import type { GameState } from "./gameState";

export const BOARD_LAST_SEASON_DAY = 10;
export const LANTERN_NIGHT_SEASON_DAY = 13;
export const POPUP_SEASON_DAY = 14;

type SeasonView = Pick<GameState, "career" | "collection">;

export function loftCollection(state: SeasonView): CollectionState | null {
  return state.career === "collection" ? state.collection : null;
}

export function seasonDayOf(collection: CollectionState, day: number): number | null {
  return clockDay(collection.seasonStartDay, day, SEASON_DAYS);
}

export function nextSeasonStart(collection: CollectionState): number {
  return nextStartOf(collection.seasonStartDay, SEASON_DAYS);
}

export function lineSeason(state: SeasonView, day: number): CollectionState | null {
  const collection = loftCollection(state);
  if (collection === null || collection.rested || collection.themeId === null) return null;
  return seasonDayOf(collection, day) === null ? null : collection;
}

export function isLanternNight(state: SeasonView, day: number): boolean {
  const collection = lineSeason(state, day);
  return collection !== null && seasonDayOf(collection, day) === LANTERN_NIGHT_SEASON_DAY;
}

export function isPopupDay(state: SeasonView, day: number): boolean {
  const collection = lineSeason(state, day);
  return collection !== null && seasonDayOf(collection, day) === POPUP_SEASON_DAY;
}

export function lanternNightOf(collection: CollectionState): number {
  return collection.seasonStartDay + LANTERN_NIGHT_SEASON_DAY - 1;
}

export function seasonThemes(seasonNumber: number): LaunchThemeDef[] {
  const season = seasonByNumber(seasonNumber);
  return LAUNCH_THEMES.filter((theme) => theme.season === season.id);
}

export function daysToLanternNight(collection: CollectionState, day: number): number {
  return lanternNightOf(collection) - day;
}
