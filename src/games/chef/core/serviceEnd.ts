import { average } from "../../../engine/average";
import { starsForScore } from "../../../engine/score";
import { applyStanding } from "../../../engine/standing";
import { CLEAN_PASS_STREAK } from "../content/award";
import { CAREER } from "../content/career";
import type { CuisineId } from "../content/cuisine";
import { dishById } from "./catalog";
import { qualityFrom, type StepAccuracies } from "./dishQuality";
import type { GameState, Passes } from "./gameState";
import { HANDLED_LINE, SLOW_TICKETS_LINE, TEAM_FINISH_LINE } from "./kindFeedback";
import { appendLog, type MasteryGain, type ServiceLogEntry, type SpecialSale } from "./log";
import { addMastery } from "./mastery";
import { dishTags, kindSoftFail, settleChefReward, type Reward } from "./rewards";
import { nextRung, promote } from "./rung";
import { admitTickets, lampFactor, serviceOver, ticketOnTime } from "./serviceRail";
import { hasClock, type ServiceDish, type ServiceRun, type ServiceStep, type Special } from "./service";
import { specialForecast, type SpecialForecast } from "./special";
import { queueStoryTrigger } from "./storyQueue";
import { validMoment } from "./serviceActions";

export const TEAM_ACCURACY = 0.6;
export const TEAM_ON_TIME = 0.4;
export const HANDLED_WEIGHT = 50;
export const HANDLED_GATE = 0.5;
export const QUALITY_SHARE = 0.65;
export const ON_TIME_SHARE = 0.25;
export const HANDLED_SHARE = 0.1;
export const STRONG_SERVICE = 88;
export const GOOD_SERVICE = 75;
export const CLEAN_STARS = 4;
export const KIND_CALL_SERVICES = 5;

const TEAM_STEP: ServiceStep = { accuracy: TEAM_ACCURACY, by: "team", assisted: false };

interface DishScore {
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

export function scoreService(service: ServiceRun): ServiceScore {
  const dishes: DishScore[] = service.tickets.flatMap((ticket) =>
    ticket.dishes.map((dish) => {
      const def = dishById(dish.dishId);
      const lamp = ticket.team || ticket.sentAt === null ? 1 : lampFactor(service, dish, ticket.sentAt);
      return {
        cuisine: def.cuisine,
        quality: Math.round(qualityFrom(def, dishAccuracies(dish), 1) * lamp),
        handled: handledWeight(dish) >= HANDLED_WEIGHT,
      };
    }),
  );
  const onTimes = service.tickets.map((ticket) =>
    ticket.team ? TEAM_ON_TIME : ticketOnTime(service, ticket),
  );
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

export function endServiceIssue(state: GameState, at: number): string | null {
  const service = state.service;
  if (service === null) return "There is no service running.";
  if (!validMoment(service, at)) return "The clock has moved on.";
  if (!hasClock(service) || serviceOver(admitTickets(service, at), at)) return null;
  return "The service is still going. Keep cooking!";
}

function masteryGains(service: ServiceRun, score: number, served: readonly CuisineId[]): MasteryGain[] {
  const gain = score >= STRONG_SERVICE ? 2 : score >= GOOD_SERVICE ? 1 : 0;
  if (gain === 0) return [];
  const cuisines = service.cuisines.length > 0 ? service.cuisines : [...new Set(served)];
  return cuisines.map((cuisine) => ({ cuisine, gain }));
}

function serviceTags(state: GameState, service: ServiceRun) {
  if (service.special !== null) return [...dishById(service.special.dishId).tags];
  const served = service.tickets.flatMap((ticket) => ticket.dishes.map((dish) => dishById(dish.dishId)));
  return dishTags(state.rung === "head" ? state.menu.map(dishById) : served);
}

function settle(
  state: GameState,
  service: ServiceRun,
  result: ServiceScore,
  gateOk: boolean,
  passed: boolean,
): Reward {
  if (!gateOk) return kindSoftFail(service.plan.bonusFee);
  return settleChefReward(state, {
    passed,
    score: result.score,
    stars: starsForScore(result.score),
    fee: service.plan.bonusFee,
    late: false,
    tags: serviceTags(state, service),
    colourCount: 0,
  });
}

function saleOf(special: Special, forecast: SpecialForecast): SpecialSale {
  return { special, sold: forecast.sold, bonus: forecast.bonus, soldOut: forecast.soldOut };
}

function bumpPasses(passes: Passes, rung: GameState["rung"]): Passes {
  if (rung === "line") return { ...passes, line: passes.line + 1 };
  if (rung === "sous") return { ...passes, sous: passes.sous + 1 };
  return rung === "head" ? { ...passes, head: passes.head + 1 } : passes;
}

function feedbackFor(result: ServiceScore, gateOk: boolean, passed: boolean): string[] {
  const lines: string[] = [];
  if (result.teamTickets > 0) lines.push(TEAM_FINISH_LINE);
  if (!gateOk) lines.push(HANDLED_LINE);
  else if (!passed) lines.push(SLOW_TICKETS_LINE);
  return lines;
}

export function endService(state: GameState, at: number): GameState {
  const open = state.service;
  if (open === null || endServiceIssue(state, at) !== null) return state;
  const service = teamFinish(admitTickets(open, at), at);
  const result = scoreService(service);
  const relaxed = state.profile.difficulty === "relaxed";
  const gateOk = relaxed ? result.handledDishes >= 1 : result.handledShare >= HANDLED_GATE;
  const scorePassed = result.score >= service.plan.minimum;
  const passed = gateOk && (scorePassed || relaxed);
  const test = service.kind === "station-test";
  const reward: Reward = test
    ? {
        outcome: passed ? "pass" : "soft-fail",
        coins: 0,
        reputation: passed ? CAREER.testReputation : 0,
        buzz: 0,
        lines: [],
        trendMatches: [],
      }
    : settle(state, service, result, gateOk, passed);
  const sale: SpecialSale | null =
    service.special === null ? null : saleOf(service.special, specialForecast(state, service.special));
  const gains = masteryGains(
    service,
    result.score,
    result.dishes.map((dish) => dish.cuisine),
  );
  const handled = result.dishes.filter((dish) => dish.handled);
  const clean = handled.length > 0 && handled.every((dish) => starsForScore(dish.quality) >= CLEAN_STARS);
  const streak = clean ? state.cleanStreak + 1 : 0;
  const entry: ServiceLogEntry = {
    kind: "service",
    runId: service.id,
    day: state.calendar.day,
    service: service.kind,
    cuisines: service.cuisines,
    score: result.score,
    stars: starsForScore(result.score),
    averageQuality: result.averageQuality,
    averageOnTime: result.averageOnTime,
    handledShare: result.handledShare,
    passed,
    teamTickets: result.teamTickets,
    dishes: result.dishes.length,
    wage: service.plan.wage,
    reward,
    special: sale,
    mastery: gains,
    feedback: feedbackFor(result, gateOk, passed),
  };
  let next: GameState = {
    ...state,
    service: null,
    coins: state.coins + service.plan.wage + (sale?.bonus ?? 0),
    passes: !test && reward.outcome === "pass" ? bumpPasses(state.passes, state.rung) : state.passes,
    cleanStreak: streak,
    awards:
      streak >= CLEAN_PASS_STREAK && !state.awards.includes("clean-pass")
        ? [...state.awards, "clean-pass"]
        : state.awards,
    log: appendLog(state.log, entry),
  };
  next = applyStanding(next, {
    coins: reward.coins,
    reputation: reward.reputation + (sale?.soldOut === true ? 1 : 0),
    buzz: reward.buzz,
  });
  next = gains.reduce((current, gain) => addMastery(current, gain.cuisine, gain.gain), next);
  if (result.teamTickets > 0) next = queueStoryTrigger(next, "first-team-finish");
  if (sale?.soldOut === true) next = queueStoryTrigger(next, "first-special-sold-out");
  if (
    state.rung === "sous" &&
    next.passes.sous === KIND_CALL_SERVICES &&
    state.passes.sous < KIND_CALL_SERVICES
  )
    next = queueStoryTrigger(next, "sous-service-5");
  return test && passed ? promote(next, nextRung(state.rung)) : next;
}
