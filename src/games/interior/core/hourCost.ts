import type { MakeoverRun } from "./makeoverRun";
import { stageIndex, type RunStage } from "./runStage";

const STAGE_HOURS: Readonly<Record<RunStage, number>> = {
  brief: 0,
  plan: 1,
  shop: 1,
  paint: 2,
  floor: 2,
  light: 1,
  style: 1,
  reveal: 0,
  done: 0,
};

const EVERY_VISIT: readonly RunStage[] = ["shop"];

export function leaveHours(run: MakeoverRun): number {
  const revisit = stageIndex(run.stage) < stageIndex(run.reached);
  return revisit && !EVERY_VISIT.includes(run.stage) ? 0 : STAGE_HOURS[run.stage];
}
