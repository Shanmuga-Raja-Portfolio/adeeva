import { average } from "../../../engine/average";
import type { DishDef, StepKind } from "../content/dish";
import type { TasteTag } from "../content/tasteTag";
import type { DishRun } from "./dishRun";

export const SKILL_SHARE = 0.95;
export const TAG_SHARE = 0.05;

export type StepAccuracies = Readonly<Record<StepKind, number>>;

export function qualityFrom(dish: DishDef, accuracies: Partial<StepAccuracies>, tagFit: number): number {
  const skill = dish.steps.reduce((sum, step) => sum + (step.weight / 100) * (accuracies[step.kind] ?? 0), 0);
  return Math.round(100 * (SKILL_SHARE * skill + TAG_SHARE * tagFit));
}

export function tagFit(dish: DishDef, required: readonly TasteTag[]): number {
  if (required.length === 0) return 1;
  return required.filter((tag) => dish.tags.includes(tag)).length / required.length;
}

export function runAccuracies(run: DishRun, dish: DishDef): StepAccuracies {
  const chop =
    dish.chop.length === 0 ? 0 : average(dish.chop.map((_, index) => run.chop[index]?.accuracy ?? 0));
  return {
    chop,
    sizzle: run.sizzle?.accuracy ?? 0,
    simmer: run.simmer?.result?.accuracy ?? 0,
    taste: run.taste?.accuracy ?? 0,
    plate: run.plated?.result.accuracy ?? 0,
  };
}

export function runQuality(run: DishRun, dish: DishDef): number {
  return qualityFrom(dish, runAccuracies(run, dish), tagFit(dish, run.brief.requiredTags));
}

export function weakestStep(dish: DishDef, accuracies: StepAccuracies): StepKind {
  const weighted = dish.steps.map((step) => ({
    kind: step.kind,
    loss: (step.weight / 100) * (1 - accuracies[step.kind]),
  }));
  const worst = weighted.reduce((top, entry) => (entry.loss > top.loss ? entry : top));
  return worst.kind;
}
