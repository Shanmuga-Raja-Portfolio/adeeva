import type { DressRun } from "./dressRun";
import { LAYOUT_TOLERANCE_CM } from "./layoutTolerance";
import { ownEntry } from "../../../engine/ownEntry";
import { placedPolygon, polygonBounds } from "../../../engine/geometry/polygonPlacement";
import { piecesOnFabric } from "./requiredPieces";

export const METRE_STEP = 0.5;
export const CM_PER_METRE_STEP = 50;

export function metresForLength(lengthCm: number): number {
  const trimmed = Math.max(0, Math.round((lengthCm - LAYOUT_TOLERANCE_CM) * 1e6) / 1e6);
  return Math.ceil(trimmed / CM_PER_METRE_STEP) * METRE_STEP;
}

export function layoutLengthCm(run: DressRun, fabricId: string): number {
  const maxYs = piecesOnFabric(run.design, fabricId).flatMap((entry) => {
    const placement = ownEntry(run.placements, entry.piece.id);
    return placement === undefined ? [] : [polygonBounds(placedPolygon(entry.piece.shape, placement)).maxY];
  });
  return maxYs.length === 0 ? 0 : Math.max(...maxYs);
}

export function cutMetres(run: DressRun, fabricId: string): number {
  return metresForLength(layoutLengthCm(run, fabricId));
}
