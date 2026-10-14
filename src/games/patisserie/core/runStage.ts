export const RUN_STAGES = [
  "brief",
  "design",
  "pantry",
  "weigh",
  "mix",
  "bake",
  "stack",
  "pipe",
  "decorate",
  "review",
  "done",
] as const;
export type RunStage = (typeof RUN_STAGES)[number];

export type RunKind = "order" | "tray" | "salon-tray" | "showpiece";

export const ORDER_STAGES: readonly RunStage[] = RUN_STAGES;
export const TRAY_STAGES: readonly RunStage[] = [
  "design",
  "pantry",
  "weigh",
  "mix",
  "bake",
  "review",
  "done",
];

export const SALON_TRAY_STAGES: readonly RunStage[] = [
  "design",
  "pantry",
  "weigh",
  "mix",
  "bake",
  "pipe",
  "review",
  "done",
];

export function stagesFor(kind: RunKind): readonly RunStage[] {
  if (kind === "tray") return TRAY_STAGES;
  if (kind === "salon-tray") return SALON_TRAY_STAGES;
  return ORDER_STAGES;
}

export function stageIndex(stage: RunStage): number {
  return RUN_STAGES.indexOf(stage);
}

export function stageAfter(kind: RunKind, stage: RunStage): RunStage | null {
  const stages = stagesFor(kind);
  return stages[stages.indexOf(stage) + 1] ?? null;
}
