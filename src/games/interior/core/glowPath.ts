import type { Cell } from "../content/furniture";
import type { RoomTemplate } from "../content/roomTemplate";
import { cellKey, doorSwing, inRoom, solidCells, throughDoorCell, type PlacedPiece } from "./floorPlan";
import { spotLight, type PlacedLight } from "./lighting";

export const GLOW_HUNDREDTHS = 30;

const STEPS: readonly Cell[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

export function walkPath(room: RoomTemplate, pieces: readonly PlacedPiece[]): Cell[] | null {
  const target = throughDoorCell(room);
  if (target === null) return null;
  const solid = solidCells(pieces);
  const from = new Map<string, string | null>();
  const queue: Cell[] = doorSwing(room).filter((cell) => !solid.has(cellKey(cell)));
  for (const cell of queue) from.set(cellKey(cell), null);
  const cells = new Map<string, Cell>(queue.map((cell) => [cellKey(cell), cell]));
  for (let index = 0; index < queue.length; index += 1) {
    const cell = queue[index];
    if (cell === undefined) continue;
    if (cellKey(cell) === cellKey(target)) break;
    for (const step of STEPS) {
      const next: Cell = [cell[0] + step[0], cell[1] + step[1]];
      const key = cellKey(next);
      if (!inRoom(room, next) || solid.has(key) || from.has(key)) continue;
      from.set(key, cellKey(cell));
      cells.set(key, next);
      queue.push(next);
    }
  }
  if (!from.has(cellKey(target))) return null;
  const path: Cell[] = [];
  let key: string | null = cellKey(target);
  while (key !== null) {
    const cell = cells.get(key);
    if (cell !== undefined) path.unshift(cell);
    key = from.get(key) ?? null;
  }
  return path;
}

export interface GlowPath {
  readonly cells: readonly Cell[];
  readonly lit: readonly boolean[];
  readonly glowing: number;
}

export function glowPath(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  lights: readonly PlacedLight[],
): GlowPath | null {
  const cells = walkPath(room, pieces);
  if (cells === null) return null;
  const lit = cells.map(
    (cell) => spotLight({ pieceId: "path", cells: [cell] }, lights).hundredths >= GLOW_HUNDREDTHS,
  );
  return { cells, lit, glowing: lit.filter(Boolean).length };
}
