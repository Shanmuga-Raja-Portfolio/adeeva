import { buyForShelf, shelfPurchaseIssues } from "../../../engine/upgrades";
import type { LoftDecorId } from "../content/loftDecor";
import { isLoftDecorId, loftDecorById } from "./catalog";
import type { GameState } from "./gameState";

const MISSING_DECOR = "That decoration does not exist.";

function loftDecorItem(decorId: LoftDecorId) {
  return isLoftDecorId(decorId) ? loftDecorById(decorId) : undefined;
}

export function loftDecorIssues(state: GameState, decorId: LoftDecorId): string[] {
  return shelfPurchaseIssues(state, "loftDecor", loftDecorItem(decorId), MISSING_DECOR);
}

export function buyLoftDecor(state: GameState, decorId: LoftDecorId): GameState {
  return buyForShelf(state, "loftDecor", loftDecorItem(decorId), MISSING_DECOR);
}
