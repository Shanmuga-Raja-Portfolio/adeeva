import type { PatternPieceDef } from "../../../content/garmentPart";
import {
  BOLT_WIDTH_CM,
  boltLengthCm,
  requiredPieces,
  placedPolygon,
  polygonsOverlap,
  type DressRun,
  type Rotation,
} from "../../../core";
import { rotatedSize } from "./pieceGeometry";

const SCAN_STEP_CM = 2;

export function autoPlacementSpot(
  run: DressRun,
  fabricId: string,
  ownedMetres: number,
  piece: PatternPieceDef,
  rotation: Rotation,
): { x: number; y: number } {
  const lengthCm = boltLengthCm(ownedMetres);
  const size = rotatedSize(piece.shape, rotation);
  const others = requiredPieces(run.design).flatMap((entry) => {
    const placement = run.placements[entry.piece.id];
    if (entry.fabricId !== fabricId || entry.piece.id === piece.id || placement === undefined) return [];
    return [placedPolygon(entry.piece.shape, placement)];
  });
  for (let y = 0; y + size.height <= lengthCm; y += SCAN_STEP_CM) {
    for (let x = 0; x + size.width <= BOLT_WIDTH_CM; x += SCAN_STEP_CM) {
      const polygon = placedPolygon(piece.shape, { x, y, rotation });
      if (!others.some((other) => polygonsOverlap(polygon, other))) return { x, y };
    }
  }
  return { x: 0, y: lengthCm + 2 };
}
