import type { Cell } from "../../../content/furniture";
import type { RoomTemplate } from "../../../content/roomTemplate";
import { walkThrough, type PlacedPiece } from "../../../core";

function distance(a: Cell, b: Cell): number {
  return Math.hypot(a[0] - b[0], (a[1] - b[1]) * 1.4);
}

export function freeCells(room: RoomTemplate, pieces: readonly PlacedPiece[]): Cell[] {
  return [...walkThrough(room, pieces, 1).reached]
    .map((key): Cell => {
      const [col, row] = key.split(",").map(Number);
      return [col ?? 0, row ?? 0];
    })
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

export function visitorSpots(room: RoomTemplate, pieces: readonly PlacedPiece[], count: number): Cell[] {
  const free = freeCells(room, pieces);
  if (free.length === 0) return [];
  const centre: Cell = [(room.cols - 1) / 2, room.rows - 1.5];
  const first = free.reduce((best, cell) => (distance(cell, centre) < distance(best, centre) ? cell : best));
  const chosen: Cell[] = [first];
  while (chosen.length < Math.min(count, free.length)) {
    const next = free.reduce((best, cell) => {
      const near = Math.min(...chosen.map((other) => distance(cell, other)));
      const bestNear = Math.min(...chosen.map((other) => distance(best, other)));
      return near > bestNear ? cell : best;
    });
    chosen.push(next);
  }
  return chosen;
}
