import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd } from "../../../engine/week";
import { settleWeek } from "../../../engine/weekSettlement";
import { CAREER } from "../content/career";
import { TASTE_TAGS } from "../content/tasteTag";
import { rungById } from "./catalog";
import { rollDayBoard } from "./dayBoardRoll";
import type { GameState } from "./gameState";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";

export function weeklyBill(state: Pick<GameState, "profile" | "rung">): number {
  return weeklyRent(rungById(state.rung).rent, state.profile.difficulty);
}

export function canEndDay(state: GameState): ActionCheck {
  return actionCheck(state.service === null ? [] : ["Finish the service first."]);
}

function closeTestDay(state: GameState): GameState {
  if (state.testDay === null) return state;
  const run = state.activeRun;
  return { ...state, testDay: null, activeRun: run !== null && run.purpose.kind === "test" ? null : run };
}

function keepOpenOrders(state: GameState): GameState {
  const open = new Set(state.gigs.active.map((gig) => gig.id));
  const orderDishes = state.orderDishes.filter((entry) => open.has(entry.gigId));
  return orderDishes.length === state.orderDishes.length ? state : { ...state, orderDishes };
}

export function endDay(state: GameState): GameState {
  if (!canEndDay(state).ok) return state;
  const endedDay = state.calendar.day;
  const advanced: GameState = closeTestDay({
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: BASE_DAY_HOURS },
  });
  const settled = isWeekEnd(endedDay)
    ? settleWeek(advanced, weeklyBill(advanced), TASTE_TAGS, queueStoryTrigger)
    : advanced;
  const lapsed = keepOpenOrders(
    lapseOverdueState(expireStaleOffers(settled), (run) =>
      run.purpose.kind === "order" ? run.purpose.gigId : null,
    ),
  );
  return rollOffers(rollDayBoard(lapsed));
}

export function canPotWash(state: GameState): ActionCheck {
  const reasons: string[] = [];
  if (state.calendar.hoursLeft < BASE_DAY_HOURS)
    reasons.push("Pot-washing takes the whole day. Start it first thing.");
  if (state.service !== null) reasons.push("Finish the service first.");
  if (state.activeRun !== null && state.activeRun.stage !== "done")
    reasons.push("Finish the dish on the board first.");
  return actionCheck(reasons);
}

export function potWash(state: GameState): GameState {
  return workPaidShift(state, canPotWash(state), CAREER.potWashPay, endDay);
}
