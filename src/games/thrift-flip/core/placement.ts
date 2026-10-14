import { OVERLAP_EPSILON } from "../../../engine/geometry/overlapEpsilon";
import type { Point } from "../../../engine/geometry/point";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { placedPolygon, polygonBounds } from "../../../engine/geometry/polygonPlacement";
import type { Rotation } from "../../../engine/geometry/rotation";
import type { RecipePiece } from "../content/recipe";
import type { BoardPanel, PanelBoard } from "./panelBoard";

export interface Placement {
  readonly x: number;
  readonly y: number;
  readonly rotation: Rotation;
}

export type PlacementIssueKind =
  "unplaced" | "off-fabric" | "worn-spot" | "overlap" | "hem-edge" | "two-finds";

export interface PlacementIssue {
  readonly pieceId: string;
  readonly kind: PlacementIssueKind;
  readonly otherPieceId: string | null;
  readonly message: string;
}

export function piecePolygon(piece: RecipePiece, placement: Placement): Point[] {
  return placedPolygon(piece.shape, placement);
}

export function panelUnder(board: PanelBoard, polygon: readonly Point[]): BoardPanel | null {
  const bounds = polygonBounds(polygon);
  return (
    board.panels.find(
      (panel) =>
        bounds.minX >= panel.x - OVERLAP_EPSILON &&
        bounds.minY >= panel.y - OVERLAP_EPSILON &&
        bounds.maxX <= panel.x + panel.width + OVERLAP_EPSILON &&
        bounds.maxY <= panel.y + panel.height + OVERLAP_EPSILON,
    ) ?? null
  );
}

export function touchesWornSpot(board: PanelBoard, polygon: readonly Point[]): boolean {
  return board.spots.some((spot) => polygonsOverlap(polygon, spot.polygon));
}

export function layoutIssues(
  board: PanelBoard,
  pieces: readonly RecipePiece[],
  placements: Readonly<Record<string, Placement>>,
): PlacementIssue[] {
  const issues: PlacementIssue[] = [];
  const placed: { readonly piece: RecipePiece; readonly polygon: Point[] }[] = [];
  for (const piece of pieces) {
    const placement = Object.hasOwn(placements, piece.id) ? placements[piece.id] : undefined;
    if (placement === undefined) {
      issues.push({
        pieceId: piece.id,
        kind: "unplaced",
        otherPieceId: null,
        message: `${piece.name} still needs a spot on the fabric.`,
      });
      continue;
    }
    const polygon = piecePolygon(piece, placement);
    if (panelUnder(board, polygon) === null)
      issues.push({
        pieceId: piece.id,
        kind: "off-fabric",
        otherPieceId: null,
        message: `${piece.name} hangs off the fabric. Slide it onto one panel.`,
      });
    else if (touchesWornSpot(board, polygon))
      issues.push({
        pieceId: piece.id,
        kind: "worn-spot",
        otherPieceId: null,
        message: `${piece.name} sits on a worn spot. Slide it away.`,
      });
    placed.push({ piece, polygon });
  }
  placed.forEach((first, index) => {
    for (const second of placed.slice(index + 1)) {
      if (!polygonsOverlap(first.polygon, second.polygon)) continue;
      issues.push({
        pieceId: first.piece.id,
        kind: "overlap",
        otherPieceId: second.piece.id,
        message: `${first.piece.name} overlaps ${second.piece.name}. Give each piece its own space.`,
      });
    }
  });
  return issues;
}
