import { RUNWAY_LIGHTS, type RunwayLightId } from "../content/runwayLight";
import { RUNWAY_MOODS, type RunwayMoodId } from "../content/runwayMood";
import { actionCheck, type ActionCheck } from "./actionCheck";
import type { GameState } from "./gameState";
import { finishedLooks, LOOKS_PER_SEASON, seasonTheme } from "./labelSeason";
import { scoreRunway } from "./runwayScore";
import { applyStanding } from "./standing";
import { queueStoryTrigger } from "./storyQueue";

export function isWalkOrder(order: readonly number[]): boolean {
  return (
    order.length === LOOKS_PER_SEASON &&
    [...order].sort((a, b) => a - b).every((value, index) => value === index)
  );
}

export function canChooseRunway(state: GameState): ActionCheck {
  const season = state.season;
  if (season === null) return actionCheck(["There is no show this season."]);
  if (season.result !== null) return actionCheck(["This season's show is over."]);
  const missing = season.looks.filter((look) => look === null).length;
  return actionCheck(
    missing === 0 ? [] : [`Finish ${missing} more ${missing === 1 ? "look" : "looks"} first.`],
  );
}

export function chooseRunway(
  state: GameState,
  order: readonly number[],
  mood: RunwayMoodId,
  light: RunwayLightId,
): GameState {
  const season = state.season;
  if (season === null || !canChooseRunway(state).ok || !isWalkOrder(order)) return state;
  if (!RUNWAY_MOODS.some((entry) => entry.id === mood) || !RUNWAY_LIGHTS.some((entry) => entry.id === light))
    return state;
  const current = season.runway;
  const unchanged =
    current !== null &&
    current.mood === mood &&
    current.light === light &&
    current.order.every((value, index) => value === order[index]);
  if (unchanged) return state;
  return { ...state, season: { ...season, runway: { order: [...order], mood, light } } };
}

const SHOW_OPENS_DAYS_EARLY = 1;

export function canStageRunway(state: GameState): ActionCheck {
  const check = canChooseRunway(state);
  if (!check.ok) return check;
  const season = state.season;
  const reasons: string[] = [];
  if (season?.runway === null) reasons.push("Choose the walk order, music and lighting first.");
  if (season !== null && state.calendar.day < season.deadlineDay - SHOW_OPENS_DAYS_EARLY) {
    reasons.push(`The venue is booked for day ${season.deadlineDay}. The doors open the day before.`);
  }
  return actionCheck(reasons);
}

export function stageRunway(state: GameState): GameState {
  const season = state.season;
  if (season === null || season.runway === null || !canStageRunway(state).ok) return state;
  const result = scoreRunway(finishedLooks(season), seasonTheme(season), season.runway, {
    seasonNumber: season.number,
    late: state.calendar.day > season.deadlineDay,
    difficulty: state.profile.difficulty,
  });
  const staged = applyStanding(
    { ...state, season: { ...season, result } },
    { coins: result.coins, reputation: result.reputation, buzz: result.buzz },
  );
  return queueStoryTrigger(staged, "runway-done");
}
