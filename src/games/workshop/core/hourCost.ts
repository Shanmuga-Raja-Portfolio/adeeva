import { RUN_STAGES, type RunStage } from "../content/runStage";
import type { CommissionRun } from "./commissionRun";
import { CUSHION_HOURS } from "./cushion";

export const STAGE_HOURS: Readonly<Record<RunStage, number>> = {
  brief: 0,
  design: 1,
  timber: 0,
  layout: 0,
  saw: 3,
  join: 3,
  sand: 1,
  finish: 1,
  review: 0,
  done: 0,
};

export function stageIndex(stage: RunStage): number {
  return RUN_STAGES.indexOf(stage);
}

export function stageAfter(stage: RunStage): RunStage | null {
  return RUN_STAGES[stageIndex(stage) + 1] ?? null;
}

function stageCompletionHours(run: CommissionRun): number {
  if (run.stage === "finish") return STAGE_HOURS.finish + (run.cushion === null ? 0 : CUSHION_HOURS);
  return STAGE_HOURS[run.stage];
}

export function leaveHours(run: CommissionRun): number {
  return stageIndex(run.stage) < stageIndex(run.reached) ? 0 : stageCompletionHours(run);
}
