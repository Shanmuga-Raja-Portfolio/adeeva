import type { RngState } from "../../../engine/rng";
import { drawDistinct } from "../../../engine/rngDraw";
import { PATH_RULES } from "../content/career";
import { CRITIC_IDS, REVIEW_LINES, type CriticId } from "../content/critic";
import type { DishId } from "../content/dish";
import { dishById } from "./catalog";
import { fairPrice } from "./dishCost";
import type { CriticNight, Review } from "./path";
import { serviceNightsBetween } from "./pathCalendar";

export const STRONG_FOOD = 85;
export const GOOD_FOOD = 70;
export const WARM_ON_TIME = 0.9;
export const VALUE_SHARE = 1.1;
export const GOOD_SPOONS = 4;

export function rollCriticNights(startDay: number, rng: RngState): [CriticNight[], RngState] {
  const nights = serviceNightsBetween(startDay, startDay + PATH_RULES.seasonDays - 1);
  const [days, afterDays] = drawDistinct(rng, nights, CRITIC_IDS.length);
  const [critics, afterCritics] = drawDistinct(afterDays, CRITIC_IDS, days.length);
  const sorted = [...days].sort((a, b) => a - b);
  const visits = sorted.flatMap((day, index): CriticNight[] => {
    const criticId = critics[index];
    return criticId === undefined ? [] : [{ criticId, day }];
  });
  return [visits, afterCritics];
}

export interface CriticTicket {
  readonly dishIds: readonly DishId[];
  readonly prices: readonly number[];
  readonly quality: number;
  readonly onTime: number;
}

export function fairValue(ticket: CriticTicket): boolean {
  return ticket.dishIds.every((dishId, index) => {
    const price = ticket.prices[index] ?? 0;
    return price <= VALUE_SHARE * fairPrice(dishById(dishId));
  });
}

export function reviewSpoons(ticket: CriticTicket): number {
  const food = ticket.quality >= STRONG_FOOD ? 2 : ticket.quality >= GOOD_FOOD ? 1 : 0;
  const warmth = ticket.onTime >= WARM_ON_TIME ? 1 : 0;
  return 1 + food + warmth + (fairValue(ticket) ? 1 : 0);
}

export function writeReview(criticId: CriticId, day: number, dishId: DishId, ticket: CriticTicket): Review {
  const dish = dishById(dishId).name;
  const food =
    ticket.quality >= STRONG_FOOD
      ? REVIEW_LINES.foodHigh
      : ticket.quality >= GOOD_FOOD
        ? REVIEW_LINES.foodGood
        : REVIEW_LINES.foodGentle;
  return {
    criticId,
    day,
    dishId,
    spoons: reviewSpoons(ticket),
    lines: [
      food.replace("{dish}", dish),
      ticket.onTime >= WARM_ON_TIME ? REVIEW_LINES.warm : REVIEW_LINES.slow,
      fairValue(ticket) ? REVIEW_LINES.fair : REVIEW_LINES.dear,
    ],
  };
}
