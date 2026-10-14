import { upgradePurchaseIssues } from "../../../engine/upgrades";
import type { UpgradeId } from "../content/upgrade";
import { knownUpgrade } from "./catalog";
import type { GameState } from "./gameState";

export const BOUTIQUE_UPGRADE_REASON = "This upgrade is for the boutique.";

export function upgradeOpen(state: Pick<GameState, "profile">, upgradeId: UpgradeId): boolean {
  const upgrade = knownUpgrade(upgradeId);
  return upgrade !== undefined && (!upgrade.boutiqueOnly || state.profile.career === "boutique");
}

export function upgradeIssues(state: GameState, upgradeId: UpgradeId): string[] {
  if (!upgradeOpen(state, upgradeId)) return [BOUTIQUE_UPGRADE_REASON];
  return upgradePurchaseIssues(state, knownUpgrade(upgradeId));
}
