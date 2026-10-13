import type { GameState } from "./gameState";

export function setGuide(state: GameState, on: boolean): GameState {
  if (typeof on !== "boolean" || state.guide === on) return state;
  return { ...state, guide: on };
}
