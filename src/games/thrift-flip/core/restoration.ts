import { average } from "../../../engine/average";
import { clamp } from "../../../engine/clamp";
import { conditionById } from "./catalog";
import { findCleanAccuracy } from "./clean";
import type { FlipRun } from "./flipRun";
import type { GameState } from "./gameState";
import type { OwnedFind } from "./ownedFind";
import { snagLoss } from "./unpick";

export const CLEAN_RESTORE_SHARE = 0.8;

type RestoreState = Pick<GameState, "profile" | "upgrades">;

export function restoredCondition(state: RestoreState, run: FlipRun, owned: OwnedFind): number {
  const condition = conditionById(owned.grade).condition;
  const cleaned = (1 - condition) * findCleanAccuracy(state, run, owned) * CLEAN_RESTORE_SHARE;
  return clamp(condition - snagLoss(run, owned) + cleaned, 0, 1);
}

export function restoredAverage(state: RestoreState, run: FlipRun): number {
  return average(run.finds.map((owned) => restoredCondition(state, run, owned)));
}
