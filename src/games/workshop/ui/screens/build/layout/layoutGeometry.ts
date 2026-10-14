import type { PartDef } from "../../../../content/product";
import { boardSizeById, type OwnedBoard, type QuarterTurn } from "../../../../core";

const BOARD_GAP = 8;
const CANVAS_MARGIN = 3;

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

export function boardSlots(boards: readonly OwnedBoard[]): BoardSlot[] {
  let y = CANVAS_MARGIN;
  return boards.map((board) => {
    const size = boardSizeById(board.size);
    const slot = { board, x: CANVAS_MARGIN, y, width: size.width, height: size.height };
    y += size.height + BOARD_GAP;
    return slot;
  });
}

export function canvasHeight(slots: readonly BoardSlot[]): number {
  const last = slots[slots.length - 1];
  return last === undefined ? 40 : last.y + last.height + CANVAS_MARGIN;
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
