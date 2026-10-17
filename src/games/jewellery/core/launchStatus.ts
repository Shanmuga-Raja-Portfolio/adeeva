import type { DifficultyId } from "../../../engine/difficulty";
import type { CollectionState } from "./collectionState";
import type { GameState } from "./gameState";

export function launchMinimum(difficulty: DifficultyId): number {
  return difficulty === "relaxed" ? 1 : 2;
}

export function launchStaged(state: Pick<GameState, "launch">, collection: CollectionState): boolean {
  return state.launch?.result?.seasonNumber === collection.seasonNumber;
}

export function popupDone(state: Pick<GameState, "launch">, collection: CollectionState): boolean {
  return state.launch?.popup?.seasonNumber === collection.seasonNumber;
}

export function launchReady(
  state: Pick<GameState, "launch" | "profile">,
  collection: CollectionState,
): boolean {
  return (
    !launchStaged(state, collection) &&
    collection.brief !== null &&
    collection.pieces.length >= launchMinimum(state.profile.difficulty)
  );
}
