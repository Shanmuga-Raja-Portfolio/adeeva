import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawItem } from "../../../engine/rngDraw";
import type { StoneId } from "../content/stone";
import { STONE_TINTS, type Shimmer, type StoneTint } from "../content/stoneTint";
import type { UpgradeId } from "../content/upgrade";
import { productById, spotByNumber, stoneById } from "./catalog";
import { slotStone } from "./collectionBrief";
import type { CollectionBrief, GemPick, GemStone } from "./collectionState";

export const TRAY_SIZE = 16;
const SHIMMER_FACTORS: Readonly<Record<Shimmer, number>> = { 1: 1, 2: 1.4, 3: 1.8 };
const SHIMMER_ROLL: readonly Shimmer[] = [1, 1, 1, 1, 2, 2, 2, 3, 3, 3];

export function gemPrice(stoneId: StoneId, shimmer: Shimmer, upgrades: readonly UpgradeId[]): number {
  const base = Math.round(stoneById(stoneId).price * SHIMMER_FACTORS[shimmer]);
  return shimmer === 2 && upgrades.includes("sorting-tray") ? base - 1 : base;
}

export function lineStoneNeeds(brief: CollectionBrief): ReadonlyMap<StoneId, number> {
  const needs = new Map<StoneId, number>();
  for (const productId of brief.products) {
    const stoneId = slotStone(brief, productId);
    if (stoneId !== null) needs.set(stoneId, (needs.get(stoneId) ?? 0) + productById(productId).seats.length);
  }
  return needs;
}

export function lineSeats(brief: CollectionBrief): number {
  return [...lineStoneNeeds(brief).values()].reduce((sum, count) => sum + count, 0);
}

export function gemBudget(brief: CollectionBrief, spot: number): number {
  return lineSeats(brief) * spotByNumber(spot).budgetPerSeat;
}

function gem(stoneId: StoneId, tint: StoneTint, shimmer: Shimmer, upgrades: readonly UpgradeId[]): GemStone {
  return { stoneId, tint, shimmer, price: gemPrice(stoneId, shimmer, upgrades), sold: false };
}

export function generateGemTray(
  brief: CollectionBrief,
  upgrades: readonly UpgradeId[],
  rng: RngState,
): [GemStone[], RngState] {
  const needs = [...lineStoneNeeds(brief).entries()];
  if (needs.length === 0) return [[], rng];
  let next = rng;
  const stones: GemStone[] = [];
  for (const [stoneId, count] of needs) {
    const [tint, afterTint] = drawItem(next, STONE_TINTS);
    next = afterTint;
    for (let seat = 0; seat < count; seat += 1) stones.push(gem(stoneId, tint, 1, upgrades));
  }
  const types = needs.map(([stoneId]) => stoneId);
  while (stones.length < TRAY_SIZE) {
    const [stoneId, afterType] = drawItem(next, types);
    const [tint, afterTint] = drawItem(afterType, STONE_TINTS);
    const [shimmer, afterShimmer] = drawItem(afterTint, SHIMMER_ROLL);
    next = afterShimmer;
    stones.push(gem(stoneId, tint, shimmer, upgrades));
  }
  return drawDistinct(next, stones, stones.length);
}

export function asPick(stone: GemPick): GemPick {
  return { stoneId: stone.stoneId, tint: stone.tint, shimmer: stone.shimmer };
}
