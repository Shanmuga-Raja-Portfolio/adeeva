import type { Point } from "../content/garmentPart";
import { fabricsNeedingCut } from "./designFabrics";
import { LAYOUT_TOLERANCE_CM } from "./layoutTolerance";
import type { DressRun } from "./dressRun";
import type { Inventory } from "./gameState";
import { placedPolygon, polygonBounds } from "./piecePolygon";
import { polygonsOverlap } from "./polygonOverlap";
import { piecesOnFabric, type RequiredPiece } from "./requiredPieces";

export const BOLT_WIDTH_CM = 140;

export type PlacementIssueKind = "unplaced" | "out-of-bounds" | "overlap";

export interface PlacementIssue {
  readonly pieceId: string;
  readonly fabricId: string;
  readonly kind: PlacementIssueKind;
  readonly otherPieceId: string | null;
  readonly message: string;
}

interface PlacedPiece {
  readonly entry: RequiredPiece;
  readonly polygon: Point[];
}

export function boltLengthCm(ownedMetres: number): number {
  return ownedMetres * 100;
}

export function isInsideBolt(polygon: readonly Point[], lengthCm: number): boolean {
  const bounds = polygonBounds(polygon);
  return (
    bounds.minX >= -LAYOUT_TOLERANCE_CM &&
    bounds.minY >= -LAYOUT_TOLERANCE_CM &&
    bounds.maxX <= BOLT_WIDTH_CM + LAYOUT_TOLERANCE_CM &&
    bounds.maxY <= lengthCm + LAYOUT_TOLERANCE_CM
  );
}

export function fabricPlacementIssues(
  run: DressRun,
  fabricId: string,
  ownedMetres: number,
): PlacementIssue[] {
  const lengthCm = boltLengthCm(ownedMetres);
  const entries = piecesOnFabric(run.design, fabricId);
  const issues: PlacementIssue[] = [];
  const placed: PlacedPiece[] = [];
  for (const entry of entries) {
    const placement = run.placements[entry.piece.id];
    if (placement === undefined) {
      issues.push({
        pieceId: entry.piece.id,
        fabricId,
        kind: "unplaced",
        otherPieceId: null,
        message: `${entry.piece.name} still needs a spot on the fabric.`,
      });
      continue;
    }
    const polygon = placedPolygon(entry.piece.shape, placement);
    if (!isInsideBolt(polygon, lengthCm))
      issues.push({
        pieceId: entry.piece.id,
        fabricId,
        kind: "out-of-bounds",
        otherPieceId: null,
        message: `${entry.piece.name} hangs off the fabric. Slide it inside the bolt or buy a longer length.`,
      });
    placed.push({ entry, polygon });
  }
  placed.forEach((first, index) => {
    for (const second of placed.slice(index + 1)) {
      if (!polygonsOverlap(first.polygon, second.polygon)) continue;
      issues.push({
        pieceId: first.entry.piece.id,
        fabricId,
        kind: "overlap",
        otherPieceId: second.entry.piece.id,
        message: `${first.entry.piece.name} overlaps ${second.entry.piece.name}. Give each piece its own space.`,
      });
    }
  });
  return issues;
}

export function piecePlacementIssues(run: DressRun, inventory: Inventory): PlacementIssue[] {
  return fabricsNeedingCut(run.design)
    .filter((fabricId) => !run.cutFabrics.includes(fabricId))
    .flatMap((fabricId) => fabricPlacementIssues(run, fabricId, inventory.fabricMetres[fabricId] ?? 0));
}
