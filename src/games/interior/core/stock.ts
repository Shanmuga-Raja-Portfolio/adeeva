import { zeroCounts } from "../../../engine/count";
import { DECOR_IDS, type DecorId } from "../content/decor";
import { FLOOR_IDS, type FloorId } from "../content/floor";
import { FURNITURE_IDS, type FurnitureId } from "../content/furniture";
import { LIGHT_IDS, type LightId } from "../content/light";
import { PAINT_IDS, type PaintId } from "../content/paint";

export interface Stock {
  readonly furniture: Readonly<Record<FurnitureId, number>>;
  readonly paints: Readonly<Record<PaintId, number>>;
  readonly floors: Readonly<Record<FloorId, number>>;
  readonly lights: Readonly<Record<LightId, number>>;
  readonly decor: Readonly<Record<DecorId, number>>;
}

type StockShelf = keyof Stock;

export type Cart = { readonly [K in StockShelf]: Readonly<Partial<Stock[K]>> };

export function emptyStock(): Stock {
  return {
    furniture: zeroCounts(FURNITURE_IDS),
    paints: zeroCounts(PAINT_IDS),
    floors: zeroCounts(FLOOR_IDS),
    lights: zeroCounts(LIGHT_IDS),
    decor: zeroCounts(DECOR_IDS),
  };
}

export const EMPTY_CART: Cart = { furniture: {}, paints: {}, floors: {}, lights: {}, decor: {} };

const SHELVES: readonly StockShelf[] = ["furniture", "paints", "floors", "lights", "decor"];

function cartEntries(cart: Cart, shelf: StockShelf): [string, number][] {
  return Object.entries(cart[shelf]).filter(
    (entry): entry is [string, number] => typeof entry[1] === "number",
  );
}

export function cartIsEmpty(cart: Cart): boolean {
  return SHELVES.every((shelf) => cartEntries(cart, shelf).every(([, count]) => count <= 0));
}

export function changeStock(stock: Stock, cart: Cart, sign: 1 | -1): Stock {
  const next = { ...stock } as Record<StockShelf, Record<string, number>>;
  for (const shelf of SHELVES) {
    const counts = { ...stock[shelf] } as Record<string, number>;
    for (const [id, count] of cartEntries(cart, shelf)) counts[id] = (counts[id] ?? 0) + sign * count;
    next[shelf] = counts;
  }
  return next as unknown as Stock;
}

export function shortfallOf(stock: Stock, needed: Cart): Cart {
  const missing = (shelf: StockShelf) =>
    Object.fromEntries(
      cartEntries(needed, shelf).flatMap(([id, count]) => {
        const gap = count - ((stock[shelf] as Record<string, number>)[id] ?? 0);
        return gap > 0 ? [[id, gap]] : [];
      }),
    );
  return {
    furniture: missing("furniture"),
    paints: missing("paints"),
    floors: missing("floors"),
    lights: missing("lights"),
    decor: missing("decor"),
  };
}

export type CartLine =
  | { readonly shelf: "furniture"; readonly id: FurnitureId; readonly count: number }
  | { readonly shelf: "paints"; readonly id: PaintId; readonly count: number }
  | { readonly shelf: "floors"; readonly id: FloorId; readonly count: number }
  | { readonly shelf: "lights"; readonly id: LightId; readonly count: number }
  | { readonly shelf: "decor"; readonly id: DecorId; readonly count: number };

function shelfLines<K extends string>(counts: Readonly<Partial<Record<K, number>>>, ids: readonly K[]) {
  return ids.flatMap((id) => {
    const count = counts[id] ?? 0;
    return count > 0 ? [{ id, count }] : [];
  });
}

export function cartLines(cart: Cart): CartLine[] {
  return [
    ...shelfLines(cart.furniture, FURNITURE_IDS).map((line): CartLine => ({ shelf: "furniture", ...line })),
    ...shelfLines(cart.paints, PAINT_IDS).map((line): CartLine => ({ shelf: "paints", ...line })),
    ...shelfLines(cart.floors, FLOOR_IDS).map((line): CartLine => ({ shelf: "floors", ...line })),
    ...shelfLines(cart.lights, LIGHT_IDS).map((line): CartLine => ({ shelf: "lights", ...line })),
    ...shelfLines(cart.decor, DECOR_IDS).map((line): CartLine => ({ shelf: "decor", ...line })),
  ];
}
