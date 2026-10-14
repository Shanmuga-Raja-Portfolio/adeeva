import { SWAP_SEASON_DAY } from "../content/season";
import type { Boutique } from "./boutique";
import type { GameState } from "./gameState";
import { followingSeason, seasonDayOf, seasonEnds } from "./seasonCalendar";
import { autoStageShowcase } from "./showcase";
import { queueStoryTrigger } from "./storyQueue";
import { rollSwapDay } from "./swapRoll";

function withBoutique(state: GameState, boutique: Boutique): GameState {
  return { ...state, boutique };
}

function closeSeason(state: GameState, endedDay: number): GameState {
  const boutique = state.boutique;
  if (boutique === null || !seasonEnds(boutique.season, endedDay)) return state;
  const season = followingSeason(boutique.season, endedDay + 1);
  return queueStoryTrigger(withBoutique(state, { ...boutique, season }), "season-turn");
}

function prepareSwapDay(state: GameState, nextDay: number): GameState {
  const boutique = state.boutique;
  if (boutique === null || seasonDayOf(boutique.season, nextDay) !== SWAP_SEASON_DAY) return state;
  if (boutique.season.swapDay !== null) return state;
  const [swapDay, rng] = rollSwapDay(state, nextDay);
  return { ...withBoutique(state, { ...boutique, season: { ...boutique.season, swapDay } }), rng };
}

export function turnBoutiqueDay(state: GameState): GameState {
  if (state.boutique === null) return state;
  const endedDay = state.calendar.day;
  const staged = autoStageShowcase(state);
  return prepareSwapDay(closeSeason(staged, endedDay), endedDay + 1);
}
