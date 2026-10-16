import type { UpgradeDef } from "../content/upgrade";
import type { LoftDecorDef } from "../content/loftDecor";
import type { GameState } from "./gameState";

export function upgradeOpen(state: Pick<GameState, "career">, item: UpgradeDef | LoftDecorDef): boolean {
  return item.career === null || item.career === state.career;
}
