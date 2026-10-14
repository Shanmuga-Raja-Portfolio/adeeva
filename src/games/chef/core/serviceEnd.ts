import { starsForScore } from "../../../engine/score";
import { applyStanding } from "../../../engine/standing";
import { CLEAN_PASS_STREAK } from "../content/award";
import { CAREER } from "../content/career";
import type { CuisineId } from "../content/cuisine";
import { dishById } from "./catalog";
import type { GameState, Passes } from "./gameState";
import { HANDLED_LINE, SLOW_TICKETS_LINE, TEAM_FINISH_LINE } from "./kindFeedback";
import { appendLog, type MasteryGain, type ServiceLogEntry, type SpecialSale } from "./log";
import { addMastery } from "./mastery";
import { dishTags, kindSoftFail, settleChefReward, type Reward } from "./rewards";
import { settlePathService } from "./pathServiceEnd";
import { nextRung, promote } from "./rung";
import { admitTickets, serviceOver } from "./serviceRail";
import { cleanService, scoreService, teamFinish, type ServiceScore } from "./serviceScore";
import { hasClock, type ServiceRun, type Special } from "./service";
import { specialForecast, type SpecialForecast } from "./special";
import { queueStoryTrigger } from "./storyQueue";
import { validMoment } from "./serviceActions";

export const HANDLED_GATE = 0.5;
export const STRONG_SERVICE = 88;
export const GOOD_SERVICE = 75;
export const KIND_CALL_SERVICES = 5;
export const MASTERY_CUISINES = 2;

function mostServed(served: readonly CuisineId[]): CuisineId[] {
  const count = (cuisine: CuisineId) => served.filter((entry) => entry === cuisine).length;
  return [...new Set(served)].sort((a, b) => count(b) - count(a)).slice(0, MASTERY_CUISINES);
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
  const cuisines = service.cuisines.length > 0 ? service.cuisines : mostServed(served);
  return cuisines.map((cuisine) => ({ cuisine, gain }));
}

function serviceTags(state: GameState, service: ServiceRun) {
  if (service.special !== null) return [...dishById(service.special.dishId).tags];
  const served = service.tickets.flatMap((ticket) => ticket.dishes.map((dish) => dishById(dish.dishId)));
  return dishTags(service.kind === "shift" && state.rung === "head" ? state.menu.map(dishById) : served);
}

function settle(
  state: GameState,
  service: ServiceRun,
  result: ServiceScore,
  gateOk: boolean,
  passed: boolean,
): Reward {
  if (!gateOk) return kindSoftFail(service.plan.bonusFee);
  const reward = settleChefReward(state, {
    passed,
    score: result.score,
    stars: starsForScore(result.score),
    fee: service.plan.bonusFee,
    late: false,
    tags: serviceTags(state, service),
    colourCount: 0,
  });
  return service.plan.bonusFee > 0
    ? reward
    : { ...reward, lines: reward.lines.filter((line) => line.amount !== 0) };
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
  const streak = cleanService(result) ? state.cleanStreak + 1 : 0;
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
  return settlePathService(test && passed ? promote(next, nextRung(state.rung)) : next, service, result);
}
