import { polygonBounds } from "../../../engine/geometry/polygonPlacement";
import { HEM_BAND, HEM_EDGE_CM } from "../content/ticket";
import type { PanelBoard } from "./panelBoard";
import { layoutIssues, panelUnder, piecePolygon, type Placement, type PlacementIssue } from "./placement";
import { HEM_PIECE } from "./runPieces";

export const HEM_EDGE_REASON = "Lay the hem band along the bottom edge.";

export function hemOnEdge(board: PanelBoard, placement: Placement): boolean {
  const polygon = piecePolygon(HEM_PIECE, placement);
  const panel = panelUnder(board, polygon);
  if (panel === null) return false;
  const bounds = polygonBounds(polygon);
  const lyingFlat = Math.abs(bounds.maxX - bounds.minX - HEM_BAND.width) < 0.01;
  return lyingFlat && panel.y + panel.height - bounds.maxY <= HEM_EDGE_CM;
}

export function hemSpot(board: PanelBoard): Placement | null {
  for (const panel of board.panels) {
    for (let x = panel.x; x + HEM_BAND.width <= panel.x + panel.width; x += 1) {
      const placement: Placement = { x, y: panel.y + panel.height - HEM_BAND.height, rotation: 0 };
      const clear = layoutIssues(board, [HEM_PIECE], { [HEM_PIECE.id]: placement }).length === 0;
      if (clear && hemOnEdge(board, placement)) return placement;
    }
  }
  return null;
}

export function hemEdgeIssues(
  board: PanelBoard,
  placements: Readonly<Record<string, Placement>>,
): PlacementIssue[] {
  const placement = Object.hasOwn(placements, HEM_PIECE.id) ? placements[HEM_PIECE.id] : undefined;
  if (placement === undefined || hemOnEdge(board, placement)) return [];
  return [{ pieceId: HEM_PIECE.id, kind: "hem-edge", otherPieceId: null, message: HEM_EDGE_REASON }];
}
