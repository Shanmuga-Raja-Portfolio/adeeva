import { buyUpgrade } from "../../../engine/upgrades";
import type { UpgradeId } from "../content/upgrade";
import { SKYLIGHT_HOURS } from "./calendar";
import { knownUpgrade } from "./catalog";
import type { GameState } from "./gameState";

export function buyGarageUpgrade(state: GameState, upgradeId: UpgradeId): GameState {
  const bought = buyUpgrade(state, knownUpgrade(upgradeId));
  if (bought === state || upgradeId !== "skylight") return bought;
  return {
    ...bought,
    calendar: { ...bought.calendar, hoursLeft: bought.calendar.hoursLeft + SKYLIGHT_HOURS },
  };
}
