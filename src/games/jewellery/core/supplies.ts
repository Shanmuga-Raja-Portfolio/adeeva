import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import { CLIP_SET, type ExtraId } from "../content/extra";
import type { MetalId } from "../content/metal";
import { STOCK_SIZE_IDS, type StockSizeId } from "../content/stockSize";
import type { StoneId } from "../content/stone";
import {
  extraById,
  isExtraId,
  isMetalId,
  isStockSizeId,
  isStoneId,
  metalById,
  productById,
  stockSizeById,
  stoneById,
} from "./catalog";
import { metalLocked, stoneLocked } from "./design";
import type { GameState } from "./gameState";
import { currentLineSheet } from "./lineSheet";
import type { PieceRun } from "./pieceRun";
import { stockPrice, withExtra, withMetal, withStones, type Stock } from "./stock";

const SUPPLY_VISIT_HOURS = 1;
export const MAX_CART_COUNT = 9;

interface MetalLine {
  readonly metalId: MetalId;
  readonly size: StockSizeId;
  readonly count: number;
}

export interface SupplyCart {
  readonly metal: readonly MetalLine[];
  readonly stones: Readonly<Partial<Record<StoneId, number>>>;
  readonly extras: Readonly<Partial<Record<ExtraId, number>>>;
  readonly clips: number;
}

export const EMPTY_CART: SupplyCart = { metal: [], stones: {}, extras: {}, clips: 0 };

function entries<K extends string>(record: Readonly<Partial<Record<K, number>>>): [K, number][] {
  return Object.entries(record) as [K, number][];
}

function isCartCount(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= MAX_CART_COUNT;
}

export function cartCost(cart: SupplyCart): number {
  return (
    cart.metal.reduce((sum, line) => sum + stockPrice(line.metalId, line.size) * line.count, 0) +
    entries(cart.stones).reduce((sum, [id, count]) => sum + stoneById(id).price * count, 0) +
    entries(cart.extras).reduce((sum, [id, count]) => sum + extraById(id).price * count, 0) +
    cart.clips * CLIP_SET.price
  );
}

function cartIsWellFormed(cart: SupplyCart): boolean {
  const metalKeys = cart.metal.map((line) => `${line.metalId}:${line.size}`);
  return (
    cart.metal.every(
      (line) => isMetalId(line.metalId) && isStockSizeId(line.size) && isCartCount(line.count),
    ) &&
    new Set(metalKeys).size === metalKeys.length &&
    entries(cart.stones).every(([id, count]) => isStoneId(id) && isCartCount(count)) &&
    entries(cart.extras).every(([id, count]) => isExtraId(id) && isCartCount(count)) &&
    Number.isInteger(cart.clips) &&
    cart.clips >= 0 &&
    cart.clips <= MAX_CART_COUNT
  );
}

function cartIsEmpty(cart: SupplyCart): boolean {
  return (
    cart.metal.length === 0 &&
    Object.keys(cart.stones).length === 0 &&
    Object.keys(cart.extras).length === 0 &&
    cart.clips === 0
  );
}

function lockedReasons(state: GameState, cart: SupplyCart): string[] {
  return [
    ...cart.metal
      .filter((line) => metalLocked(state, line.metalId))
      .map((line) => `${metalById(line.metalId).name} is still locked.`),
    ...entries(cart.stones)
      .filter(([id]) => stoneLocked(state, id))
      .map(([id]) => `${stoneById(id).name} is still locked.`),
  ];
}

export function supplyVisitHours(state: GameState): number {
  const run = state.activeRun;
  return run !== null && run.stage === "supplies" && run.suppliesHourPaid ? 0 : SUPPLY_VISIT_HOURS;
}

export function canBuySupplies(state: GameState, cart: SupplyCart): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "supplies") return actionCheck(["Open the Supply Cabinet first."]);
  if (!cartIsWellFormed(cart)) return actionCheck(["That basket has something odd in it."]);
  if (cartIsEmpty(cart)) return actionCheck(["Pick something to buy first."]);
  const reasons = lockedReasons(state, cart);
  const cost = cartCost(cart);
  if (cost > state.coins) reasons.push(`That costs ${cost} coins and you have ${state.coins}.`);
  const hours = hoursShortfallReason(state.calendar, supplyVisitHours(state));
  if (hours !== null) reasons.push(hours);
  return actionCheck(reasons);
}

function restocked(stock: Stock, cart: SupplyCart): Stock {
  let next = stock;
  for (const line of cart.metal) next = withMetal(next, line.metalId, line.size, line.count);
  for (const [id, count] of entries(cart.stones)) next = withStones(next, id, count);
  for (const [id, count] of entries(cart.extras)) next = withExtra(next, id, count);
  return { ...next, clips: next.clips + cart.clips };
}

export function buySupplies(state: GameState, cart: SupplyCart): GameState {
  if (!canBuySupplies(state, cart).ok) return state;
  const spent = spendHours(state, supplyVisitHours(state));
  if (spent === null || spent.activeRun === null) return state;
  return {
    ...spent,
    coins: spent.coins - cartCost(cart),
    stock: restocked(spent.stock, cart),
    activeRun: { ...spent.activeRun, suppliesHourPaid: true },
  };
}

export function canonicalSizes(run: PieceRun): StockSizeId[] {
  const placements = Object.values(productById(run.design.productId).canonical);
  return STOCK_SIZE_IDS.filter((size) => placements.some((placement) => placement.size === size));
}

function metalCovered(state: GameState, run: PieceRun): boolean {
  const metalId = run.design.metalId;
  if (metalId === null) return false;
  const owned = state.stock.metal[metalId];
  return (
    owned.wide > 0 ||
    currentLineSheet(state, run) !== null ||
    canonicalSizes(run).every((size) => owned[size] > 0)
  );
}

function extraNeeds(run: PieceRun): Partial<Record<ExtraId, number>> {
  const needs: Partial<Record<ExtraId, number>> = {};
  for (const requirement of run.brief?.requiredExtras ?? [])
    needs[requirement.extraId] = (needs[requirement.extraId] ?? 0) + requirement.count;
  return needs;
}

export function shortfall(state: GameState, run: PieceRun): SupplyCart {
  const product = productById(run.design.productId);
  const { metalId, stoneId } = run.design;
  const metal: MetalLine[] =
    metalId === null || metalCovered(state, run)
      ? []
      : canonicalSizes(run)
          .filter((size) => state.stock.metal[metalId][size] === 0)
          .map((size) => ({ metalId, size, count: 1 }));
  const stones: Partial<Record<StoneId, number>> = {};
  const fromPot = run.purpose.kind === "collection";
  const missingStones = stoneId === null || fromPot ? 0 : product.seats.length - state.stock.stones[stoneId];
  if (stoneId !== null && missingStones > 0) stones[stoneId] = missingStones;
  const extras: Partial<Record<ExtraId, number>> = {};
  for (const [id, count] of entries(extraNeeds(run))) {
    const missing = count - state.stock.extras[id];
    if (missing > 0) extras[id] = missing;
  }
  const holder = product.holder;
  const firstHolder = holder?.choices[0];
  if (holder !== null && firstHolder !== undefined) {
    const owned = holder.choices.reduce((sum, id) => sum + state.stock.extras[id] + (extras[id] ?? 0), 0);
    const missing = holder.count - owned;
    if (missing > 0) extras[firstHolder] = (extras[firstHolder] ?? 0) + missing;
  }
  const clips = Math.max(0, product.clipSets - state.stock.clips);
  return { metal, stones, extras, clips };
}

export function hasShortfall(cart: SupplyCart): boolean {
  return !cartIsEmpty(cart);
}

export function shortfallLines(cart: SupplyCart): string[] {
  return [
    ...cart.metal.map(
      (line) => `${metalById(line.metalId).name} ${stockSizeById(line.size).name.toLowerCase()}`,
    ),
    ...entries(cart.stones).map(([id, count]) => `${count} × ${stoneById(id).name}`),
    ...entries(cart.extras).map(([id, count]) => `${count} × ${extraById(id).name}`),
    ...(cart.clips > 0 ? [CLIP_SET.name] : []),
  ];
}

export function suppliesIssues(state: GameState, run: PieceRun): string[] {
  const missing = shortfall(state, run);
  return hasShortfall(missing) ? shortfallLines(missing).map((line) => `Still need: ${line}.`) : [];
}
