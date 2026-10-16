import { buyUpgrade, upgradePurchaseIssues } from "../../../engine/upgrades";
import type { UpgradeDef, UpgradeId } from "../content/upgrade";
import { renLevel } from "./apprentice";
import { SKYLIGHT_HOURS } from "./calendar";
import { knownUpgrade } from "./catalog";
import type { GameState } from "./gameState";
import { bayCount, relaidFloor } from "./showroomFloor";

function gateIssue(state: GameState, upgrade: UpgradeDef): string | null {
  const gate = upgrade.opens;
  if (gate === null) return null;
  if (state.career !== "showroom" || state.fair === null || state.apprentice === null)
    return `${upgrade.name} opens with the showroom.`;
  if (gate.kind === "booth" && state.fair.booth < gate.booth)
    return `${upgrade.name} opens at booth ${gate.booth}.`;
  if (gate.kind === "ren" && renLevel(state.apprentice.jobsDone) < gate.level)
    return `${upgrade.name} opens when Ren reaches level ${gate.level}.`;
  return null;
}

export function workshopUpgradeIssues(state: GameState, upgradeId: string): string[] {
  const upgrade = knownUpgrade(upgradeId);
  const gate = upgrade === undefined ? null : gateIssue(state, upgrade);
  return [...(gate === null ? [] : [gate]), ...upgradePurchaseIssues(state, upgrade)];
}

export function buyWorkshopUpgrade(state: GameState, upgradeId: UpgradeId): GameState {
  if (workshopUpgradeIssues(state, upgradeId).length > 0) return state;
  const bought = buyUpgrade(state, knownUpgrade(upgradeId));
  if (bought === state) return state;
  if (upgradeId === "skylight")
    return {
      ...bought,
      calendar: { ...bought.calendar, hoursLeft: bought.calendar.hoursLeft + SKYLIGHT_HOURS },
    };
  if (upgradeId === "hand-cart" && bought.showroom !== null)
    return { ...bought, showroom: relaidFloor(bought.showroom, bayCount(bought)) };
  return bought;
}
