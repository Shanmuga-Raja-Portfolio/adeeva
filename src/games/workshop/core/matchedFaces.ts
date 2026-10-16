import { productById, setTemplateById } from "./catalog";
import type { CommissionRun } from "./commissionRun";
import { designParts, runPieces } from "./pieceParts";

type FacesRun = Pick<CommissionRun, "design" | "purpose" | "placements">;

export function matchedPairs(run: FacesRun): number {
  const products = runPieces(run).map((piece) => piece.productId);
  const piecesByBoard = new Map<string, Set<number>>();
  for (const part of designParts(run)) {
    const productId = products[part.piece];
    if (productId === undefined || !productById(productId).showSurfaces.includes(part.baseId)) continue;
    const placement = Object.hasOwn(run.placements, part.id) ? run.placements[part.id] : undefined;
    if (placement === undefined || placement.assisted) continue;
    const pieces = piecesByBoard.get(placement.boardId) ?? new Set<number>();
    pieces.add(part.piece);
    piecesByBoard.set(placement.boardId, pieces);
  }
  return [...piecesByBoard.values()].reduce((sum, pieces) => sum + Math.max(0, pieces.size - 1), 0);
}

export function matchedFaces(run: FacesRun): number | null {
  if (run.purpose.kind !== "set") return null;
  const matchable = setTemplateById(run.purpose.templateId).matchablePairs;
  if (matchable === 0) return null;
  return Math.min(1, matchedPairs(run) / matchable);
}
