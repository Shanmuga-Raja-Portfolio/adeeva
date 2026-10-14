import { clamp } from "./clamp";

export const MIN_PRICE_FACTOR = 0.1;
export const MAX_PRICE_FACTOR = 1.3;
export const SPILL_SHARE = 0.5;

export interface DemandItem {
  readonly appeal: number;
  readonly price: number;
  readonly fair: number;
}

export interface SaleSplit {
  readonly sold: readonly number[];
  readonly spilled: readonly number[];
  readonly unmet: number;
}

export function priceFactor(price: number, fair: number): number {
  return clamp(2 - price / fair, MIN_PRICE_FACTOR, MAX_PRICE_FACTOR);
}

export function demandShares(appeals: readonly number[]): number[] {
  const total = appeals.reduce((sum, appeal) => sum + Math.max(0, appeal), 0);
  return appeals.map((appeal) => (total > 0 ? Math.max(0, appeal) / total : 0));
}

export function wantedPortions(guests: number, perGuest: number, items: readonly DemandItem[]): number[] {
  const shares = demandShares(items.map((item) => item.appeal));
  return items.map((item, index) =>
    Math.round(guests * perGuest * (shares[index] ?? 0) * priceFactor(item.price, item.fair)),
  );
}

function roomiest(rooms: readonly number[]): number {
  let best = -1;
  rooms.forEach((room, index) => {
    if (room > 0 && (best === -1 || room > (rooms[best] ?? 0))) best = index;
  });
  return best;
}

export function sellWithSpill(wanted: readonly number[], stock: readonly number[]): SaleSplit {
  const sold = wanted.map((want, index) => Math.max(0, Math.min(want, stock[index] ?? 0)));
  const excess = wanted.reduce((sum, want, index) => sum + Math.max(0, want - (stock[index] ?? 0)), 0);
  const rooms = sold.map((count, index) => Math.max(0, (stock[index] ?? 0) - count));
  const spilled = sold.map(() => 0);
  let spill = Math.floor(excess * SPILL_SHARE);
  for (let index = roomiest(rooms); spill > 0 && index !== -1; index = roomiest(rooms)) {
    rooms[index] = (rooms[index] ?? 0) - 1;
    spilled[index] = (spilled[index] ?? 0) + 1;
    spill -= 1;
  }
  const given = spilled.reduce((sum, count) => sum + count, 0);
  return { sold: sold.map((count, index) => count + (spilled[index] ?? 0)), spilled, unmet: excess - given };
}
