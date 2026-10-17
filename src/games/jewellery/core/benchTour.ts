import type { GameState } from "./gameState";

export const BENCH_TOUR_ASKED = "bench-tour-asked";

export function offersBenchTour(state: GameState): boolean {
  return (
    state.profile.startedAs === "collection" &&
    state.ordersDelivered === 0 &&
    !state.story.flags.includes(BENCH_TOUR_ASKED)
  );
}

export function setBenchTour(state: GameState, on: boolean): GameState {
  if (typeof on !== "boolean" || !offersBenchTour(state)) return state;
  return { ...state, guide: on, story: { ...state.story, flags: [...state.story.flags, BENCH_TOUR_ASKED] } };
}
