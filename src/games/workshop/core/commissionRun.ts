import type { FollowProgress } from "../../../engine/followRecord";
import type { ColourId } from "../../../engine/palette";
import type { PlacedPose } from "../../../engine/placedPose";
import type { CushionFabricId } from "../content/cushionFabric";
import type { ExtraId } from "../content/extra";
import type { FinishId } from "../content/finish";
import type { PartOptionId, PartSlot } from "../content/partOption";
import type { ProductId } from "../content/product";
import type { RunStage } from "../content/runStage";
import type { WoodId } from "../content/wood";
import type { Brief } from "./brief";
import type { OwnedBoard } from "./ownedBoard";

export const QUARTER_TURNS = [0, 90, 180, 270] as const;
export type QuarterTurn = (typeof QUARTER_TURNS)[number];

export interface PieceDesign {
  readonly productId: ProductId | null;
  readonly options: Readonly<Partial<Record<PartSlot, PartOptionId>>>;
  readonly woodId: WoodId | null;
}

export interface PartPlacement {
  readonly boardId: string;
  readonly x: number;
  readonly y: number;
  readonly rotation: QuarterTurn;
  readonly assisted: boolean;
}

export interface CutRecord {
  readonly accuracy: number;
  readonly assisted: boolean;
}

export interface JointRecord {
  readonly offsetMm: number;
  readonly angleDeg: number;
  readonly goodTaps: number;
  readonly assisted: boolean;
  readonly accuracy: number;
}

export interface SandRecord {
  readonly passes: readonly number[];
  readonly strokes: number;
  readonly across: number;
  readonly assisted: boolean;
}

export interface FinishChoice {
  readonly finishId: FinishId | null;
  readonly paint: ColourId | null;
}

export interface PlacedExtra extends PlacedPose {
  readonly id: string;
  readonly extraId: ExtraId;
}

export interface CushionWork {
  readonly fabricId: CushionFabricId;
  readonly seam: FollowProgress | null;
}

export interface CommissionRun {
  readonly id: string;
  readonly gigId: string;
  readonly brief: Brief;
  readonly stage: RunStage;
  readonly reached: RunStage;
  readonly startedDay: number;
  readonly design: PieceDesign;
  readonly tripPaid: boolean;
  readonly placements: Readonly<Record<string, PartPlacement>>;
  readonly usedBoards: readonly OwnedBoard[];
  readonly cuts: Readonly<Record<string, CutRecord>>;
  readonly joints: Readonly<Record<string, JointRecord>>;
  readonly sanding: Readonly<Record<string, SandRecord>>;
  readonly finish: FinishChoice;
  readonly extras: readonly PlacedExtra[];
  readonly nextExtraNumber: number;
  readonly cushion: CushionWork | null;
}

export const EMPTY_DESIGN: PieceDesign = { productId: null, options: {}, woodId: null };

export function createRun(id: string, gigId: string, brief: Brief, day: number): CommissionRun {
  return {
    id,
    gigId,
    brief,
    stage: "brief",
    reached: "brief",
    startedDay: day,
    design: EMPTY_DESIGN,
    tripPaid: false,
    placements: {},
    usedBoards: [],
    cuts: {},
    joints: {},
    sanding: {},
    finish: { finishId: null, paint: null },
    extras: [],
    nextExtraNumber: 1,
    cushion: null,
  };
}

export function runNumber(runId: string): number {
  const match = /^run-(\d+)$/.exec(runId);
  return match?.[1] === undefined ? 0 : Number(match[1]);
}
