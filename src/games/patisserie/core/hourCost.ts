import type { BakeRun } from "./bakeRun";
import { stageIndex, type RunStage } from "./runStage";

const STAGE_HOURS: Readonly<Record<RunStage, number>> = {
  brief: 0,
  design: 1,
  pantry: 0,
  weigh: 1,
  mix: 1,
  bake: 2,
  stack: 0,
  pipe: 2,
  decorate: 1,
  review: 0,
  done: 0,
};

function stageCompletionHours(run: BakeRun, stage: RunStage): number {
  const extraBatches = Math.max(0, run.batches.length - 1);
  if (stage === "weigh" || stage === "bake") return STAGE_HOURS[stage] + extraBatches;
  return STAGE_HOURS[stage];
}

export function leaveHours(run: BakeRun): number {
  return stageIndex(run.stage) < stageIndex(run.reached) ? 0 : stageCompletionHours(run, run.stage);
}
