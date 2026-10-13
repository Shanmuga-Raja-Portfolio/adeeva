export const RUN_STAGES = [
  "brief",
  "sketch",
  "fabric",
  "cut",
  "assemble",
  "sew",
  "decorate",
  "review",
  "done",
] as const;
export type RunStage = (typeof RUN_STAGES)[number];

export function stageIndex(stage: RunStage): number {
  return RUN_STAGES.indexOf(stage);
}

export function stageAfter(stage: RunStage): RunStage | null {
  return RUN_STAGES[stageIndex(stage) + 1] ?? null;
}
