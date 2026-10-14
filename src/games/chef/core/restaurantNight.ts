import { hoursShortfallReason } from "../../../engine/dayHours";
import { drawInt } from "../../../engine/rngDraw";
import { trendMatches } from "../../../engine/trendMarket";
import { PATH_RULES, PATH_SERVICE } from "../content/career";
import type { UpgradeId } from "../content/upgrade";
import { dishById } from "./catalog";
import type { GameState } from "./gameState";
import { recordMoney, restaurantOf, withPath, type RestaurantState, type SalePlan } from "./path";
import { isServiceNight, nightOfWeek } from "./pathCalendar";
import { menuReady } from "./pathMenu";
import { cooksOnShift, onShift, teamPayFor } from "./restaurantTeam";
import { runStartIssue } from "./runLifecycle";
import { planSale, plateCoins } from "./salePlan";
import type { ServicePlan, ServiceRun } from "./service";
import { openService, servicePlan } from "./serviceSetup";
import { queueStoryTrigger } from "./storyQueue";

export const GARDEN_SEATS = 6;
export const BIGGER_SEATS = 8;
export const BASE_GUESTS = 10;
export const PREP_FRIDGE_DISHES = 2;
export const TAVI_PREP_DISHES = 3;
export const PREP_ACCURACY = 0.8;
export const CRITIC_TABLE = 7;

function owns(state: GameState, id: UpgradeId): boolean {
  return state.upgrades.includes(id);
}

export function seatsTonight(state: GameState, restaurant: RestaurantState, night: number): number {
  const staff = onShift(restaurant, night);
  const seats =
    PATH_RULES.baseSeats +
    PATH_RULES.seatsPerCook * cooksOnShift(restaurant, night).length +
    (owns(state, "garden-tables") ? GARDEN_SEATS : 0) +
    (owns(state, "bigger-room") ? BIGGER_SEATS : 0);
  return staff.some((member) => member.role === "host") ? seats : Math.min(seats, PATH_RULES.hostlessSeats);
}

export function guestsTonight(state: GameState, restaurant: RestaurantState, night: number): number {
  const tags = restaurant.menu.flatMap((entry) => dishById(entry.dishId).tags);
  const hot = trendMatches([...new Set(tags)], state.trends.current).length;
  const host = onShift(restaurant, night).some((member) => member.role === "host")
    ? PATH_RULES.hostGuests
    : 0;
  const wish = Math.round(BASE_GUESTS + state.reputation / 5 + state.buzz / 10 + 2 * hot) + host;
  return Math.min(seatsTonight(state, restaurant, night), wish);
}

export function forecastNight(state: GameState, restaurant: RestaurantState, day: number): SalePlan {
  const night = nightOfWeek(day);
  return planSale(state, {
    day,
    guests: guestsTonight(state, restaurant, night),
    seats: seatsTonight(state, restaurant, night),
    menu: restaurant.menu,
    carried: restaurant.carried,
    crowdTags: [],
  });
}

export function openNightIssues(state: GameState): string[] {
  const restaurant = restaurantOf(state);
  if (restaurant === null) return ["Only a restaurant opens for the night."];
  const day = state.calendar.day;
  const issues: string[] = [];
  if (!isServiceNight(day))
    issues.push(nightOfWeek(day) === 1 ? "Today is the Market Run. Plan the week!" : "Today is Family Meal.");
  if (state.lastShiftDay === day) issues.push("You already opened tonight.");
  const busy = runStartIssue(state) ?? hoursShortfallReason(state.calendar, PATH_RULES.serviceHours);
  if (busy !== null) issues.push(busy);
  const menu = menuReady(state);
  if (menu !== null) issues.push(menu);
  if (restaurant.menu.every((entry) => entry.par === 0)) issues.push("Get some portions ready first.");
  if (cooksOnShift(restaurant, nightOfWeek(day)).length === 0)
    issues.push("Put a cook on tonight's schedule.");
  const plan = forecastNight(state, restaurant, day);
  const cost = plan.ingredients;
  if (state.coins < cost) issues.push(`The Market Run needs ${cost} coins. Get ready a few fewer portions.`);
  else {
    const pay = teamPayFor(restaurant, nightOfWeek(day));
    if (state.coins - cost + plateCoins(plan) < pay)
      issues.push(
        `Tonight's team pay is ${pay} coins. Put fewer people on tonight or get ready more portions.`,
      );
  }
  return issues;
}

function nightPlan(state: GameState, restaurant: RestaurantState, night: number): ServicePlan {
  const base = servicePlan(state, PATH_SERVICE.night);
  const clean = onShift(restaurant, night).some((member) => member.role === "clean");
  return {
    ...base,
    targetSeconds: clean ? Math.round(base.targetSeconds * PATH_RULES.cleanTeamTarget) : base.targetSeconds,
    lampHoldSeconds: owns(state, "warming-pass") ? PATH_RULES.warmingPassHold : base.lampHoldSeconds,
    pans: owns(state, "second-ring") ? 2 : 1,
  };
}

function prepFridge(state: GameState, restaurant: RestaurantState, service: ServiceRun, plan: SalePlan) {
  if (!owns(state, "prep-fridge")) return service;
  const tavi = onShift(restaurant, nightOfWeek(plan.day)).some((member) => member.id === "tavi");
  const top = [...plan.dishes]
    .sort((a, b) => b.wanted - a.wanted)
    .slice(0, tavi ? TAVI_PREP_DISHES : PREP_FRIDGE_DISHES)
    .map((dish) => dish.dishId);
  return {
    ...service,
    tickets: service.tickets.map((ticket) => ({
      ...ticket,
      dishes: ticket.dishes.map((dish) => {
        const first = dishById(dish.dishId).steps[0];
        if (!top.includes(dish.dishId) || first?.kind !== "chop" || dish.steps[0] !== null) return dish;
        return {
          ...dish,
          steps: dish.steps.map((step, index) =>
            index === 0 ? { accuracy: PREP_ACCURACY, by: "staff" as const, assisted: false } : step,
          ),
        };
      }),
    })),
  };
}

export function openNight(state: GameState): GameState {
  const restaurant = restaurantOf(state);
  if (restaurant === null || openNightIssues(state).length > 0) return state;
  const day = state.calendar.day;
  const night = nightOfWeek(day);
  const plan = forecastNight(state, restaurant, day);
  const opened = openService(state, {
    kind: "night",
    cuisines: [],
    plan: nightPlan(state, restaurant, night),
    helpers: cooksOnShift(restaurant, night).map((member) => member.id),
    special: null,
    pool: restaurant.menu.map((entry) => entry.dishId),
  });
  const service = opened.service;
  if (opened === state || service === null) return state;
  const critic = restaurant.criticNights.find((visit) => visit.day === day);
  const [pick, rng] = drawInt(opened.rng, 0, service.tickets.length - 1);
  const spotlight = critic === undefined ? null : (service.tickets[pick]?.id ?? null);
  const prepped = prepFridge(state, restaurant, service, plan);
  const tickets = prepped.tickets.map((ticket) =>
    ticket.id === spotlight ? { ...ticket, table: CRITIC_TABLE } : ticket,
  );
  const withService: GameState = {
    ...opened,
    rng: critic === undefined ? opened.rng : rng,
    coins: opened.coins - plan.ingredients,
    service: { ...prepped, tickets, spotlight },
  };
  const booked = recordMoney(
    withPath(withService, { ...restaurant, tonight: plan, carried: [] }),
    "ingredients",
    plan.ingredients,
  );
  return critic === undefined ? booked : queueStoryTrigger(booked, "first-critic-visit");
}
