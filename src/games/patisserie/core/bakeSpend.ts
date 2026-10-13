import type { IngredientId } from "../content/ingredient";
import type { BakeRun } from "./bakeRun";
import { ingredientById, toppingById } from "./catalog";

export const GEL_USE_VALUE = 0.5;

export function ingredientValue(id: IngredientId, amount: number): number {
  const ingredient = ingredientById(id);
  return (amount * ingredient.price) / ingredient.packAmount;
}

export function toppingsValue(run: BakeRun): number {
  return run.toppings.reduce((sum, placed) => sum + toppingById(placed.toppingId).price, 0);
}

export function bakeSpend(run: BakeRun): number {
  return Math.round(run.ingredientValue + toppingsValue(run));
}
