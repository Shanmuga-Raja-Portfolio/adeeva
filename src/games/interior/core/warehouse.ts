import { CELLS_PER_PACK } from "../content/floor";
import type { DecorId } from "../content/decor";
import { decorById, floorById, furnitureById, isDecorId, lightById, paintById, roomById } from "./catalog";
import type { GameState } from "./gameState";
import type { MakeoverRun, RoomPlan } from "./makeoverRun";
import { cartIsEmpty, changeStock, EMPTY_CART, shortfallOf, type Cart } from "./stock";

const TRADE_SAVING = 1;

function countIds<T extends string>(ids: readonly T[]): Partial<Record<T, number>> {
  const counts: Partial<Record<T, number>> = {};
  for (const id of ids) counts[id] = (counts[id] ?? 0) + 1;
  return counts;
}

function floorPacks(run: Pick<MakeoverRun, "brief">): number {
  const room = roomById(run.brief.roomId);
  return Math.ceil((room.cols * room.rows) / CELLS_PER_PACK);
}

export function planCart(run: Pick<MakeoverRun, "brief" | "plan">): Cart {
  const plan: RoomPlan = run.plan;
  const paints = [plan.wallPaint, plan.featurePaint].flatMap((id) => (id === null ? [] : [id]));
  return {
    furniture: countIds(plan.pieces.map((piece) => piece.furnitureId)),
    paints: countIds(paints),
    floors: plan.floor === null ? {} : { [plan.floor]: floorPacks(run) },
    lights: countIds(plan.lights),
    decor: {},
  };
}

function priced<K extends string>(
  counts: Readonly<Partial<Record<K, number>>>,
  price: (id: K) => number,
  saving: number,
): number {
  return (Object.keys(counts) as K[]).reduce(
    (total, id) => total + Math.max(1, price(id) - saving) * (counts[id] ?? 0),
    0,
  );
}

export function cartCost(state: Pick<GameState, "upgrades">, cart: Cart): number {
  const saving = state.upgrades.includes("trade-card") ? TRADE_SAVING : 0;
  return (
    priced(cart.furniture, (id) => furnitureById(id).price, saving) +
    priced(cart.paints, (id) => paintById(id).price, saving) +
    priced(cart.floors, (id) => floorById(id).pricePerPack, saving) +
    priced(cart.lights, (id) => lightById(id).price, saving) +
    priced(cart.decor, (id) => decorById(id).price, saving)
  );
}

export function planShortfall(state: Pick<GameState, "stock">, run: MakeoverRun): Cart {
  return run.locked ? EMPTY_CART : shortfallOf(state.stock, planCart(run));
}

export function plannedSpend(state: GameState, run: MakeoverRun): number {
  return run.spend + cartCost(state, planShortfall(state, run));
}

export function buyPlanIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run === null || run.stage !== "shop") return "Visit the warehouse first.";
  const missing = planShortfall(state, run);
  if (cartIsEmpty(missing)) return "You already have everything on your plan.";
  const cost = cartCost(state, missing);
  if (state.coins < cost) return `That costs ${cost} coins and you have ${state.coins}.`;
  return null;
}

export function buyPlan(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || buyPlanIssue(state) !== null) return state;
  const missing = planShortfall(state, run);
  const cost = cartCost(state, missing);
  return {
    ...state,
    coins: state.coins - cost,
    stock: changeStock(state.stock, missing, 1),
    activeRun: { ...run, spend: run.spend + cost },
  };
}

function decorCart(decorId: DecorId): Cart {
  return { ...EMPTY_CART, decor: { [decorId]: 1 } };
}

export function decorPrice(state: Pick<GameState, "upgrades">, decorId: DecorId): number {
  return cartCost(state, decorCart(decorId));
}

export function buyDecorIssue(state: GameState, decorId: DecorId): string | null {
  const run = state.activeRun;
  if (!isDecorId(decorId)) return "That decor does not exist.";
  if (run === null || (run.stage !== "shop" && run.stage !== "style"))
    return "Decor is sold at the warehouse and the Decor Bin.";
  const price = decorPrice(state, decorId);
  if (state.coins < price) return `${decorById(decorId).name} costs ${price} coins.`;
  return null;
}

export function buyDecor(state: GameState, decorId: DecorId): GameState {
  const run = state.activeRun;
  if (run === null || buyDecorIssue(state, decorId) !== null) return state;
  const price = decorPrice(state, decorId);
  return {
    ...state,
    coins: state.coins - price,
    stock: changeStock(state.stock, decorCart(decorId), 1),
    activeRun: { ...run, spend: run.spend + price },
  };
}

export function lockRoom(state: GameState): GameState | null {
  const run = state.activeRun;
  if (run === null) return null;
  if (run.locked) return state;
  const needed = planCart(run);
  if (!cartIsEmpty(shortfallOf(state.stock, needed))) return null;
  return { ...state, stock: changeStock(state.stock, needed, -1), activeRun: { ...run, locked: true } };
}
