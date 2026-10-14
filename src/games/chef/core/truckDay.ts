import { hoursShortfallReason } from "../../../engine/dayHours";
import { starsForScore } from "../../../engine/score";
import { RIBBONS_FOR_FAVOURITE } from "../content/award";
import { PATH_RULES, PATH_SERVICE } from "../content/career";
import { FESTIVAL_IDS } from "../content/festival";
import { festivalById } from "./catalog";
import { festivalToday } from "./festivalBoard";
import type { GameState } from "./gameState";
import { finishChapter, grantPathAward, noteCleanService } from "./pathAwards";
import {
  recordMoney,
  recordUnserved,
  truckOf,
  withPath,
  type FestivalReport,
  type SalePlan,
  type TruckState,
} from "./path";
import { menuReady } from "./pathMenu";
import { runStartIssue } from "./runLifecycle";
import { planSale, plateCoins, unservedCoins } from "./salePlan";
import { cleanService, type ServiceScore } from "./serviceScore";
import { openService, servicePlan } from "./serviceSetup";
import { hireableHelpers } from "./staffing";
import { queueStoryTrigger } from "./storyQueue";

export function festivalGuests(state: GameState, crowd: number): number {
  return Math.round(crowd * (0.5 + state.reputation / 200));
}

export function forecastFestival(state: GameState, truck: TruckState): SalePlan | null {
  const slot = festivalToday(truck, state.calendar.day);
  if (slot === null) return null;
  const festival = festivalById(slot.festivalId);
  const guests = festivalGuests(state, festival.crowd);
  return planSale(state, {
    day: state.calendar.day,
    guests,
    seats: guests,
    menu: truck.menu,
    carried: [],
    crowdTags: festival.tags,
  });
}

export function festivalCost(state: GameState, truck: TruckState): number {
  const slot = festivalToday(truck, state.calendar.day);
  const plan = forecastFestival(state, truck);
  if (slot === null || plan === null) return 0;
  return plan.ingredients + festivalById(slot.festivalId).pitchFee + PATH_RULES.festivalHelperFee;
}

export function openFestivalIssues(state: GameState, helperId: string): string[] {
  const truck = truckOf(state);
  if (truck === null) return ["Only Clementine goes to festivals."];
  const slot = festivalToday(truck, state.calendar.day);
  if (slot === null) return ["No festival today. Check the festival map."];
  const issues: string[] = [];
  if (slot.worked) issues.push("You already served at today's festival.");
  const busy = runStartIssue(state) ?? hoursShortfallReason(state.calendar, PATH_RULES.serviceHours);
  if (busy !== null) issues.push(busy);
  const menu = menuReady(state);
  if (menu !== null) issues.push(menu);
  if (truck.menu.every((entry) => entry.par === 0)) issues.push("Fill the fridge first.");
  if (!hireableHelpers().some((member) => member.id === helperId)) issues.push("Pick a helper for the day.");
  const cost = festivalCost(state, truck);
  if (state.coins < cost) issues.push(`The pitch, helper and Market Run need ${cost} coins.`);
  return issues;
}

export function openFestival(state: GameState, helperId: string): GameState {
  const truck = truckOf(state);
  const slot = truck === null ? null : festivalToday(truck, state.calendar.day);
  const plan = truck === null ? null : forecastFestival(state, truck);
  if (truck === null || slot === null || plan === null || openFestivalIssues(state, helperId).length > 0)
    return state;
  const opened = openService(state, {
    kind: "festival",
    cuisines: [],
    plan: servicePlan(state, PATH_SERVICE.festival),
    helpers: [helperId],
    special: null,
    pool: truck.menu.map((entry) => entry.dishId),
  });
  if (opened === state) return state;
  const pitch = festivalById(slot.festivalId).pitchFee + PATH_RULES.festivalHelperFee;
  const board = truck.board.map((entry) => (entry.day === slot.day ? { ...entry, worked: true } : entry));
  const paid = withPath(
    { ...opened, coins: opened.coins - plan.ingredients - pitch },
    { ...truck, board, today: { festivalId: slot.festivalId, helperId, plan } },
  );
  return recordMoney(recordMoney(paid, "ingredients", plan.ingredients), "pitches", pitch);
}

function celebrate(state: GameState, firstRibbon: boolean): GameState {
  const truck = truckOf(state);
  if (truck === null) return state;
  let next = firstRibbon ? queueStoryTrigger(state, "first-festival-favourite") : state;
  if (truck.ribbons.length >= RIBBONS_FOR_FAVOURITE) next = grantPathAward(next, "festival-favourite");
  const allVisited = FESTIVAL_IDS.every((id) => truck.visited.includes(id));
  return allVisited && truck.ribbons.length >= RIBBONS_FOR_FAVOURITE ? finishChapter(next) : next;
}

export function settleFestival(state: GameState, result: ServiceScore): GameState {
  const truck = truckOf(state);
  const today = truck?.today ?? null;
  if (truck === null || today === null) return state;
  const ribbon = result.score >= PATH_RULES.ribbonScore;
  const ribbonNew = ribbon && !truck.ribbons.includes(today.festivalId);
  const report: FestivalReport = {
    festivalId: today.festivalId,
    plan: today.plan,
    score: result.score,
    stars: starsForScore(result.score),
    ribbon,
    plateCoins: plateCoins(today.plan),
    pitch: festivalById(today.festivalId).pitchFee,
    helperFee: PATH_RULES.festivalHelperFee,
  };
  const settled = withPath(
    { ...state, coins: state.coins + report.plateCoins },
    {
      ...truck,
      today: null,
      lastFestival: report,
      visited: truck.visited.includes(today.festivalId)
        ? truck.visited
        : [...truck.visited, today.festivalId],
      ribbons: ribbonNew ? [...truck.ribbons, today.festivalId] : truck.ribbons,
    },
  );
  const booked = recordUnserved(
    recordMoney(settled, "plates", report.plateCoins),
    unservedCoins(today.plan, []),
  );
  return celebrate(noteCleanService(booked, cleanService(result)), ribbonNew && truck.ribbons.length === 0);
}
