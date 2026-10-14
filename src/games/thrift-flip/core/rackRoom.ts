import type { GameState } from "./gameState";
import { rackSize, type RackPiece } from "./rackPiece";

type RackState = Pick<GameState, "rack" | "boutique" | "upgrades" | "profile">;

export function shelfIds(state: Pick<GameState, "boutique">): ReadonlySet<string> {
  return new Set(state.boutique?.season.capsule ?? []);
}

export function hangingPieces(state: Pick<GameState, "rack" | "boutique">): RackPiece[] {
  const shelf = shelfIds(state);
  return state.rack.filter((piece) => !shelf.has(piece.id));
}

export function shelfPieces(state: Pick<GameState, "rack" | "boutique">): RackPiece[] {
  const shelf = state.boutique?.season.capsule ?? [];
  return shelf.flatMap((id) => state.rack.filter((piece) => piece.id === id));
}

export function rackHooks(state: RackState): number {
  return rackSize(state.upgrades, state.profile.career);
}

export function rackIsFull(state: RackState): boolean {
  return hangingPieces(state).length >= rackHooks(state);
}
