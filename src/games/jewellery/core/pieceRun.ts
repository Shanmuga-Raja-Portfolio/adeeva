import type { Rotation } from "../../../engine/geometry/rotation";
import type { ChainId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { GlazeColour } from "../content/jewelColour";
import type { MetalId } from "../content/metal";
import type { ProductId } from "../content/product";
import type { StockSizeId } from "../content/stockSize";
import type { StoneId } from "../content/stone";
import type { Brief } from "./brief";
import type { DesignOptions, PlacedCharm } from "./pieceLook";
import type { RunKind, RunStage } from "./runStage";

export type RunPurpose =
  | { readonly kind: "order"; readonly gigId: string }
  | { readonly kind: "stall" }
  | { readonly kind: "collection"; readonly slot: number };

export interface PieceDesign {
  readonly productId: ProductId;
  readonly options: DesignOptions;
  readonly metalId: MetalId | null;
  readonly stoneId: StoneId | null;
}

export interface Placement {
  readonly size: StockSizeId;
  readonly x: number;
  readonly y: number;
  readonly rotation: Rotation;
}

export interface CutRecord {
  readonly accuracy: number;
  readonly assisted: boolean;
}

export interface JoinRecord {
  readonly ticks: number;
  readonly insideTicks: number;
  readonly overTicks: number;
  readonly assisted: boolean;
  readonly twin: boolean;
}

export interface SetRecord {
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly claws: readonly number[];
  readonly accuracy: number;
  readonly assisted: boolean;
}

export interface PolishRecord {
  readonly passes: readonly number[];
  readonly strokes: number;
  readonly assisted: boolean;
}

export interface DisplayChoice {
  readonly finish: FinishId;
  readonly glaze: GlazeColour | null;
  readonly chain: ChainId | null;
  readonly cordColour: GlazeColour | null;
  readonly charms: readonly PlacedCharm[];
  readonly nextCharmNumber: number;
}

export interface PieceRun {
  readonly id: string;
  readonly purpose: RunPurpose;
  readonly brief: Brief | null;
  readonly stage: RunStage;
  readonly reached: RunStage;
  readonly startedDay: number;
  readonly seed: number;
  readonly design: PieceDesign;
  readonly plan: Readonly<Record<string, Placement>>;
  readonly consumed: readonly StockSizeId[] | null;
  readonly stonesTaken: boolean;
  readonly cuts: Readonly<Record<string, CutRecord>>;
  readonly joins: Readonly<Record<string, JoinRecord>>;
  readonly sets: Readonly<Record<string, SetRecord>>;
  readonly polish: Readonly<Record<string, PolishRecord>>;
  readonly display: DisplayChoice;
  readonly suppliesHourPaid: boolean;
  readonly twinGlow: boolean;
  readonly lineSheet: boolean;
  readonly potStones: readonly number[];
}

export const FRESH_DISPLAY: DisplayChoice = {
  finish: "high-shine",
  glaze: null,
  chain: null,
  cordColour: null,
  charms: [],
  nextCharmNumber: 1,
};

export function runKind(run: PieceRun): RunKind {
  return run.purpose.kind;
}

interface NewRun {
  readonly id: string;
  readonly purpose: RunPurpose;
  readonly brief: Brief | null;
  readonly day: number;
  readonly seed: number;
  readonly design: PieceDesign;
  readonly display: DisplayChoice;
}

export function createPieceRun(fresh: NewRun): PieceRun {
  const stage: RunStage = fresh.purpose.kind === "order" ? "brief" : "design";
  return {
    id: fresh.id,
    purpose: fresh.purpose,
    brief: fresh.brief,
    stage,
    reached: stage,
    startedDay: fresh.day,
    seed: fresh.seed,
    design: fresh.design,
    plan: {},
    consumed: null,
    stonesTaken: false,
    cuts: {},
    joins: {},
    sets: {},
    polish: {},
    display: fresh.display,
    suppliesHourPaid: false,
    twinGlow: false,
    lineSheet: false,
    potStones: [],
  };
}
