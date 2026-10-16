import type { GameState } from "./gameState";

export const BENCH_TOUR_ON = "bench-tour-on";
export const BENCH_TOUR_OFF = "bench-tour-off";

export function benchTourAsked(state: GameState): boolean {
  return state.story.flags.includes(BENCH_TOUR_ON) || state.story.flags.includes(BENCH_TOUR_OFF);
}

export function offersBenchTour(state: GameState): boolean {
  return state.profile.startedAs === "showroom" && state.delivered === 0 && !benchTourAsked(state);
}

export function coachOn(state: GameState): boolean {
  if (state.delivered > 0) return false;
  return state.profile.startedAs === "garage" || state.story.flags.includes(BENCH_TOUR_ON);
}

export function setBenchTour(state: GameState, on: boolean): GameState {
  if (!offersBenchTour(state)) return state;
  const flag = on ? BENCH_TOUR_ON : BENCH_TOUR_OFF;
  return { ...state, story: { ...state.story, flags: [...state.story.flags, flag] } };
}
