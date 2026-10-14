import { upgradeIssues } from "../../../engine/upgrades";
import type { DecorId } from "../content/decor";
import { decorById, isDecorId } from "./catalog";
import type { GameState } from "./gameState";

export function decorIssues(state: GameState, decorId: DecorId): string[] {
  if (!isDecorId(decorId)) return ["That decoration does not exist."];
  return upgradeIssues(state.decor, decorById(decorId), state.coins, state.reputation);
}

export function buyDecor(state: GameState, decorId: DecorId): GameState {
  if (decorIssues(state, decorId).length > 0) return state;
  return { ...state, coins: state.coins - decorById(decorId).price, decor: [...state.decor, decorId] };
}
