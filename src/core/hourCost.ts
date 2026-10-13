import type { RunStage } from "./runStage";

export const STAGE_COMPLETION_HOURS: Readonly<Record<RunStage, number>> = {
  brief: 0,
  sketch: 1,
  fabric: 0,
  cut: 2,
  assemble: 1,
  sew: 3,
  decorate: 1,
  review: 0,
  done: 0,
};

export const SHOP_VISIT_HOURS = 1;
export const ASSISTANT_SEW_SAVING_HOURS = 1;

export function stageCompletionHours(stage: RunStage, assistantHired: boolean): number {
  const base = STAGE_COMPLETION_HOURS[stage];
  return stage === "sew" && assistantHired ? base - ASSISTANT_SEW_SAVING_HOURS : base;
}
