import type { DecorId } from "../content/decor";
import type { FloorId } from "../content/floor";
import type { LightId } from "../content/light";
import type { PaintId } from "../content/paint";
import type { SoftColour } from "../content/softColour";
import type { PlacedPiece } from "./floorPlan";
import { placedLights } from "./lightPlacement";
import type { MakeoverRun } from "./makeoverRun";
import { stageIndex } from "./runStage";

export interface RoomSource {
  readonly pieces: readonly PlacedPiece[];
  readonly wallPaint: PaintId | null;
  readonly featurePaint: PaintId | null;
  readonly floor: FloorId | null;
  readonly lights: readonly LightId[];
  readonly decor: readonly DecorId[];
  readonly softColour: SoftColour;
}

export function roomSource(run: MakeoverRun): RoomSource {
  const lit = stageIndex(run.stage) >= stageIndex("light");
  return {
    pieces: run.plan.pieces,
    wallPaint: run.plan.wallPaint,
    featurePaint: run.plan.featurePaint,
    floor: run.plan.floor,
    lights: lit ? placedLights(run).map((light) => light.lightId) : run.plan.lights,
    decor: run.decor.map((item) => item.decorId),
    softColour: run.softColour,
  };
}
