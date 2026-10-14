import { idNumber } from "../../../engine/idNumber";
import type { BoardSizeId } from "../content/boardSize";
import type { WoodId } from "../content/wood";

export interface Knot {
  readonly x: number;
  readonly y: number;
  readonly r: number;
}

export interface OwnedBoard {
  readonly id: string;
  readonly woodId: WoodId;
  readonly size: BoardSizeId;
  readonly knots: readonly Knot[];
  readonly cost: number;
  readonly spare: boolean;
}

export function boardNumber(boardId: string): number {
  return idNumber(boardId, "board");
}
