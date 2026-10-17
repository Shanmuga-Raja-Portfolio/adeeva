import { productById } from "./catalog";
import { designLocked } from "./designLocks";
import type { PieceRun } from "./pieceRun";
import { stageIndex, type RunStage } from "./runStage";

const STAGE_HOURS: Readonly<Record<RunStage, number>> = {
  brief: 0,
  design: 1,
  supplies: 0,
  plan: 0,
  cut: 2,
  join: 1,
  set: 0,
  polish: 1,
  display: 0,
  review: 0,
  done: 0,
};

function stageCompletionHours(run: PieceRun, stage: RunStage): number {
  if (stage === "set") return productById(run.design.productId).seats.length;
  if (stage === "design" && designLocked(run)) return 0;
  if (stage === "join" && run.twinGlow) return 0;
  if (stage === "cut" && run.purpose.kind === "stall") return 1;
  return STAGE_HOURS[stage];
}

export function leaveHours(run: PieceRun): number {
  return stageIndex(run.stage) < stageIndex(run.reached) ? 0 : stageCompletionHours(run, run.stage);
}
