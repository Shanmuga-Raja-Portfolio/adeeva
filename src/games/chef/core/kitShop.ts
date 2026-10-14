import { buyUpgrade, upgradePurchaseIssues } from "../../../engine/upgrades";
import { knownUpgrade } from "./catalog";
import type { GameState } from "./gameState";
import { recordMoney } from "./path";

export function upgradeShown(state: GameState, upgradeId: string): boolean {
  const upgrade = knownUpgrade(upgradeId);
  if (upgrade === undefined) return false;
  return upgrade.path === null || state.path?.kind === upgrade.path;
}

export function kitUpgradeIssues(state: GameState, upgradeId: string): string[] {
  const upgrade = knownUpgrade(upgradeId);
  if (upgrade !== undefined && !upgradeShown(state, upgradeId))
    return [`${upgrade.name} is for your own restaurant.`];
  return upgradePurchaseIssues(state, upgrade);
}

export function buyKitUpgrade(state: GameState, upgradeId: string): GameState {
  const upgrade = knownUpgrade(upgradeId);
  if (upgrade === undefined || kitUpgradeIssues(state, upgradeId).length > 0) return state;
  const bought = buyUpgrade(state, upgrade);
  return bought === state ? state : recordMoney(bought, "upgrades", upgrade.price);
}
