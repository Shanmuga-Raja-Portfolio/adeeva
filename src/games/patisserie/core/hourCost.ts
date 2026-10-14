import type { UpgradeId } from "../content/upgrade";
import { flourishById } from "./catalog";
import type { BakeRun } from "./bakeRun";
import { stageIndex, type RunStage } from "./runStage";

const STAGE_HOURS: Readonly<Record<RunStage, number>> = {
  brief: 0,
  design: 1,
  pantry: 0,
  weigh: 1,
  mix: 1,
  bake: 2,
  stack: 0,
  pipe: 2,
  decorate: 1,
  review: 0,
  done: 0,
};

export const QUICK_PIPE_HOURS = 1;
export const SHOWPIECE_TROLLEY_STAGES: readonly RunStage[] = ["pipe", "decorate"];

function flourishHours(run: BakeRun, stage: RunStage): number {
  const touch = (id: "bake-together" | "plaque-lettering") =>
    run.flourishes.includes(id) ? flourishById(id).hours : 0;
  if (stage === "bake") return touch("bake-together");
  if (stage === "pipe") return touch("plaque-lettering");
  return 0;
}

function stageCompletionHours(run: BakeRun, stage: RunStage, trolley: boolean): number {
  const extraBatches = Math.max(0, run.batches.length - 1);
  if (run.purpose.kind === "salon-tray" && stage === "pipe") return QUICK_PIPE_HOURS;
  const base = stage === "weigh" || stage === "bake" ? STAGE_HOURS[stage] + extraBatches : STAGE_HOURS[stage];
  const trolleyCut = trolley && run.purpose.kind === "showpiece" && SHOWPIECE_TROLLEY_STAGES.includes(stage);
  return Math.max(0, base + flourishHours(run, stage) - (trolleyCut ? 1 : 0));
}

export function leaveHours(run: BakeRun, upgrades: readonly UpgradeId[]): number {
  if (stageIndex(run.stage) < stageIndex(run.reached)) return 0;
  return stageCompletionHours(run, run.stage, upgrades.includes("showpiece-trolley"));
}
