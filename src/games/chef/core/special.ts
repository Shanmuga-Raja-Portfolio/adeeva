import { priceFactor } from "../../../engine/demandShare";
import type { DishId } from "../content/dish";
import { dishById, isDishId } from "./catalog";
import { dishAppeal } from "./dishDemand";
import { dishCost, fairPrice } from "./dishCost";
import type { GameState } from "./gameState";
import { isDishUnlocked } from "./mastery";
import type { Special } from "./service";

export const SPECIAL_PORTIONS = 12;
export const SPECIAL_SHARE = 0.5;

export function priceRange(dishId: DishId): readonly [number, number] {
  const dish = dishById(dishId);
  return [Math.ceil(dishCost(dish) + 1), 2 * fairPrice(dish)];
}

export function isFairPrice(dishId: DishId, price: number): boolean {
  const [low, high] = priceRange(dishId);
  return Number.isInteger(price) && price >= low && price <= high;
}

export function specialIssues(state: GameState, special: Special): string[] {
  if (!isDishId(special.dishId)) return ["Pick a dish for the special."];
  const dish = dishById(special.dishId);
  const issues: string[] = [];
  if (!isDishUnlocked(state.mastery, dish)) issues.push("That dish is still locked.");
  if (!isFairPrice(special.dishId, special.price)) {
    const [low, high] = priceRange(special.dishId);
    issues.push(`Set a price from ${low} to ${high} coins.`);
  }
  return issues;
}

export interface SpecialForecast {
  readonly sold: number;
  readonly bonus: number;
  readonly soldOut: boolean;
  readonly leftOver: number;
}

export function specialForecast(state: GameState, special: Special): SpecialForecast {
  const dish = dishById(special.dishId);
  const appeal = dishAppeal(state, special.dishId);
  const sold = Math.min(
    SPECIAL_PORTIONS,
    Math.round(SPECIAL_PORTIONS * appeal * priceFactor(special.price, fairPrice(dish))),
  );
  const leftOver = special.price - dishCost(dish);
  return {
    sold,
    bonus: Math.max(0, Math.round(SPECIAL_SHARE * leftOver * sold)),
    soldOut: sold >= SPECIAL_PORTIONS,
    leftOver,
  };
}
