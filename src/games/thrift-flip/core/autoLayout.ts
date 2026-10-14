import type { Point } from "../../../engine/geometry/point";
import { polygonsOverlap } from "../../../engine/geometry/polygonOverlap";
import { polygonBounds, rotatedShape } from "../../../engine/geometry/polygonPlacement";
import type { Rotation } from "../../../engine/geometry/rotation";
import type { RecipePiece } from "../content/recipe";
import type { PanelBoard } from "./panelBoard";
import { layoutIssues, piecePolygon, touchesWornSpot, type Placement } from "./placement";
import { polygonArea } from "../../../engine/geometry/polygonArea";

const SCAN_STEP_CM = 1;
const AUTO_ROTATIONS: readonly Rotation[] = [0, 90];

function size(piece: RecipePiece, rotation: Rotation): { readonly width: number; readonly height: number } {
  const bounds = polygonBounds(rotatedShape(piece.shape, rotation));
  return { width: bounds.maxX - bounds.minX, height: bounds.maxY - bounds.minY };
}

function spotFor(board: PanelBoard, piece: RecipePiece, taken: readonly Point[][]): Placement | null {
  for (const rotation of AUTO_ROTATIONS) {
    const { width, height } = size(piece, rotation);
    for (const panel of board.panels) {
      for (let y = panel.y; y + height <= panel.y + panel.height; y += SCAN_STEP_CM) {
        for (let x = panel.x; x + width <= panel.x + panel.width; x += SCAN_STEP_CM) {
          const placement: Placement = { x, y, rotation };
          const polygon = piecePolygon(piece, placement);
          if (touchesWornSpot(board, polygon)) continue;
          if (taken.some((other) => polygonsOverlap(polygon, other))) continue;
          return placement;
        }
      }
    }
  }
  return null;
}

function placeAll(
  board: PanelBoard,
  pieces: readonly RecipePiece[],
  kept: Readonly<Record<string, Placement>>,
): Record<string, Placement> | null {
  const placements: Record<string, Placement> = { ...kept };
  const taken: Point[][] = pieces.flatMap((piece) => {
    const placement = placements[piece.id];
    return placement === undefined ? [] : [piecePolygon(piece, placement)];
  });
  const open = pieces
    .filter((piece) => placements[piece.id] === undefined)
    .sort((a, b) => polygonArea(b.shape) - polygonArea(a.shape));
  for (const piece of open) {
    const placement = spotFor(board, piece, taken);
    if (placement === null) return null;
    placements[piece.id] = placement;
    taken.push(piecePolygon(piece, placement));
  }
  return placements;
}

export function autoPlacements(
  board: PanelBoard,
  pieces: readonly RecipePiece[],
  existing: Readonly<Record<string, Placement>>,
): Record<string, Placement> | null {
  const troubled = new Set(layoutIssues(board, pieces, existing).flatMap((issue) => [issue.pieceId]));
  const kept = Object.fromEntries(
    pieces.flatMap((piece) => {
      const placement = existing[piece.id];
      return placement === undefined || troubled.has(piece.id) ? [] : [[piece.id, placement]];
    }),
  );
  return placeAll(board, pieces, kept) ?? placeAll(board, pieces, {});
}

export function autoSpot(
  board: PanelBoard,
  pieces: readonly RecipePiece[],
  placements: Readonly<Record<string, Placement>>,
  pieceId: string,
): Placement | null {
  const piece = pieces.find((entry) => entry.id === pieceId);
  if (piece === undefined) return null;
  const taken = pieces.flatMap((entry) => {
    const placement = placements[entry.id];
    return entry.id === pieceId || placement === undefined ? [] : [piecePolygon(entry, placement)];
  });
  return spotFor(board, piece, taken);
}
