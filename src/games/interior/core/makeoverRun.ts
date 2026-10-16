import type { Point } from "../../../engine/geometry/point";
import type { DecorId } from "../content/decor";
import type { FloorId } from "../content/floor";
import type { LightId } from "../content/light";
import type { PaintId } from "../content/paint";
import type { PlotId } from "../content/plot";
import type { PurposeId } from "../content/roomPurpose";
import { DEFAULT_SOFT_COLOUR, type SoftColour } from "../content/softColour";
import type { Brief } from "./brief";
import type { PlacedPiece } from "./floorPlan";
import type { RunStage } from "./runStage";

export type RunPurpose =
  | { readonly kind: "makeover" }
  | {
      readonly kind: "home-room";
      readonly plotId: PlotId;
      readonly roomIndex: number;
      readonly purposeId: PurposeId;
      readonly hallFloor: FloorId | null;
    };

export const MAKEOVER: RunPurpose = { kind: "makeover" };

export const ROLLER_ZONES = ["top", "bottom"] as const;
export type RollerZone = (typeof ROLLER_ZONES)[number];

export interface RoomPlan {
  readonly pieces: readonly PlacedPiece[];
  readonly nextPieceNumber: number;
  readonly wallPaint: PaintId | null;
  readonly featurePaint: PaintId | null;
  readonly lowerPaint: PaintId | null;
  readonly floor: FloorId | null;
  readonly lights: readonly LightId[];
  readonly tidied: boolean;
}

export interface EdgeRecord {
  readonly accuracy: number;
  readonly assisted: boolean;
  readonly byCrew: boolean;
}

export interface RollRecord {
  readonly passes: readonly number[];
  readonly strokes: number;
  readonly splats: readonly Point[];
  readonly dryStrokes: number;
  readonly smudges: number;
  readonly assisted: boolean;
  readonly byCrew: boolean;
}

export interface FloorRecord {
  readonly offset: number;
  readonly accuracy: number;
  readonly assisted: boolean;
  readonly byCrew: boolean;
}

export interface LightPlace {
  readonly col: number;
  readonly row: number;
}

export interface PlacedDecor {
  readonly id: string;
  readonly decorId: DecorId;
  readonly x: number;
  readonly y: number;
  readonly rotation: number;
  readonly scale: number;
  readonly layer: number;
}

export interface MakeoverRun {
  readonly id: string;
  readonly gigId: string;
  readonly brief: Brief;
  readonly purpose: RunPurpose;
  readonly stage: RunStage;
  readonly reached: RunStage;
  readonly startedDay: number;
  readonly seed: number;
  readonly plan: RoomPlan;
  readonly spend: number;
  readonly locked: boolean;
  readonly edges: Readonly<Record<string, EdgeRecord>>;
  readonly rolls: Readonly<Record<string, RollRecord>>;
  readonly roller: number;
  readonly rollerZone: RollerZone;
  readonly floorLaid: Readonly<Record<string, FloorRecord>>;
  readonly lightPlaces: Readonly<Record<string, LightPlace>>;
  readonly lightAssisted: boolean;
  readonly lightCrew: number | null;
  readonly decor: readonly PlacedDecor[];
  readonly nextDecorNumber: number;
  readonly softColour: SoftColour;
}

export const EMPTY_PLAN: RoomPlan = {
  pieces: [],
  nextPieceNumber: 1,
  wallPaint: null,
  featurePaint: null,
  lowerPaint: null,
  floor: null,
  lights: [],
  tidied: false,
};

export const ROLLER_LOAD = 12;

interface NewRun {
  readonly id: string;
  readonly gigId: string;
  readonly brief: Brief;
  readonly purpose: RunPurpose;
  readonly day: number;
  readonly seed: number;
  readonly plan: RoomPlan;
}

export function createMakeoverRun(fresh: NewRun): MakeoverRun {
  return {
    id: fresh.id,
    gigId: fresh.gigId,
    brief: fresh.brief,
    purpose: fresh.purpose,
    stage: "brief",
    reached: "brief",
    startedDay: fresh.day,
    seed: fresh.seed,
    plan: fresh.plan,
    spend: 0,
    locked: false,
    edges: {},
    rolls: {},
    roller: ROLLER_LOAD,
    rollerZone: "top",
    floorLaid: {},
    lightPlaces: {},
    lightAssisted: false,
    lightCrew: null,
    decor: [],
    nextDecorNumber: 1,
    softColour: DEFAULT_SOFT_COLOUR,
  };
}

export function isHomeRoom(run: Pick<MakeoverRun, "purpose">): boolean {
  return run.purpose.kind === "home-room";
}
