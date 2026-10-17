import { clamp } from "../../../engine/clamp";
import { productById } from "./catalog";
import type { CollectionPiece } from "./collectionState";
import type { GameState } from "./gameState";
import { shapeOption } from "./partGeometry";
import type { PieceRun } from "./pieceRun";

export const CRISP_MARK = 0.9;
const CRISP_SLOPE = 250;
export const ASSISTED_MOTIF_CUT = 0.8;

export function motifPathIds(run: PieceRun, motif: string | null): string[] {
  const product = productById(run.design.productId);
  if (motif === null || !product.slots.includes("shape") || shapeOption(run.design.options) !== motif)
    return [];
  return product.parts
    .filter((part) => part.outline === "shape" || part.outline === "half")
    .map((part) => part.key);
}

function lineMotif(state: Pick<GameState, "collection">): string | null {
  return state.collection?.brief?.motif ?? null;
}

export function withMotifMaster(
  state: GameState,
  run: PieceRun,
  pathId: string,
  accuracy: number,
): GameState {
  const collection = state.collection;
  if (run.purpose.kind !== "collection" || collection === null || collection.motifMaster !== null)
    return state;
  if (!motifPathIds(run, lineMotif(state)).includes(pathId)) return state;
  return { ...state, collection: { ...collection, motifMaster: accuracy } };
}

export function motifCutAccuracy(run: PieceRun, motif: string | null): number | null {
  const ids = motifPathIds(run, motif);
  if (ids.length === 0) return null;
  return Math.min(
    ...ids.map((id) => {
      const cut = run.cuts[id];
      if (cut === undefined) return 0;
      return cut.assisted ? ASSISTED_MOTIF_CUT : cut.accuracy;
    }),
  );
}

export function everyMotifCrisp(pieces: readonly Pick<CollectionPiece, "motifCutAccuracy">[]): number {
  const cuts = pieces.flatMap((piece) => (piece.motifCutAccuracy === null ? [] : [piece.motifCutAccuracy]));
  if (cuts.length === 0) return 0;
  const weakest = Math.min(...cuts);
  return clamp(100 - CRISP_SLOPE * Math.max(0, CRISP_MARK - weakest), 0, 100);
}
