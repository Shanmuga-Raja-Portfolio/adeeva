import type { ColourId, MaterialId } from "../../../engine/palette";
import type { StyleTag } from "../../../engine/styleTag";
import type { Decoration, Design, DressRun } from "./dressRun";
import { dressColours, dressMaterials, dressTags } from "./dressTags";
import { grainScore } from "./grainScore";
import { requiredPieces } from "./requiredPieces";
import { requiredSeams } from "./requiredSeams";
import { runSpend } from "./runSpend";
import { seamAccuracy } from "./seamAccuracy";

export interface PieceResult {
  readonly pieceId: string;
  readonly fabricId: string | null;
  readonly cut: boolean;
  readonly assembled: boolean;
  readonly cutAccuracy: number;
  readonly grainScore: number;
}

export interface SeamResult {
  readonly seamId: string;
  readonly progress: number;
  readonly accuracy: number;
}

export interface DressSnapshot {
  readonly design: Design;
  readonly pieces: readonly PieceResult[];
  readonly seams: readonly SeamResult[];
  readonly decorations: readonly Decoration[];
  readonly spend: number;
  readonly tags: readonly StyleTag[];
  readonly colours: readonly ColourId[];
  readonly materials: readonly MaterialId[];
}

export interface ConstructionCount {
  readonly piecesTotal: number;
  readonly piecesCut: number;
  readonly piecesAssembled: number;
  readonly seamsTotal: number;
  readonly seamsSewn: number;
}

export function snapshotRun(run: DressRun): DressSnapshot {
  const assembledPieces = new Set(Object.values(run.assembly));
  const pieces = requiredPieces(run.design).map((entry): PieceResult => {
    const placement = run.placements[entry.piece.id];
    const cut = entry.fabricId !== null && run.cutFabrics.includes(entry.fabricId);
    return {
      pieceId: entry.piece.id,
      fabricId: entry.fabricId,
      cut,
      assembled: assembledPieces.has(entry.piece.id),
      cutAccuracy: cut ? (run.cutAccuracy[entry.piece.id] ?? 0) : 0,
      grainScore: placement === undefined ? 0 : grainScore(entry.piece, placement.rotation),
    };
  });
  const seams = requiredSeams(run.design).map((entry): SeamResult => {
    const sewn = run.seams[entry.seam.id];
    return {
      seamId: entry.seam.id,
      progress: sewn?.progress ?? 0,
      accuracy: sewn === undefined ? 0 : seamAccuracy(sewn),
    };
  });
  return {
    design: run.design,
    pieces,
    seams,
    decorations: run.decorations,
    spend: runSpend(run),
    tags: dressTags(run.design, run.placements, run.decorations),
    colours: dressColours(run.design),
    materials: dressMaterials(run.design),
  };
}

export function constructionCount(snapshot: DressSnapshot): ConstructionCount {
  return {
    piecesTotal: snapshot.pieces.length,
    piecesCut: snapshot.pieces.filter((piece) => piece.cut).length,
    piecesAssembled: snapshot.pieces.filter((piece) => piece.assembled).length,
    seamsTotal: snapshot.seams.length,
    seamsSewn: snapshot.seams.filter((seam) => seam.progress >= 1).length,
  };
}

export function isConstructionComplete(snapshot: DressSnapshot): boolean {
  const count = constructionCount(snapshot);
  return (
    count.piecesTotal > 0 &&
    count.piecesCut === count.piecesTotal &&
    count.piecesAssembled === count.piecesTotal &&
    count.seamsSewn === count.seamsTotal
  );
}
