import { zeroCounts } from "../../../engine/count";
import { EXTRA_IDS, type ExtraId } from "../content/extra";
import { METAL_IDS, type MetalId } from "../content/metal";
import { STOCK_SIZE_IDS, type StockSizeId } from "../content/stockSize";
import { STONE_IDS, type StoneId } from "../content/stone";
import { metalById, stockSizeById } from "./catalog";

type MetalStock = Readonly<Record<StockSizeId, number>>;

export interface Stock {
  readonly metal: Readonly<Record<MetalId, MetalStock>>;
  readonly stones: Readonly<Record<StoneId, number>>;
  readonly extras: Readonly<Record<ExtraId, number>>;
  readonly clips: number;
}

export function emptyStock(): Stock {
  return {
    metal: Object.fromEntries(METAL_IDS.map((id) => [id, zeroCounts(STOCK_SIZE_IDS)])) as Record<
      MetalId,
      MetalStock
    >,
    stones: zeroCounts(STONE_IDS),
    extras: zeroCounts(EXTRA_IDS),
    clips: 0,
  };
}

export function stockPrice(metalId: MetalId, size: StockSizeId): number {
  return Math.round(metalById(metalId).price * stockSizeById(size).priceFactor);
}

export function ownedSizes(stock: Stock, metalId: MetalId): StockSizeId[] {
  return STOCK_SIZE_IDS.filter((size) => stock.metal[metalId][size] > 0);
}

export function withMetal(stock: Stock, metalId: MetalId, size: StockSizeId, change: number): Stock {
  const current = stock.metal[metalId];
  return { ...stock, metal: { ...stock.metal, [metalId]: { ...current, [size]: current[size] + change } } };
}

export function withStones(stock: Stock, stoneId: StoneId, change: number): Stock {
  return { ...stock, stones: { ...stock.stones, [stoneId]: stock.stones[stoneId] + change } };
}

export function withExtra(stock: Stock, extraId: ExtraId, change: number): Stock {
  return { ...stock, extras: { ...stock.extras, [extraId]: stock.extras[extraId] + change } };
}
