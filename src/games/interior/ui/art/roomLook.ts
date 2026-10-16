import type { FloorId } from "../../content/floor";
import type { RoomId } from "../../content/roomTemplate";
import {
  paintById,
  placedLights,
  type MakeoverRun,
  type PlacedDecor,
  type PlacedLight,
  type PlacedPiece,
} from "../../core";
import { roomHex } from "./roomHex";

export interface RoomLook {
  readonly roomId: RoomId;
  readonly backWall: string | null;
  readonly backLower: string | null;
  readonly sideWall: string | null;
  readonly floor: FloorId | null;
  readonly pieces: readonly PlacedPiece[];
  readonly soft: string;
  readonly lights: readonly PlacedLight[];
  readonly decor: readonly PlacedDecor[];
}

interface LookParts {
  readonly walls: boolean;
  readonly floor: boolean;
  readonly furniture: boolean;
  readonly lights: boolean;
  readonly decor: boolean;
}

export const FINISHED: LookParts = { walls: true, floor: true, furniture: true, lights: true, decor: true };
export const BARE: LookParts = { walls: false, floor: false, furniture: false, lights: false, decor: false };

export function roomLook(run: MakeoverRun, parts: LookParts): RoomLook {
  const { plan } = run;
  const wall = plan.wallPaint === null ? null : roomHex(paintById(plan.wallPaint).colour);
  const feature = plan.featurePaint === null ? wall : roomHex(paintById(plan.featurePaint).colour);
  return {
    roomId: run.brief.roomId,
    backWall: parts.walls ? feature : null,
    backLower: parts.walls && plan.lowerPaint !== null ? roomHex(paintById(plan.lowerPaint).colour) : null,
    sideWall: parts.walls ? wall : null,
    floor: parts.floor ? plan.floor : null,
    pieces: parts.furniture ? plan.pieces : [],
    soft: roomHex(run.softColour),
    lights: parts.lights ? placedLights(run) : [],
    decor: parts.decor ? run.decor : [],
  };
}
