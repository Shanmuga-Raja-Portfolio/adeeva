import { buyUpgrade, upgradePurchaseIssues } from "../../../engine/upgrades";
import type { UpgradeId } from "../content/upgrade";
import { knownUpgrade, spotByNumber } from "./catalog";
import type { GameState } from "./gameState";

export function loftUpgradeIssues(state: GameState, upgradeId: UpgradeId): string[] {
  const upgrade = knownUpgrade(upgradeId);
  if (upgrade === undefined || upgrade.loftSpot === null) return [];
  if (state.career !== "collection" || state.launch === null)
    return ["Loft upgrades come with the Lantern Loft."];
  return state.launch.spot >= upgrade.loftSpot
    ? []
    : [`${upgrade.name} opens at the ${spotByNumber(upgrade.loftSpot).name}.`];
}

export function shopUpgradeIssues(state: GameState, upgradeId: UpgradeId): string[] {
  return [...loftUpgradeIssues(state, upgradeId), ...upgradePurchaseIssues(state, knownUpgrade(upgradeId))];
}

export function buyShopUpgrade(state: GameState, upgradeId: UpgradeId): GameState {
  return loftUpgradeIssues(state, upgradeId).length > 0 ? state : buyUpgrade(state, knownUpgrade(upgradeId));
}
