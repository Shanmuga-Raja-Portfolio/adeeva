import { average } from "../../../engine/average";
import { drawDistinct } from "../../../engine/rngDraw";
import { starsForScore } from "../../../engine/score";
import { PATH_RULES } from "../content/career";
import { GUEST_NOTES, type GuestNoteBand } from "../content/guestNote";
import type { GameState } from "./gameState";
import { writeReview, type CriticTicket } from "./critics";
import {
  recordMoney,
  recordUnserved,
  restaurantOf,
  withPath,
  type NightReport,
  type Review,
  type SalePlan,
  type StockCount,
} from "./path";
import { nightOfWeek } from "./pathCalendar";
import { teamPayFor } from "./restaurantTeam";
import { plateCoins, unservedCoins } from "./salePlan";
import type { ServiceRun } from "./service";
import { servedOnTime, servedQuality, type ServiceScore } from "./serviceScore";

export const CHARMER_TIP_SHARE = 1.1;
export const GLOWING_SCORE = 85;
export const HAPPY_SCORE = 70;

export function noteBand(score: number): GuestNoteBand {
  if (score >= GLOWING_SCORE) return "glowing";
  return score >= HAPPY_SCORE ? "happy" : "gentle";
}

export function tipsFor(state: GameState, score: number, guests: number): number {
  if (score < PATH_RULES.happyScore) return 0;
  const tips = PATH_RULES.tipPerGuest * guests;
  return state.profile.trait === "charmer" ? Math.round(tips * CHARMER_TIP_SHARE) : tips;
}

function criticReview(state: GameState, service: ServiceRun, plan: SalePlan): Review | null {
  const restaurant = restaurantOf(state);
  const visit = restaurant?.criticNights.find((entry) => entry.day === plan.day);
  const ticket = service.tickets.find((entry) => entry.id === service.spotlight);
  const first = ticket?.dishes[0];
  if (visit === undefined || ticket === undefined || first === undefined) return null;
  const dishIds = ticket.dishes.map((dish) => dish.dishId);
  const details: CriticTicket = {
    dishIds,
    prices: dishIds.map((id) => plan.dishes.find((dish) => dish.dishId === id)?.price ?? 0),
    quality: Math.round(average(ticket.dishes.map((dish) => servedQuality(service, ticket, dish)))),
    onTime: servedOnTime(service, ticket),
  };
  return writeReview(visit.criticId, plan.day, first.dishId, details);
}

function carriedOver(state: GameState, plan: SalePlan): StockCount[] {
  if (!state.upgrades.includes("walk-in-fridge")) return [];
  return plan.dishes
    .map((dish) => ({ dishId: dish.dishId, count: Math.floor(dish.leftover / 2) }))
    .filter((entry) => entry.count > 0);
}

export function settleNight(state: GameState, service: ServiceRun, result: ServiceScore): GameState {
  const restaurant = restaurantOf(state);
  const plan = restaurant?.tonight ?? null;
  if (restaurant === null || plan === null) return state;
  const review = criticReview(state, service, plan);
  const [notes, rng] = drawDistinct(state.rng, GUEST_NOTES[noteBand(result.score)], PATH_RULES.notesPerNight);
  const report: NightReport = {
    plan,
    score: result.score,
    stars: starsForScore(result.score),
    plateCoins: plateCoins(plan),
    tips: tipsFor(state, result.score, plan.guests),
    teamPay: teamPayFor(restaurant, nightOfWeek(plan.day)),
    carried: carriedOver(state, plan),
    review,
    notes,
  };
  const season = {
    ...restaurant.season,
    scores: [...restaurant.season.scores, result.score],
    critics:
      review === null
        ? restaurant.season.critics
        : [...restaurant.season.critics, { criticId: review.criticId, spoons: review.spoons }],
  };
  const settled = withPath(
    { ...state, rng, coins: state.coins + report.plateCoins + report.tips - report.teamPay },
    {
      ...restaurant,
      season,
      tonight: null,
      lastNight: report,
      carried: report.carried,
      reviews:
        review === null ? restaurant.reviews : [...restaurant.reviews, review].slice(-PATH_RULES.maxReviews),
      notes: [...restaurant.notes, ...notes].slice(-PATH_RULES.maxNotes),
    },
  );
  const booked = recordMoney(
    recordMoney(recordMoney(settled, "plates", report.plateCoins), "tips", report.tips),
    "team",
    report.teamPay,
  );
  return recordUnserved(booked, unservedCoins(plan, report.carried));
}
