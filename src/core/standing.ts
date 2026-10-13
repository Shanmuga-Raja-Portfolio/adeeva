import { clamp } from "./clamp";
import type { GameState } from "./gameState";

export const MAX_BUZZ = 100;

export interface StandingChange {
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
}

export function applyStanding(state: GameState, change: StandingChange): GameState {
  return {
    ...state,
    coins: state.coins + change.coins,
    reputation: Math.max(0, state.reputation + change.reputation),
    buzz: clamp(state.buzz + change.buzz, 0, MAX_BUZZ),
  };
}
