import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
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
  const lapsed = lapseOverdueState(expireStaleOffers(weekSettled), (run) =>
    run.purpose.kind === "order" ? run.purpose.gigId : null,
  );
  const withOffers = rollOffers(lapsed);
  return isCounterDay(withOffers.calendar.day)
    ? queueStoryTrigger(withOffers, "first-counter-day")
    : withOffers;
}

export function canWorkShift(state: GameState): ActionCheck {
  if (isCounterDay(state.calendar.day)) return actionCheck(["The café is closed on Counter Day."]);
  return freshDayCheck(state.calendar.hoursLeft, BASE_DAY_HOURS);
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), CAREER.shiftPay, endDay);
}
