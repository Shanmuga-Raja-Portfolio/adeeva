import { PATCH_THROW_MIN_PER_FIND } from "../content/boutiqueRecipe";
import { flipPieces } from "./flipPieces";
import type { FlipRun } from "./flipRun";
import type { PanelBoard } from "./panelBoard";
import { panelUnder, piecePolygon, type PlacementIssue } from "./placement";

export const THROW_SPLIT_REASON = "Use squares from both finds.";
const SQUARE_PREFIX = "square-";

export function squaresPerFind(run: FlipRun, board: PanelBoard): Readonly<Record<string, number>> {
  const counts: Record<string, number> = {};
  for (const piece of flipPieces(run.design)) {
    if (!piece.id.startsWith(SQUARE_PREFIX)) continue;
    const placement = run.placements[piece.id];
    const panel = placement === undefined ? null : panelUnder(board, piecePolygon(piece, placement));
    if (panel !== null) counts[panel.findKey] = (counts[panel.findKey] ?? 0) + 1;
  }
  return counts;
}

export function throwSplitIssues(run: FlipRun, board: PanelBoard): PlacementIssue[] {
  if (run.design.recipeId !== "patch-throw") return [];
  const counts = squaresPerFind(run, board);
  const split = run.finds.filter((owned) => (counts[owned.id] ?? 0) >= PATCH_THROW_MIN_PER_FIND).length >= 2;
  return split
    ? []
    : [{ pieceId: `${SQUARE_PREFIX}1`, kind: "two-finds", otherPieceId: null, message: THROW_SPLIT_REASON }];
}
