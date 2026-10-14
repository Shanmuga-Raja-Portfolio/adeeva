import { clamp } from "../../../engine/clamp";
import { trendMatches } from "../../../engine/trendMarket";
import { CAREER } from "../content/career";
import type { DishId } from "../content/dish";
import { dishById, isDishId } from "./catalog";
import { cardFor } from "./dishDiary";
import { dishCost, fairPrice } from "./dishCost";
import type { GameState } from "./gameState";
import { isDishUnlocked } from "./mastery";
import type { Special } from "./service";

export const SPECIAL_PORTIONS = 12;
export const SPECIAL_SHARE = 0.5;
export const TREND_APPEAL = 0.1;
export const EXPERT_APPEAL = 0.1;
export const STAR_APPEAL = 0.05;

export function priceRange(dishId: DishId): readonly [number, number] {
  const dish = dishById(dishId);
  return [Math.ceil(dishCost(dish) + 1), 2 * fairPrice(dish)];
}

export function specialIssues(state: GameState, special: Special): string[] {
  if (!isDishId(special.dishId)) return ["Pick a dish for the special."];
  const dish = dishById(special.dishId);
  const issues: string[] = [];
  if (!isDishUnlocked(state.mastery, dish)) issues.push("That dish is still locked.");
  const [low, high] = priceRange(special.dishId);
  if (!Number.isInteger(special.price) || special.price < low || special.price > high)
    issues.push(`Set a price from ${low} to ${high} coins.`);
  return issues;
}

export function specialAppeal(state: GameState, dishId: DishId): number {
  const dish = dishById(dishId);
  const matches = trendMatches(dish.tags, state.trends.current).length;
  const expert = state.mastery[dish.cuisine] >= CAREER.expertMastery ? EXPERT_APPEAL : 0;
  const card = cardFor(state.platingCards, dishId);
  const stars = card === null ? 0 : STAR_APPEAL * (card.stars - 3);
  return 1 + TREND_APPEAL * matches + expert + stars;
}

export function priceFactor(price: number, fair: number): number {
  return clamp(2 - price / fair, 0.1, 1.3);
}

export interface SpecialForecast {
  readonly sold: number;
  readonly bonus: number;
  readonly soldOut: boolean;
  readonly leftOver: number;
}

export function specialForecast(state: GameState, special: Special): SpecialForecast {
  const dish = dishById(special.dishId);
  const appeal = specialAppeal(state, special.dishId);
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
