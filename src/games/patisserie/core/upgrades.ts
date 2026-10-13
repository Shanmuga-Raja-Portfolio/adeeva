import { upgradeIssues } from "../../../engine/upgrades";
import type { UpgradeId } from "../content/upgrade";
import { isUpgradeId, upgradeById } from "./catalog";
import type { GameState } from "./gameState";

export function upgradePurchaseIssues(state: GameState, upgradeId: UpgradeId): string[] {
  if (!isUpgradeId(upgradeId)) return ["That upgrade does not exist."];
  return upgradeIssues(state.upgrades, upgradeById(upgradeId), state.coins, state.reputation);
}

export function buyUpgrade(state: GameState, upgradeId: UpgradeId): GameState {
  if (upgradePurchaseIssues(state, upgradeId).length > 0) return state;
  return {
    ...state,
    coins: state.coins - upgradeById(upgradeId).price,
    upgrades: [...state.upgrades, upgradeId],
  };
}
