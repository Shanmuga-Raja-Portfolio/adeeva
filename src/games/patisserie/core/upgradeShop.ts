import { upgradePurchaseIssues } from "../../../engine/upgrades";
import type { UpgradeId } from "../content/upgrade";
import { knownUpgrade } from "./catalog";
import type { GameState } from "./gameState";

export function upgradeAllowed(state: GameState, upgradeId: UpgradeId): boolean {
  const upgrade = knownUpgrade(upgradeId);
  return upgrade !== undefined && (upgrade.career === null || upgrade.career === state.career);
}

export function upgradeIssues(state: GameState, upgradeId: UpgradeId): string[] {
  const upgrade = knownUpgrade(upgradeId);
  if (upgrade !== undefined && !upgradeAllowed(state, upgradeId))
    return [`${upgrade.name} is for the Comet Room.`];
  return upgradePurchaseIssues(state, upgrade);
}
