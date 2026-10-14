import type { FollowProgress } from "../../../engine/followRecord";
import type { CuisineId } from "../content/cuisine";
import type { CueKind } from "../content/cueCard";
import type { CookStepKind, DishDef, DishId } from "../content/dish";
import type { IngredientId } from "../content/ingredient";
import type { TasteTag } from "../content/tasteTag";
import type { ChopResult } from "./chop";
import type { PlacedComponent, PlateResult } from "./plate";
import type { PlateColour } from "../content/plateComponent";
import type { SimmerResult } from "./simmer";
import type { SizzleResult } from "./sizzle";
import type { TasteResult } from "./taste";

export const RUN_STAGES = ["ticket", "mise", "cook", "plate", "pass", "done"] as const;
export type RunStage = (typeof RUN_STAGES)[number];

export const TEST_RUN_KINDS = ["graduation", "tasting"] as const;
export type TestRunKind = (typeof TEST_RUN_KINDS)[number];

export type RunPurpose =
  | { readonly kind: "lesson"; readonly cuisine: CuisineId; readonly fee: number }
  | { readonly kind: "test"; readonly test: TestRunKind; readonly index: number }
  | { readonly kind: "order"; readonly gigId: string }
  | { readonly kind: "practice" }
  | {
      readonly kind: "segment";
      readonly cards: readonly SegmentCard[];
      readonly cueRight: boolean;
      readonly kindTips: number;
    };

export interface SegmentCard {
  readonly cue: CueKind;
  readonly tip: number;
}

export interface DishBrief {
  readonly minQuality: number;
  readonly requiredTags: readonly TasteTag[];
  readonly avoid: readonly IngredientId[];
}

export interface SimmerProgress {
  readonly follow: FollowProgress;
  readonly result: SimmerResult | null;
}

export interface PlatedDish {
  readonly result: PlateResult;
  readonly components: readonly PlacedComponent[];
  readonly plateColour: PlateColour;
}

export interface DishRun {
  readonly id: string;
  readonly purpose: RunPurpose;
  readonly dishId: DishId;
  readonly day: number;
  readonly stage: RunStage;
  readonly brief: DishBrief;
  readonly mise: readonly IngredientId[];
  readonly chop: readonly ChopResult[];
  readonly sizzle: SizzleResult | null;
  readonly simmer: SimmerProgress | null;
  readonly taste: TasteResult | null;
  readonly plated: PlatedDish | null;
}

export function cookSteps(dish: DishDef): CookStepKind[] {
  return dish.steps.flatMap((step) => (step.kind === "plate" ? [] : [step.kind]));
}

export function stepDone(run: DishRun, dish: DishDef, kind: CookStepKind): boolean {
  switch (kind) {
    case "chop":
      return run.chop.length >= dish.chop.length;
    case "sizzle":
      return run.sizzle !== null;
    case "simmer":
      return run.simmer !== null && run.simmer.result !== null;
    case "taste":
      return run.taste !== null;
  }
}

export function currentCookStep(run: DishRun, dish: DishDef): CookStepKind | null {
  return cookSteps(dish).find((kind) => !stepDone(run, dish, kind)) ?? null;
}

export function cookStarted(run: DishRun): boolean {
  return run.chop.length > 0 || run.sizzle !== null || run.simmer !== null || run.taste !== null;
}

export function stageIndex(stage: RunStage): number {
  return RUN_STAGES.indexOf(stage);
}

export function stageAfter(stage: RunStage): RunStage | null {
  return RUN_STAGES[stageIndex(stage) + 1] ?? null;
}

export function createDishRun(
  id: string,
  purpose: RunPurpose,
  dishId: DishId,
  day: number,
  brief: DishBrief,
): DishRun {
  return {
    id,
    purpose,
    dishId,
    day,
    stage: "ticket",
    brief,
    mise: [],
    chop: [],
    sizzle: null,
    simmer: null,
    taste: null,
    plated: null,
  };
}
