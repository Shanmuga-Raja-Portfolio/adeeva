import { PART_CATEGORIES, type PartCategory, type PatternPieceDef } from "../content/garmentPart";
import { partById } from "./catalog";
import type { Design } from "./dressRun";

export interface RequiredPiece {
  readonly piece: PatternPieceDef;
  readonly category: PartCategory;
  readonly partId: string;
  readonly fabricId: string | null;
}

export function requiredPieces(design: Design): RequiredPiece[] {
  return PART_CATEGORIES.flatMap((category) => {
    const partId = design.parts[category];
    const part = partId === null ? undefined : partById(partId);
    if (part === undefined) return [];
    return part.pieces.map((piece) => ({
      piece,
      category,
      partId: part.id,
      fabricId: design.fabrics[category],
    }));
  });
}

export function requiredPiece(design: Design, pieceId: string): RequiredPiece | undefined {
  return requiredPieces(design).find((entry) => entry.piece.id === pieceId);
}

export function piecesOnFabric(design: Design, fabricId: string): RequiredPiece[] {
  return requiredPieces(design).filter((entry) => entry.fabricId === fabricId);
}
