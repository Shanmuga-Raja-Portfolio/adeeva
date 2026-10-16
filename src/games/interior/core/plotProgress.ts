import type { DifficultyId } from "../../../engine/difficulty";
import type { HomeStoryId } from "../content/homeStory";
import type { KeyId } from "../content/openHouseKey";
import { PLOTS } from "../content/plot";
import type { GameState } from "./gameState";
import { atLeast } from "./keyWall";
import type { Larkspur, PlotAdvance } from "./larkspur";
import { drawStoryOffer } from "./project";

export const STREET_BAR: Readonly<Record<DifficultyId, number>> = {
  relaxed: 0,
  standard: 60,
  challenging: 65,
};

export function plotAdvance(difficulty: DifficultyId, overall: number, hook: KeyId): PlotAdvance {
  if (overall < STREET_BAR[difficulty]) return "sister";
  if (difficulty === "relaxed" || !atLeast(hook, "silver")) return "choice";
  return "next";
}

function movedOn(larkspur: Larkspur): Larkspur {
  return larkspur.plot >= PLOTS.length
    ? { ...larkspur, plot: 1, phase: larkspur.phase + 1, sisterNext: false }
    : { ...larkspur, plot: larkspur.plot + 1, sisterNext: false };
}

function withOffer(state: GameState, larkspur: Larkspur, last: HomeStoryId | null): GameState {
  const [storyOffer, rng] = drawStoryOffer(state.rng, last);
  return { ...state, rng, larkspur: { ...larkspur, storyOffer, choicePending: false } };
}

export function applyAdvance(state: GameState, advance: PlotAdvance, last: HomeStoryId): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null) return state;
  if (advance === "choice") return { ...state, larkspur: { ...larkspur, choicePending: true } };
  const next = advance === "next" ? movedOn(larkspur) : { ...larkspur, sisterNext: true };
  return withOffer(state, next, last);
}

export function chooseNextPlot(state: GameState, move: boolean): GameState {
  const larkspur = state.larkspur;
  if (larkspur === null || !larkspur.choicePending || typeof move !== "boolean") return state;
  const last = larkspur.history[larkspur.history.length - 1]?.storyId ?? null;
  const next = move ? movedOn(larkspur) : { ...larkspur, sisterNext: true };
  return withOffer(state, next, last);
}
