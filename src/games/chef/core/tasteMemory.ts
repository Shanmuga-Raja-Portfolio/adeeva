import type { DishId } from "../content/dish";
import type { TastePoint } from "../content/seasoning";

export interface TasteMemory {
  readonly dishId: DishId;
  readonly point: TastePoint;
  readonly savoury: number;
}

export function rememberTaste(memory: readonly TasteMemory[], entry: TasteMemory): readonly TasteMemory[] {
  return [...memory.filter((item) => item.dishId !== entry.dishId), entry];
}

export function tasteMemoryFor(memory: readonly TasteMemory[], dishId: DishId): TasteMemory | null {
  return memory.find((item) => item.dishId === dishId) ?? null;
}
