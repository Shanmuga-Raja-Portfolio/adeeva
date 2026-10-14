import type { UpgradeId } from "../content/upgrade";
import { FLIP_STAGES, stageHours, stageIndex, type FlipStage } from "./flipStage";
import type { FlipRun } from "./flipRun";
import { recipeById } from "./catalog";
import { runKind } from "./runKind";

export const MEND_STAGES: readonly FlipStage[] = [
  "brief",
  "unpick",
  "clean",
  "sew",
  "finish",
  "review",
  "done",
];
export const ALTER_STAGES: readonly FlipStage[] = [
  "brief",
  "unpick",
  "layout",
  "cut",
  "sew",
  "review",
  "done",
];
export const TICKET_SEW_HOURS = 1;
export const TICKET_CUT_HOURS = 1;
export const MENDING_BASKET_SAVING = 1;

type RunShape = Pick<FlipRun, "brief" | "design">;

export function runStages(run: RunShape): readonly FlipStage[] {
  const kind = runKind(run);
  if (kind === "mend") return MEND_STAGES;
  if (kind === "alter") return ALTER_STAGES;
  return FLIP_STAGES;
}

export function runHasStage(run: RunShape, stage: FlipStage): boolean {
  return runStages(run).includes(stage);
}

export function runStageAfter(run: RunShape, stage: FlipStage): FlipStage | null {
  return runStages(run).find((entry) => stageIndex(entry) > stageIndex(stage)) ?? null;
}

export function runStagesBefore(run: RunShape, stage: FlipStage): FlipStage[] {
  return runStages(run).filter((entry) => stageIndex(entry) < stageIndex(stage));
}

function ticketStageHours(stage: FlipStage, upgrades: readonly UpgradeId[]): number {
  if (stage === "unpick") return upgrades.includes("mending-basket") ? 1 - MENDING_BASKET_SAVING : 1;
  if (stage === "cut") return TICKET_CUT_HOURS;
  if (stage === "sew") return TICKET_SEW_HOURS;
  return stageHours(stage, TICKET_SEW_HOURS);
}

export function plannedStageHours(
  run: Pick<FlipRun, "brief" | "design" | "stage">,
  upgrades: readonly UpgradeId[],
): number {
  if (runKind(run) !== "flip") return ticketStageHours(run.stage, upgrades);
  const sewHours = run.design.recipeId === null ? 0 : recipeById(run.design.recipeId).sewHours;
  return stageHours(run.stage, sewHours);
}
