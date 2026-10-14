export const RUN_STAGES = [
  "brief",
  "plan",
  "shop",
  "paint",
  "floor",
  "light",
  "style",
  "reveal",
  "done",
] as const;
export type RunStage = (typeof RUN_STAGES)[number];

export function stageIndex(stage: RunStage): number {
  return RUN_STAGES.indexOf(stage);
}

export function stageAfter(stage: RunStage): RunStage | null {
  return RUN_STAGES[stageIndex(stage) + 1] ?? null;
}

export function isPast(current: RunStage, stage: RunStage): boolean {
  return stageIndex(current) > stageIndex(stage);
}
