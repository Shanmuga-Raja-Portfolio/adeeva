import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import type { GameState } from "./gameState";

export const STOOL_HOURS = 1;

export function dayLength(state: Pick<GameState, "upgrades">): number {
  return BASE_DAY_HOURS + (state.upgrades.includes("comfy-stool") ? STOOL_HOURS : 0);
}
