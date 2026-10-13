import type { FollowProgress } from "../../../engine/followRecord";
import type { ColourId } from "../../../engine/palette";
import type { PlacedPose } from "../../../engine/placedPose";
import type { FillingId } from "../content/filling";
import type { IngredientId } from "../content/ingredient";
import type { MixId } from "../content/mix";
import type { PatternChoice } from "../content/pipePattern";
import type { ProductId } from "../content/product";
import type { ToppingId } from "../content/topping";
import type { Brief } from "./brief";
import type { RunKind, RunStage } from "./runStage";

export type RunPurpose = { readonly kind: "order"; readonly gigId: string } | { readonly kind: "tray" };

export interface BakeDesign {
  readonly productId: ProductId | null;
  readonly mixIds: readonly (MixId | null)[];
  readonly fillingId: FillingId | null;
  readonly colours: readonly ColourId[];
  readonly pattern: PatternChoice;
}

export interface WeighAttempt {
  readonly grams: number;
  readonly actions: number;
  readonly assisted: boolean;
}

export interface WeighRecord extends WeighAttempt {
  readonly band: number;
}

export interface BakeAttempt {
  readonly heat: number;
  readonly turnedMinutes: number | null;
  readonly takenMinutes: number;
  readonly assisted: boolean;
}

export interface BakeRecord extends BakeAttempt {
  readonly window: number;
}

export interface BatchState {
  readonly weighs: Readonly<Partial<Record<IngredientId, WeighRecord>>>;
  readonly eggs: number;
  readonly committed: boolean;
  readonly stir: FollowProgress | null;
  readonly bake: BakeRecord | null;
}

export interface PipeRecord {
  readonly accuracy: number;
  readonly assisted: boolean;
}

export interface PlacedTopping extends PlacedPose {
  readonly id: string;
  readonly toppingId: ToppingId;
}

export interface BakeRun {
  readonly id: string;
  readonly purpose: RunPurpose;
  readonly brief: Brief | null;
  readonly stage: RunStage;
  readonly reached: RunStage;
  readonly startedDay: number;
  readonly design: BakeDesign;
  readonly batches: readonly BatchState[];
  readonly stack: Readonly<Record<string, string>>;
  readonly filled: boolean;
  readonly iced: boolean;
  readonly pipes: Readonly<Record<string, PipeRecord>>;
  readonly toppings: readonly PlacedTopping[];
  readonly nextToppingNumber: number;
  readonly pantryHourPaid: boolean;
  readonly ingredientValue: number;
}

export const EMPTY_BATCH: BatchState = { weighs: {}, eggs: 0, committed: false, stir: null, bake: null };

export function runKind(run: BakeRun): RunKind {
  return run.purpose.kind;
}

export function createBakeRun(id: string, purpose: RunPurpose, brief: Brief | null, day: number): BakeRun {
  const stage: RunStage = purpose.kind === "order" ? "brief" : "design";
  return {
    id,
    purpose,
    brief,
    stage,
    reached: stage,
    startedDay: day,
    design: { productId: null, mixIds: [], fillingId: null, colours: [], pattern: "a" },
    batches: [],
    stack: {},
    filled: false,
    iced: false,
    pipes: {},
    toppings: [],
    nextToppingNumber: 1,
    pantryHourPaid: false,
    ingredientValue: 0,
  };
}
