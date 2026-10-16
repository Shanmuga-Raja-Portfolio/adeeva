import { RUN_STAGES, type RunStage } from "../content/runStage";
import type { CommissionRun } from "./commissionRun";
import { CUSHION_HOURS } from "./cushion";
import { runPieces } from "./pieceParts";

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

export const SET_SAW_HOURS = 2;
export const TWIN_SAW_HOURS = 1;
export const SET_JOIN_HOURS = 2;
export const REN_PEG_SAVING = 1;

export function stageIndex(stage: RunStage): number {
  return RUN_STAGES.indexOf(stage);
}

export function stageAfter(stage: RunStage): RunStage | null {
  return RUN_STAGES[stageIndex(stage) + 1] ?? null;
}

function baseHours(run: CommissionRun, stage: RunStage): number {
  if (run.purpose.kind !== "set") return STAGE_HOURS[stage];
  const pieces = runPieces(run);
  if (stage === "saw")
    return pieces.reduce((sum, piece) => sum + (piece.twinOf === null ? SET_SAW_HOURS : TWIN_SAW_HOURS), 0);
  if (stage === "join") return SET_JOIN_HOURS * pieces.length;
  return STAGE_HOURS[stage];
}

export function stageHours(run: CommissionRun, stage: RunStage): number {
  const hours = baseHours(run, stage);
  if (stage === "sand" && run.renJobs.includes("sand")) return 0;
  if (stage === "join" && run.renJobs.includes("pegs")) return Math.max(0, hours - REN_PEG_SAVING);
  if (stage === "finish") return hours + (run.cushion === null ? 0 : CUSHION_HOURS);
  return hours;
}

export function leaveHours(run: CommissionRun): number {
  return stageIndex(run.stage) < stageIndex(run.reached) ? 0 : stageHours(run, run.stage);
}
