import { CELLS_PER_PACK } from "../content/floor";
import type { DecorId } from "../content/decor";
import { decorById, floorById, furnitureById, isDecorId, lightById, paintById, roomById } from "./catalog";
import type { GameState } from "./gameState";
import { isHomeRoom, type MakeoverRun, type RoomPlan } from "./makeoverRun";
import { openProject } from "./projectUpdate";
import { purseLeft, spendPurse } from "./purse";
import { addGoods, roomStock, takeGoods } from "./homeShelf";
import { cartIsEmpty, EMPTY_CART, shortfallOf, type Cart } from "./stock";

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
  const paints = [plan.wallPaint, plan.featurePaint, plan.lowerPaint].flatMap((id) =>
    id === null ? [] : [id],
  );
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

export function planShortfall(state: Pick<GameState, "stock" | "larkspur">, run: MakeoverRun): Cart {
  return run.locked ? EMPTY_CART : shortfallOf(roomStock(state, run), planCart(run));
}

export function plannedSpend(state: GameState, run: MakeoverRun): number {
  return run.spend + cartCost(state, planShortfall(state, run));
}

function fundsIssue(state: GameState, run: MakeoverRun, cost: number, what: string): string | null {
  if (!isHomeRoom(run))
    return state.coins < cost ? `${what} costs ${cost} coins and you have ${state.coins}.` : null;
  const project = openProject(state);
  if (project === null) return "This home project has finished.";
  const left = purseLeft(project);
  if (left >= cost || state.profile.difficulty === "relaxed") return null;
  return `${what} costs ${cost} coins and the purse has ${left}. Top up the purse first.`;
}

function pay(state: GameState, run: MakeoverRun, cost: number): GameState | null {
  if (isHomeRoom(run)) return spendPurse(state, cost);
  return state.coins < cost ? null : { ...state, coins: state.coins - cost };
}

export function buyPlanIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run === null || run.stage !== "shop") return "Visit the warehouse first.";
  const missing = planShortfall(state, run);
  if (cartIsEmpty(missing)) return "You already have everything on your plan.";
  return fundsIssue(state, run, cartCost(state, missing), "That");
}

export function buyPlan(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || buyPlanIssue(state) !== null) return state;
  const missing = planShortfall(state, run);
  const cost = cartCost(state, missing);
  const paid = pay(state, run, cost);
  if (paid === null) return state;
  return { ...addGoods(paid, run, missing), activeRun: { ...run, spend: run.spend + cost } };
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
  return fundsIssue(state, run, decorPrice(state, decorId), decorById(decorId).name);
}

export function buyDecor(state: GameState, decorId: DecorId): GameState {
  const run = state.activeRun;
  if (run === null || buyDecorIssue(state, decorId) !== null) return state;
  const price = decorPrice(state, decorId);
  const paid = pay(state, run, price);
  if (paid === null) return state;
  return { ...addGoods(paid, run, decorCart(decorId)), activeRun: { ...run, spend: run.spend + price } };
}

export function lockRun(
  state: GameState,
  run: MakeoverRun,
): { readonly state: GameState; readonly run: MakeoverRun } | null {
  if (run.locked) return { state, run };
  const needed = planCart(run);
  if (!cartIsEmpty(shortfallOf(roomStock(state, run), needed))) return null;
  return { state: takeGoods(state, run, needed), run: { ...run, locked: true } };
}

export function lockRoom(state: GameState): GameState | null {
  const run = state.activeRun;
  if (run === null) return null;
  if (run.locked) return state;
  const locked = lockRun(state, run);
  return locked === null ? null : { ...locked.state, activeRun: locked.run };
}
