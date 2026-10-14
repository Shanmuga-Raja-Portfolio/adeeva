export const FLIP_STAGES = [
  "brief",
  "design",
  "market",
  "unpick",
  "clean",
  "layout",
  "cut",
  "sew",
  "finish",
  "review",
  "done",
] as const;
export type FlipStage = (typeof FLIP_STAGES)[number];

export const MARKET_VISIT_HOURS = 1;

const STAGE_HOURS: Readonly<Record<FlipStage, number>> = {
  brief: 0,
  design: 1,
  market: 0,
  unpick: 1,
  clean: 1,
  layout: 0,
  cut: 2,
  sew: 2,
  finish: 1,
  review: 0,
  done: 0,
};

export function stageIndex(stage: FlipStage): number {
  return FLIP_STAGES.indexOf(stage);
}

export function stageAfter(stage: FlipStage): FlipStage | null {
  return FLIP_STAGES[stageIndex(stage) + 1] ?? null;
}

export function stageHours(stage: FlipStage, sewHours: number): number {
  return stage === "sew" ? sewHours : STAGE_HOURS[stage];
}
