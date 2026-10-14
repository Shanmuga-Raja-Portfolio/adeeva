import type { DishDef } from "../content/dish";
import { ingredientById } from "./catalog";

const COST_STEP_TENTHS = 5;
const FAIR_MULTIPLIER = 3;

export function dishCostTenths(dish: DishDef): number {
  const raw = dish.ingredients.reduce((sum, id) => sum + ingredientById(id).costTenths, 0);
  return Math.ceil(raw / COST_STEP_TENTHS) * COST_STEP_TENTHS;
}

export function dishCost(dish: DishDef): number {
  return dishCostTenths(dish) / 10;
}

export function fairPrice(dish: DishDef): number {
  return Math.round((FAIR_MULTIPLIER * dishCostTenths(dish)) / 10);
}
