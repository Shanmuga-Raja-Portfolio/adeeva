export const BOARD_SIZE_IDS = ["short", "long", "panel"] as const;
export type BoardSizeId = (typeof BOARD_SIZE_IDS)[number];

export interface BoardSizeDef {
  readonly id: BoardSizeId;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly priceFactor: number;
}

export const BOARD_SIZES: readonly BoardSizeDef[] = [
  { id: "short", name: "Short board", width: 60, height: 20, priceFactor: 0.55 },
  { id: "long", name: "Long board", width: 120, height: 20, priceFactor: 1 },
  { id: "panel", name: "Wide panel", width: 90, height: 40, priceFactor: 1.6 },
];
