import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireOffers, lapseOverdue } from "../../../engine/gigBoard";
import { workPaidShift } from "../../../engine/paidShift";
import { applyStanding, decayBuzz } from "../../../engine/standing";
import { isWeekEnd } from "../../../engine/week";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { settleWeek } from "../../../engine/weekSettlement";
import { CAREER } from "../content/career";
import { closeCounter } from "./boxItUp";
import { isCounterDay } from "./counter";
import type { GameState } from "./gameState";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";

export function weeklyBill(state: GameState): number {
  return weeklyRent(CAREER.weeklyRent, state.profile.difficulty);
}

function lapseOverdueOrders(state: GameState): GameState {
  const lapse = lapseOverdue(state.gigs, state.calendar.day, state.profile.difficulty, state.profile.trait);
  if (lapse === null) return state;
  const run = state.activeRun;
  const runLapsed = run !== null && run.purpose.kind === "order" && lapse.lapsedIds.has(run.purpose.gigId);
  const updated: GameState = { ...state, activeRun: runLapsed ? null : run, gigs: lapse.board };
  return applyStanding(updated, { coins: 0, reputation: lapse.reputation, buzz: 0 });
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const closed = closeCounter(state);
  const advanced: GameState = {
    ...closed,
    buzz: decayBuzz(closed.buzz),
    calendar: { day: endedDay + 1, hoursLeft: BASE_DAY_HOURS },
  };
  const weekSettled = isWeekEnd(endedDay)
    ? settleWeek(advanced, weeklyBill(advanced), STYLE_TAGS, queueStoryTrigger)
    : advanced;
  const expired = expireOffers(weekSettled.gigs, weekSettled.calendar.day);
  const withOffers = rollOffers(lapseOverdueOrders({ ...weekSettled, gigs: expired }));
  return isCounterDay(withOffers.calendar.day)
    ? queueStoryTrigger(withOffers, "first-counter-day")
    : withOffers;
}

export function canWorkShift(state: GameState): ActionCheck {
  if (isCounterDay(state.calendar.day)) return actionCheck(["The café is closed on Counter Day."]);
  const fresh = state.calendar.hoursLeft >= BASE_DAY_HOURS;
  return actionCheck(fresh ? [] : ["A shift takes the whole day. Start it first thing in the morning."]);
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), CAREER.shiftPay, endDay);
}
