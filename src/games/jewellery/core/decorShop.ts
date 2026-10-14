import { buyForShelf, shelfPurchaseIssues } from "../../../engine/upgrades";
import type { DecorId } from "../content/decor";
import { decorById, isDecorId } from "./catalog";
import type { GameState } from "./gameState";

const MISSING_DECOR = "That decoration does not exist.";

function decorItem(decorId: DecorId) {
  return isDecorId(decorId) ? decorById(decorId) : undefined;
}

export function decorIssues(state: GameState, decorId: DecorId): string[] {
  return shelfPurchaseIssues(state, "decor", decorItem(decorId), MISSING_DECOR);
}

export function buyDecor(state: GameState, decorId: DecorId): GameState {
  return buyForShelf(state, "decor", decorItem(decorId), MISSING_DECOR);
}
