import { clamp } from "./clamp";

export const MAX_BUZZ = 100;
export const BUZZ_DECAY_PER_DAY = 2;

export interface Standing {
  readonly coins: number;
  readonly reputation: number;
  readonly buzz: number;
}

export function applyStanding<S extends Standing>(state: S, change: Standing): S {
  return {
    ...state,
    coins: state.coins + change.coins,
    reputation: Math.max(0, state.reputation + change.reputation),
    buzz: clamp(state.buzz + change.buzz, 0, MAX_BUZZ),
  };
}

export function decayBuzz(buzz: number): number {
  return Math.max(0, buzz - BUZZ_DECAY_PER_DAY);
}
