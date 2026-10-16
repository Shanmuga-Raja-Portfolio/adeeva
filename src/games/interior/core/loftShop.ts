import { buyForShelf, shelfPurchaseIssues } from "../../../engine/upgrades";
import type { LoftDecorId } from "../content/loftDecor";
import { isLoftDecorId, loftDecorById } from "./catalog";
import type { GameState } from "./gameState";
import { upgradeOpen } from "./upgradeShop";

const MISSING_DECOR = "That decoration does not exist.";

function loftDecorItem(state: GameState, decorId: LoftDecorId) {
  if (!isLoftDecorId(decorId)) return undefined;
  const item = loftDecorById(decorId);
  return upgradeOpen(state, item) ? item : undefined;
}

export function loftDecorIssues(state: GameState, decorId: LoftDecorId): string[] {
  return shelfPurchaseIssues(state, "loftDecor", loftDecorItem(state, decorId), MISSING_DECOR);
}

export function buyLoftDecor(state: GameState, decorId: LoftDecorId): GameState {
  return buyForShelf(state, "loftDecor", loftDecorItem(state, decorId), MISSING_DECOR);
}
