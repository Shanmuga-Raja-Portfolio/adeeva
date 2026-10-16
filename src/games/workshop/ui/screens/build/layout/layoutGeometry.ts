import type { PartDef } from "../../../../content/product";
import { boardSizeById, type OwnedBoard, type QuarterTurn } from "../../../../core";

const BOARD_GAP = 8;
const CANVAS_MARGIN = 3;
const COLUMN_WIDTH = 126;
const WIDE_BENCH_BOARDS = 4;

export interface BoardSlot {
  readonly board: OwnedBoard;
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

interface Footprint {
  readonly width: number;
  readonly height: number;
}

export function benchColumns(boards: readonly OwnedBoard[]): number {
  return boards.length > WIDE_BENCH_BOARDS ? 2 : 1;
}

export function canvasWidth(columns: number): number {
  return COLUMN_WIDTH * columns;
}

export function boardSlots(boards: readonly OwnedBoard[], columns = 1): BoardSlot[] {
  const slots: BoardSlot[] = [];
  let y = CANVAS_MARGIN;
  for (let start = 0; start < boards.length; start += columns) {
    const row = boards.slice(start, start + columns);
    let rowHeight = 0;
    row.forEach((board, column) => {
      const size = boardSizeById(board.size);
      slots.push({
        board,
        x: CANVAS_MARGIN + column * COLUMN_WIDTH,
        y,
        width: size.width,
        height: size.height,
      });
      rowHeight = Math.max(rowHeight, size.height);
    });
    y += rowHeight + BOARD_GAP;
  }
  return slots;
}

export function canvasHeight(slots: readonly BoardSlot[]): number {
  if (slots.length === 0) return 40;
  return Math.max(...slots.map((slot) => slot.y + slot.height)) + CANVAS_MARGIN;
}

export function footprint(part: PartDef, rotation: QuarterTurn): Footprint {
  return rotation % 180 === 0
    ? { width: part.width, height: part.height }
    : { width: part.height, height: part.width };
}

export function slotAt(slots: readonly BoardSlot[], x: number, y: number): BoardSlot | null {
  return (
    slots.find(
      (slot) =>
        x >= slot.x - 2 && x <= slot.x + slot.width + 2 && y >= slot.y - 2 && y <= slot.y + slot.height + 2,
    ) ?? null
  );
}

export function nextTurn(rotation: QuarterTurn): QuarterTurn {
  return rotation === 0 ? 90 : rotation === 90 ? 180 : rotation === 180 ? 270 : 0;
}
