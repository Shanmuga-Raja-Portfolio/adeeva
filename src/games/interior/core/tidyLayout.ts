import type { FurnitureId } from "../content/furniture";
import type { RoomTemplate } from "../content/roomTemplate";
import { furnitureById } from "./catalog";
import {
  cellKey,
  pieceCells,
  pieceUseCells,
  placementProblem,
  roomCells,
  TURNS,
  type PlacedPiece,
} from "./floorPlan";
import { walkThrough } from "./walkThrough";

export interface TidyPiece {
  readonly id: string;
  readonly furnitureId: FurnitureId;
}

function wallContact(room: RoomTemplate, piece: PlacedPiece): number {
  return pieceCells(piece).filter((cell) => cell[0] === 0 || cell[1] === 0 || cell[0] === room.cols - 1)
    .length;
}

function tuckBonus(placed: readonly PlacedPiece[], piece: PlacedPiece): number {
  if (!furnitureById(piece.furnitureId).tucksIn) return 0;
  const desks = new Set(
    placed
      .filter((entry) => furnitureById(entry.furnitureId).holdsLamp)
      .flatMap((entry) => pieceUseCells(entry))
      .map(cellKey),
  );
  return pieceCells(piece).some((cell) => desks.has(cellKey(cell))) ? 1 : 0;
}

function bestPose(room: RoomTemplate, placed: readonly PlacedPiece[], item: TidyPiece): PlacedPiece | null {
  let best: { piece: PlacedPiece; score: number } | null = null;
  for (const rotation of TURNS)
    for (const [col, row] of roomCells(room)) {
      const piece: PlacedPiece = { ...item, col, row, rotation };
      if (placementProblem(room, placed, piece) !== null) continue;
      const flow = walkThrough(room, [...placed, piece], 1).flow;
      const score = flow * 1000 + tuckBonus(placed, piece) * 100 + wallContact(room, piece);
      if (best === null || score > best.score + 1e-9) best = { piece, score };
    }
  return best === null ? null : best.piece;
}

function sizeOf(item: TidyPiece): number {
  const def = furnitureById(item.furnitureId);
  return def.tucksIn ? -1 : def.width * def.depth + def.useCells.length;
}

export function tidyLayout(room: RoomTemplate, items: readonly TidyPiece[]): PlacedPiece[] | null {
  const ordered = [...items].sort((a, b) => sizeOf(b) - sizeOf(a));
  const placed: PlacedPiece[] = [];
  for (const item of ordered) {
    const piece = bestPose(room, placed, item);
    if (piece === null) return null;
    placed.push(piece);
  }
  return items.flatMap((item) => placed.filter((piece) => piece.id === item.id));
}
