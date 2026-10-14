import { average } from "../../../engine/average";
import { starsForScore } from "../../../engine/score";
import type { CuisineId } from "../content/cuisine";
import { dishById } from "./catalog";
import { qualityFrom, type StepAccuracies } from "./dishQuality";
import { lampFactor, ticketOnTime } from "./serviceRail";
import type { ServiceDish, ServiceRun, ServiceStep, ServiceTicket } from "./service";

export const TEAM_ACCURACY = 0.6;
export const TEAM_ON_TIME = 0.4;
export const HANDLED_WEIGHT = 50;
export const QUALITY_SHARE = 0.65;
export const ON_TIME_SHARE = 0.25;
export const HANDLED_SHARE = 0.1;
export const CLEAN_STARS = 4;

const TEAM_STEP: ServiceStep = { accuracy: TEAM_ACCURACY, by: "team", assisted: false };

export interface DishScore {
  readonly cuisine: CuisineId;
  readonly quality: number;
  readonly handled: boolean;
}

export interface ServiceScore {
  readonly score: number;
  readonly averageQuality: number;
  readonly averageOnTime: number;
  readonly handledShare: number;
  readonly handledDishes: number;
  readonly teamTickets: number;
  readonly dishes: readonly DishScore[];
}

function dishAccuracies(dish: ServiceDish): Partial<StepAccuracies> {
  const def = dishById(dish.dishId);
  return Object.fromEntries(def.steps.map((step, index) => [step.kind, dish.steps[index]?.accuracy ?? 0]));
}

function handledWeight(dish: ServiceDish): number {
  const def = dishById(dish.dishId);
  return def.steps.reduce(
    (sum, step, index) => sum + (dish.steps[index]?.by === "player" ? step.weight : 0),
    0,
  );
}

export function teamFinish(service: ServiceRun, at: number): ServiceRun {
  return {
    ...service,
    lastAt: at,
    tickets: service.tickets.map((ticket) => {
      if (ticket.sentAt !== null) return ticket;
      return {
        ...ticket,
        team: true,
        railAt: ticket.railAt ?? at,
        sentAt: at,
        dishes: ticket.dishes.map((dish) => ({
          ...dish,
          steps: dish.steps.map((step) => step ?? TEAM_STEP),
          doneAt: dish.doneAt ?? at,
        })),
      };
    }),
  };
}

export function servedQuality(service: ServiceRun, ticket: ServiceTicket, dish: ServiceDish): number {
  const lamp = ticket.team || ticket.sentAt === null ? 1 : lampFactor(service, dish, ticket.sentAt);
  return Math.round(qualityFrom(dishById(dish.dishId), dishAccuracies(dish), 1) * lamp);
}

export function servedOnTime(service: ServiceRun, ticket: ServiceTicket): number {
  return ticket.team ? TEAM_ON_TIME : ticketOnTime(service, ticket);
}

export function scoreService(service: ServiceRun): ServiceScore {
  const dishes: DishScore[] = service.tickets.flatMap((ticket) =>
    ticket.dishes.map((dish) => ({
      cuisine: dishById(dish.dishId).cuisine,
      quality: servedQuality(service, ticket, dish),
      handled: handledWeight(dish) >= HANDLED_WEIGHT,
    })),
  );
  const onTimes = service.tickets.map((ticket) => servedOnTime(service, ticket));
  const averageQuality = average(dishes.map((dish) => dish.quality));
  const averageOnTime = average(onTimes);
  const handledDishes = dishes.filter((dish) => dish.handled).length;
  const handledShare = dishes.length === 0 ? 0 : handledDishes / dishes.length;
  const score = Math.round(
    100 *
      (QUALITY_SHARE * (averageQuality / 100) + ON_TIME_SHARE * averageOnTime + HANDLED_SHARE * handledShare),
  );
  return {
    score,
    averageQuality: Math.round(averageQuality),
    averageOnTime: Math.round(averageOnTime * 100) / 100,
    handledShare: Math.round(handledShare * 1000) / 1000,
    handledDishes,
    teamTickets: service.tickets.filter((ticket) => ticket.team).length,
    dishes,
  };
}

export function cleanService(result: ServiceScore): boolean {
  const handled = result.dishes.filter((dish) => dish.handled);
  return handled.length > 0 && handled.every((dish) => starsForScore(dish.quality) >= CLEAN_STARS);
}
