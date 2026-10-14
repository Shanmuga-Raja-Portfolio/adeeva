import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { colourById, isColourId, type ColourId } from "../../../engine/palette";
import type { FillingId } from "../content/filling";
import type { IngredientId } from "../content/ingredient";
import type { ToppingId } from "../content/topping";
import { runNeeds, type RunNeeds } from "./bakeNeeds";
import type { BakeRun } from "./bakeRun";
import {
  fillingById,
  ingredientById,
  isFillingId,
  isIngredientId,
  isToppingId,
  toppingById,
} from "./catalog";
import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import type { GameState, Pantry } from "./gameState";

export const GEL_POT_PRICE = 5;
export const GEL_POT_USES = 10;
export const MAX_CART_COUNT = 20;
export const PANTRY_VISIT_HOURS = 1;

export interface PantryCart {
  readonly ingredients: Readonly<Partial<Record<IngredientId, number>>>;
  readonly gels: readonly ColourId[];
  readonly fillings: Readonly<Partial<Record<FillingId, number>>>;
  readonly toppings: Readonly<Partial<Record<ToppingId, number>>>;
}

export const EMPTY_CART: PantryCart = { ingredients: {}, gels: [], fillings: {}, toppings: {} };

function entries<K extends string>(record: Readonly<Partial<Record<K, number>>>): [K, number][] {
  return Object.entries(record) as [K, number][];
}

export function cartCost(cart: PantryCart): number {
  return (
    entries(cart.ingredients).reduce((sum, [id, packs]) => sum + ingredientById(id).price * packs, 0) +
    cart.gels.length * GEL_POT_PRICE +
    entries(cart.fillings).reduce((sum, [id, jars]) => sum + fillingById(id).price * jars, 0) +
    entries(cart.toppings).reduce((sum, [id, count]) => sum + toppingById(id).price * count, 0)
  );
}

function isCount(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= MAX_CART_COUNT;
}

function cartIsWellFormed(cart: PantryCart): boolean {
  return (
    entries(cart.ingredients).every(([id, packs]) => isIngredientId(id) && isCount(packs)) &&
    cart.gels.every(isColourId) &&
    new Set(cart.gels).size === cart.gels.length &&
    entries(cart.fillings).every(([id, jars]) => isFillingId(id) && isCount(jars)) &&
    entries(cart.toppings).every(([id, count]) => isToppingId(id) && isCount(count))
  );
}

function cartIsEmpty(cart: PantryCart): boolean {
  return (
    Object.keys(cart.ingredients).length === 0 &&
    cart.gels.length === 0 &&
    Object.keys(cart.fillings).length === 0 &&
    Object.keys(cart.toppings).length === 0
  );
}

export function pantryVisitHours(state: GameState): number {
  const run = state.activeRun;
  return run !== null && run.stage === "pantry" && run.pantryHourPaid ? 0 : PANTRY_VISIT_HOURS;
}

export function canBuy(state: GameState, cart: PantryCart): ActionCheck {
  if (!cartIsWellFormed(cart)) return actionCheck(["That basket has something odd in it."]);
  if (cartIsEmpty(cart)) return actionCheck(["Add something to the basket first."]);
  if (state.coins < 0) return actionCheck(["Work a shift to refill the coin jar."]);
  const reasons: string[] = [];
  const cost = cartCost(cart);
  if (cost > state.coins) reasons.push(`That costs ${cost} coins and you have ${state.coins}.`);
  const hours = hoursShortfallReason(state.calendar, pantryVisitHours(state));
  if (hours !== null) reasons.push(hours);
  return actionCheck(reasons);
}

function restocked(pantry: Pantry, cart: PantryCart): Pantry {
  const ingredients = { ...pantry.ingredients };
  for (const [id, packs] of entries(cart.ingredients))
    ingredients[id] += packs * ingredientById(id).packAmount;
  const gels = { ...pantry.gels };
  for (const colour of cart.gels) gels[colour] = (gels[colour] ?? 0) + GEL_POT_USES;
  const fillings = { ...pantry.fillings };
  for (const [id, jars] of entries(cart.fillings)) fillings[id] += jars;
  const toppings = { ...pantry.toppings };
  for (const [id, count] of entries(cart.toppings)) toppings[id] += count;
  return { ingredients, gels, fillings, toppings };
}

export function buyPantry(state: GameState, cart: PantryCart): GameState {
  if (!canBuy(state, cart).ok) return state;
  const spent = spendHours(state, pantryVisitHours(state));
  if (spent === null) return state;
  const run = spent.activeRun;
  return {
    ...spent,
    coins: spent.coins - cartCost(cart),
    pantry: restocked(spent.pantry, cart),
    activeRun: run !== null && run.stage === "pantry" ? { ...run, pantryHourPaid: true } : run,
  };
}

export function shortfall(state: GameState, run: BakeRun): RunNeeds {
  const needs = runNeeds(run);
  const ingredients: Partial<Record<IngredientId, number>> = {};
  for (const [id, amount] of entries(needs.ingredients)) {
    const missing = amount - state.pantry.ingredients[id];
    if (missing > 0) ingredients[id] = missing;
  }
  const fillings: Partial<Record<FillingId, number>> = {};
  for (const [id, jars] of entries(needs.fillings)) {
    const missing = jars - state.pantry.fillings[id];
    if (missing > 0) fillings[id] = missing;
  }
  const toppings: Partial<Record<ToppingId, number>> = {};
  for (const [id, count] of entries(needs.toppings)) {
    const missing = count - state.pantry.toppings[id];
    if (missing > 0) toppings[id] = missing;
  }
  return {
    ingredients,
    gels: needs.gels.filter((colour) => (state.pantry.gels[colour] ?? 0) < 1),
    fillings,
    toppings,
  };
}

export function hasShortfall(needs: RunNeeds): boolean {
  return (
    Object.keys(needs.ingredients).length > 0 ||
    needs.gels.length > 0 ||
    Object.keys(needs.fillings).length > 0 ||
    Object.keys(needs.toppings).length > 0
  );
}

export function cartFor(needs: RunNeeds): PantryCart {
  const ingredients: Partial<Record<IngredientId, number>> = {};
  for (const [id, amount] of entries(needs.ingredients))
    ingredients[id] = Math.ceil(amount / ingredientById(id).packAmount);
  return { ingredients, gels: needs.gels, fillings: needs.fillings, toppings: needs.toppings };
}

export function shortfallLines(needs: RunNeeds): string[] {
  return [
    ...entries(needs.ingredients).map(([id, amount]) =>
      id === "eggs"
        ? `${amount} more ${amount === 1 ? "egg" : "eggs"}`
        : `${amount} g more ${ingredientById(id).name}`,
    ),
    ...needs.gels.map((colour) => `A pot of ${colourById(colour).name} icing gel`),
    ...entries(needs.fillings).map(
      ([id, jars]) => `${jars} ${jars === 1 ? "jar" : "jars"} of ${fillingById(id).name}`,
    ),
    ...entries(needs.toppings).map(([id, count]) => `${count} more ${toppingById(id).name}`),
  ];
}
