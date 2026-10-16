import type { Cell, FurnitureDef, FurnitureId } from "../content/furniture";
import type { RoomTemplate } from "../content/roomTemplate";
import { furnitureById } from "./catalog";

export const TURNS = [0, 90, 180, 270] as const;
export type Turn = (typeof TURNS)[number];

interface PiecePose {
  readonly col: number;
  readonly row: number;
  readonly rotation: Turn;
}

export interface PlacedPiece extends PiecePose {
  readonly id: string;
  readonly furnitureId: FurnitureId;
}

export interface PieceShape {
  readonly cells: readonly Cell[];
  readonly useCells: readonly Cell[];
  readonly width: number;
  readonly depth: number;
}

export type PlacementProblem = "outside" | "overlap" | "door" | "through" | "window";

export function isTurn(value: number): value is Turn {
  return TURNS.some((turn) => turn === value);
}

export function cellKey(cell: Cell): string {
  return `${cell[0]},${cell[1]}`;
}

function turnOnce(cell: Cell): Cell {
  return [-cell[1], cell[0]];
}

function turned(cell: Cell, rotation: Turn): Cell {
  let current = cell;
  for (let step = 0; step < rotation / 90; step += 1) current = turnOnce(current);
  return current;
}

function footprint(def: FurnitureDef): Cell[] {
  return Array.from({ length: def.width * def.depth }, (_, index): Cell => [
    index % def.width,
    Math.floor(index / def.width),
  ]);
}

export function pieceShape(furnitureId: FurnitureId, rotation: Turn): PieceShape {
  const def = furnitureById(furnitureId);
  const cells = footprint(def).map((cell) => turned(cell, rotation));
  const minX = Math.min(...cells.map((cell) => cell[0]));
  const minY = Math.min(...cells.map((cell) => cell[1]));
  const shift = (cell: Cell): Cell => [cell[0] - minX, cell[1] - minY];
  const sideways = rotation === 90 || rotation === 270;
  return {
    cells: cells.map(shift),
    useCells: def.useCells.map((cell) => shift(turned(cell, rotation))),
    width: sideways ? def.depth : def.width,
    depth: sideways ? def.width : def.depth,
  };
}

function offset(cells: readonly Cell[], pose: PiecePose): Cell[] {
  return cells.map((cell): Cell => [cell[0] + pose.col, cell[1] + pose.row]);
}

export function pieceCells(piece: PlacedPiece | (PiecePose & { readonly furnitureId: FurnitureId })): Cell[] {
  return offset(pieceShape(piece.furnitureId, piece.rotation).cells, piece);
}

export function pieceUseCells(
  piece: PlacedPiece | (PiecePose & { readonly furnitureId: FurnitureId }),
): Cell[] {
  return offset(pieceShape(piece.furnitureId, piece.rotation).useCells, piece);
}

export function inRoom(room: RoomTemplate, cell: Cell): boolean {
  return cell[0] >= 0 && cell[1] >= 0 && cell[0] < room.cols && cell[1] < room.rows;
}

export function roomCells(room: RoomTemplate): Cell[] {
  return Array.from({ length: room.cols * room.rows }, (_, index): Cell => [
    index % room.cols,
    Math.floor(index / room.cols),
  ]);
}

export function doorSwing(room: RoomTemplate): Cell[] {
  return [
    [room.doorCol, room.rows - 2],
    [room.doorCol + 1, room.rows - 2],
    [room.doorCol, room.rows - 1],
    [room.doorCol + 1, room.rows - 1],
  ];
}

export function throughDoorCell(room: RoomTemplate): Cell | null {
  return room.throughRow === null ? null : [room.cols - 1, room.throughRow];
}

function windowCells(room: RoomTemplate): Cell[] {
  return room.windows.flatMap((window) =>
    Array.from({ length: window.to - window.from }, (_, step): Cell =>
      window.wall === "back" ? [window.from + step, 0] : [0, window.from + step],
    ),
  );
}

export function isWallEdge(room: RoomTemplate, cell: Cell): boolean {
  return inRoom(room, cell) && (cell[1] === 0 || cell[0] === 0 || cell[0] === room.cols - 1);
}

function keySet(cells: readonly Cell[]): Set<string> {
  return new Set(cells.map(cellKey));
}

export function solidCells(pieces: readonly PlacedPiece[]): Set<string> {
  return keySet(
    pieces.filter((piece) => !furnitureById(piece.furnitureId).tucksIn).flatMap((piece) => pieceCells(piece)),
  );
}

export function placementProblem(
  room: RoomTemplate,
  pieces: readonly PlacedPiece[],
  candidate: PiecePose & { readonly furnitureId: FurnitureId; readonly id: string },
): PlacementProblem | null {
  const def = furnitureById(candidate.furnitureId);
  const cells = pieceCells(candidate);
  if (!cells.every((cell) => inRoom(room, cell))) return "outside";
  const taken = keySet(
    pieces.filter((piece) => piece.id !== candidate.id).flatMap((piece) => pieceCells(piece)),
  );
  if (cells.some((cell) => taken.has(cellKey(cell)))) return "overlap";
  const door = keySet(doorSwing(room));
  if (cells.some((cell) => door.has(cellKey(cell)))) return "door";
  const through = throughDoorCell(room);
  if (through !== null && cells.some((cell) => cellKey(cell) === cellKey(through))) return "through";
  if (def.tall && !room.roofWindow) {
    const windows = keySet(windowCells(room));
    if (cells.some((cell) => windows.has(cellKey(cell)))) return "window";
  }
  return null;
}
