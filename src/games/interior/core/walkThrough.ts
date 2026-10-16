import { average } from "../../../engine/average";
import { clamp } from "../../../engine/clamp";
import type { Cell } from "../content/furniture";
import type { RoomTemplate } from "../content/roomTemplate";
import { furnitureById } from "./catalog";
import {
  cellKey,
  doorSwing,
  throughDoorCell,
  inRoom,
  pieceCells,
  pieceUseCells,
  roomCells,
  solidCells,
  type PlacedPiece,
} from "./floorPlan";

const ROOMY_TARGET = 0.4;
const REACH_WEIGHT = 0.75;
const ROOMY_WEIGHT = 0.25;

export interface Footprint {
  readonly pieceId: string;
  readonly cell: Cell;
  readonly reached: boolean;
}

interface WalkThrough {
  readonly reached: ReadonlySet<string>;
  readonly footprints: readonly Footprint[];
  readonly reach: number;
  readonly roomy: number;
  readonly freeShare: number;
  readonly flow: number;
  readonly throughReached: boolean | null;
}

const STEPS: readonly Cell[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function neighbours(cell: Cell): Cell[] {
  return STEPS.map((step): Cell => [cell[0] + step[0], cell[1] + step[1]]);
}

function reachedCells(room: RoomTemplate, pieces: readonly PlacedPiece[]): Set<string> {
  const solid = solidCells(pieces);
  const reached = new Set<string>();
  const queue: Cell[] = doorSwing(room).filter((cell) => !solid.has(cellKey(cell)));
  for (const cell of queue) reached.add(cellKey(cell));
  for (let index = 0; index < queue.length; index += 1) {
    const cell = queue[index];
    if (cell === undefined) continue;
    for (const next of neighbours(cell)) {
      const key = cellKey(next);
      if (!inRoom(room, next) || solid.has(key) || reached.has(key)) continue;
      reached.add(key);
      queue.push(next);
    }
  }
  return reached;
}

function pieceReach(piece: PlacedPiece, reached: ReadonlySet<string>): number | null {
  const def = furnitureById(piece.furnitureId);
  if (def.tucksIn) return null;
  if (def.needsNeighbour)
    return pieceCells(piece).some((cell) => neighbours(cell).some((next) => reached.has(cellKey(next))))
      ? 1
      : 0;
  const useCells = pieceUseCells(piece);
  if (useCells.length === 0) return null;
  return useCells.filter((cell) => reached.has(cellKey(cell))).length / useCells.length;
}

export function walkThrough(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  toleranceMultiplier: number,
): WalkThrough {
  const reached = reachedCells(room, pieces);
  const shares = pieces.flatMap((piece) => {
    const share = pieceReach(piece, reached);
    return share === null ? [] : [share];
  });
  const reach = shares.length === 0 ? 1 : average(shares);
  const solid = solidCells(pieces);
  const cells = roomCells(room);
  const freeShare = cells.filter((cell) => !solid.has(cellKey(cell))).length / cells.length;
  const roomy = clamp(freeShare / (ROOMY_TARGET / toleranceMultiplier), 0, 1);
  const footprints = pieces.flatMap((piece) =>
    pieceUseCells(piece)
      .filter((cell) => inRoom(room, cell))
      .map((cell) => ({ pieceId: piece.id, cell, reached: reached.has(cellKey(cell)) })),
  );
  const through = throughDoorCell(room);
  return {
    reached,
    footprints,
    throughReached: through === null ? null : reached.has(cellKey(through)),
    reach,
    roomy,
    freeShare,
    flow: REACH_WEIGHT * reach + ROOMY_WEIGHT * roomy,
  };
}
