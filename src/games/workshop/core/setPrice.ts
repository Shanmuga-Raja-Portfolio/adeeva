import type { ProductId } from "../content/product";
import { hammersFor, type WoodId } from "../content/wood";
import { productById, woodById } from "./catalog";

export const HARMONY_MARK = 80;
export const HARMONY_BONUS = 1.1;
export const ROSETTE_BONUS = 1.1;
const FINE_WOOD_STEP = 0.15;

export interface SetPriceInput {
  readonly products: readonly ProductId[];
  readonly quality: number;
  readonly woodId: WoodId;
  readonly harmony: number;
  readonly rosette: boolean;
}

export function fineWoodFactor(woodId: WoodId): number {
  return 1 + FINE_WOOD_STEP * (hammersFor(woodById(woodId)) - 1);
}

export function setPrice(input: SetPriceInput): number {
  const showPrice = input.products.reduce((sum, productId) => sum + productById(productId).showPrice, 0);
  const craft = 0.6 + (0.6 * input.quality) / 100;
  const harmony = input.harmony >= HARMONY_MARK ? HARMONY_BONUS : 1;
  const rosette = input.rosette ? ROSETTE_BONUS : 1;
  return Math.round(showPrice * craft * fineWoodFactor(input.woodId) * harmony * rosette);
}
