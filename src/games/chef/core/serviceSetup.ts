import { hoursShortfallReason, spendHours } from "../../../engine/dayHours";
import type { RngState } from "../../../engine/rng";
import { drawDistinct, drawInt, drawSeed } from "../../../engine/rngDraw";
import { CAREER, type ServiceRules } from "../content/career";
import { CUISINE_IDS, type CuisineId } from "../content/cuisine";
import type { DishId } from "../content/dish";
import { TEO_ID } from "../content/staff";
import { difficultyById, dishById, rungById, staffById } from "./catalog";
import type { GameState } from "./gameState";
import { unlockedDishes } from "./mastery";
import { runStartIssue } from "./runLifecycle";
import { testStartIssues } from "./rung";
import { admitTickets } from "./serviceRail";
import type { ServiceKind, ServicePlan, ServiceRun, ServiceTicket, Special } from "./service";
import { specialIssues } from "./special";
import { hireableHelpers } from "./staffing";
import { queueStoryTrigger } from "./storyQueue";

export const ARRIVAL_SHARE = 0.7;
export const FIRST_ARRIVAL = 2;
const TABLES = 24;

export interface ShiftSetup {
  readonly special: Special | null;
  readonly helpers: readonly string[];
}

export function servicePlan(state: GameState, rules: ServiceRules): ServicePlan {
  const { difficulty } = state.profile;
  const lengthSeconds =
    difficulty === "relaxed"
      ? 0
      : difficulty === "challenging"
        ? CAREER.challengingServiceSeconds
        : CAREER.serviceSeconds;
  return {
    railSize: rules.railSize,
    tickets: rules.tickets,
    targetSeconds: rules.ticketTargetSeconds,
    minimum: rules.serviceMinimum + difficultyById(difficulty).minQualityBonus,
    bonusFee: rules.bonusFee,
    wage: rules.wage,
    lengthSeconds,
    maxDishesPerTicket: rules.maxDishesPerTicket,
  };
}

export function servicePool(state: GameState, cuisines: readonly CuisineId[]): DishId[] {
  if (cuisines.length === 0) return [...state.menu];
  return unlockedDishes(state.mastery)
    .filter((dish) => cuisines.includes(dish.cuisine))
    .map((dish) => dish.id);
}

function rollTickets(plan: ServicePlan, pool: readonly DishId[], rng: RngState): [ServiceTicket[], RngState] {
  let state = rng;
  const spread = (plan.lengthSeconds * ARRIVAL_SHARE) / plan.tickets;
  const tickets: ServiceTicket[] = [];
  for (let index = 0; index < plan.tickets; index += 1) {
    const [count, afterCount] = drawInt(state, 1, Math.min(plan.maxDishesPerTicket, pool.length));
    const [dishIds, afterDishes] = drawDistinct(afterCount, pool, count);
    const [table, afterTable] = drawInt(afterDishes, 1, TABLES);
    const [jitter, afterJitter] = drawInt(afterTable, 0, Math.max(0, Math.floor(spread / 2)));
    state = afterJitter;
    tickets.push({
      id: `ticket-${index + 1}`,
      table,
      arrival:
        plan.lengthSeconds === 0
          ? 0
          : Math.round(FIRST_ARRIVAL + index * spread + (index === 0 ? 0 : jitter)),
      railAt: null,
      sentAt: null,
      dishes: dishIds.map((dishId) => ({
        dishId,
        steps: dishById(dishId).steps.map(() => null),
        readyAt: null,
        doneAt: null,
      })),
      team: false,
    });
  }
  return [tickets, state];
}

function openService(
  state: GameState,
  kind: ServiceKind,
  cuisines: readonly CuisineId[],
  plan: ServicePlan,
  helpers: readonly string[],
  special: Special | null,
): GameState {
  const spent = spendHours(state, CAREER.shiftHours);
  if (spent === null) return state;
  const [tickets, afterTickets] = rollTickets(plan, servicePool(state, cuisines), spent.rng);
  const [seed, rng] = drawSeed(afterTickets);
  const service: ServiceRun = {
    id: `service-${state.nextRunNumber}`,
    kind,
    cuisines,
    plan,
    tickets,
    staff: helpers.map((staffId) => ({ staffId, station: null, freeAt: 0 })),
    special,
    lastAt: 0,
    openSince: 0,
    seed,
  };
  const opened: GameState = {
    ...spent,
    rng,
    service: admitTickets(service, 0),
    nextRunNumber: state.nextRunNumber + 1,
    lastShiftDay: state.calendar.day,
  };
  return queueStoryTrigger(opened, "first-service");
}

export function shiftIssues(state: GameState, offerId: string, setup: ShiftSetup): string[] {
  const rules = rungById(state.rung).service;
  const offer = state.board.shifts.find((entry) => entry.id === offerId);
  const issues: string[] = [];
  if (rules === null || offer === undefined) return ["That shift is not on the board."];
  if (state.lastShiftDay === state.calendar.day) issues.push("You already worked a shift today.");
  const busy = runStartIssue(state) ?? hoursShortfallReason(state.calendar, CAREER.shiftHours);
  if (busy !== null) issues.push(busy);
  if (state.rung === "sous") {
    if (setup.special === null) issues.push("Write a Daily Special first.");
    else issues.push(...specialIssues(state, setup.special));
  } else if (setup.special !== null) issues.push("Only a sous chef writes the special.");
  if (state.rung === "head" && state.menu.length !== CAREER.menuSize)
    issues.push(`Write a ${CAREER.menuSize}-dish menu first.`);
  const hireable = hireableHelpers().map((member) => member.id);
  const wanted = state.rung === "head" ? rules.helpers : 0;
  if (
    setup.helpers.length !== wanted ||
    new Set(setup.helpers).size !== setup.helpers.length ||
    setup.helpers.some((id) => !hireable.includes(id))
  )
    issues.push(wanted === 0 ? "Helpers join you as head chef." : `Pick ${wanted} helpers for tonight.`);
  return issues;
}

export function startShift(state: GameState, offerId: string, setup: ShiftSetup): GameState {
  const rules = rungById(state.rung).service;
  const offer = state.board.shifts.find((entry) => entry.id === offerId);
  if (rules === null || offer === undefined || shiftIssues(state, offerId, setup).length > 0) return state;
  const helpers = state.rung === "sous" ? [TEO_ID] : setup.helpers;
  if (helpers.some((id) => staffById(id) === undefined)) return state;
  return openService(state, "shift", offer.cuisines, servicePlan(state, rules), helpers, setup.special);
}

export function stationTestIssues(state: GameState, cuisine: string): string[] {
  const issues = testStartIssues(state, "station");
  if (!CUISINE_IDS.some((id) => id === cuisine)) issues.push("Pick a counter.");
  return issues;
}

export function startStationTest(state: GameState, cuisine: string): GameState {
  const rules = rungById("line").service;
  const counter = CUISINE_IDS.find((id) => id === cuisine);
  if (rules === null || counter === undefined || stationTestIssues(state, cuisine).length > 0) return state;
  const plan: ServicePlan = {
    ...servicePlan(state, rules),
    tickets: CAREER.stationTestTickets,
    minimum: CAREER.stationMinimum + difficultyById(state.profile.difficulty).minQualityBonus,
    bonusFee: 0,
    wage: 0,
  };
  return openService(state, "station-test", [counter], plan, [], null);
}
