export const STOCK_SIZE_IDS = ["sheet", "strip", "wide"] as const;
export type StockSizeId = (typeof STOCK_SIZE_IDS)[number];

export interface StockSizeDef {
  readonly id: StockSizeId;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  readonly priceFactor: number;
}

export const STOCK_SIZES: readonly StockSizeDef[] = [
  { id: "sheet", name: "Small sheet", width: 40, height: 40, priceFactor: 1 },
  { id: "strip", name: "Strip", width: 80, height: 10, priceFactor: 0.7 },
  { id: "wide", name: "Wide sheet", width: 80, height: 40, priceFactor: 1.8 },
];
