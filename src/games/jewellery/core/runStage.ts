export const RUN_STAGES = [
  "brief",
  "design",
  "supplies",
  "plan",
  "cut",
  "join",
  "set",
  "polish",
  "display",
  "review",
  "done",
] as const;
export type RunStage = (typeof RUN_STAGES)[number];

export type RunKind = "order" | "stall" | "collection";

const STALL_STAGES: readonly RunStage[] = [
  "design",
  "supplies",
  "plan",
  "cut",
  "join",
  "polish",
  "display",
  "done",
];

export function stagesFor(kind: RunKind, seats: number): readonly RunStage[] {
  if (kind === "stall") return STALL_STAGES;
  const stages = kind === "collection" ? RUN_STAGES.filter((stage) => stage !== "brief") : RUN_STAGES;
  return seats > 0 ? stages : stages.filter((stage) => stage !== "set");
}

export function stageIndex(stage: RunStage): number {
  return RUN_STAGES.indexOf(stage);
}

export function stageAfter(stages: readonly RunStage[], stage: RunStage): RunStage | null {
  return stages[stages.indexOf(stage) + 1] ?? null;
}
