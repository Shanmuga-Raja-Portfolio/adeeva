import type { Cell } from "../../../content/furniture";
import type { RoomTemplate } from "../../../content/roomTemplate";
import type { PlacedPiece } from "../../../core";
import { freeCells } from "./visitorSpots";

export interface TreatSpots {
  readonly table: Cell | null;
  readonly easel: Cell | null;
}

export function treatSpots(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  taken: readonly Cell[],
): TreatSpots {
  const used = new Set(taken.map(([col, row]) => `${col},${row}`));
  const open = freeCells(room, pieces).filter(([col, row]) => !used.has(`${col},${row}`));
  const front = open.filter(([, row]) => row === room.rows - 1);
  const easel =
    front.find(([col]) => col === room.doorCol - 1) ??
    front.find(([col]) => col === room.doorCol + 2) ??
    null;
  const table =
    front
      .filter(([col]) => col < room.doorCol - 1 && (easel === null || Math.abs(col - easel[0]) > 1))
      .sort((a, b) => Math.abs(a[0] - 1) - Math.abs(b[0] - 1))[0] ?? null;
  return { table, easel };
}
