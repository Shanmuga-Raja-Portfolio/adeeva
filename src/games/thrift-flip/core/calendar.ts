import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd } from "../../../engine/week";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { settleWeek } from "../../../engine/weekSettlement";
import { CAREER } from "../content/career";
import type { GameState } from "./gameState";
import { rollRail } from "./marketRail";
import { rollOffers } from "./offers";
import { abandonFlip } from "./runLifecycle";
import { isStallDay, stallDayIssue } from "./stallCalendar";
import { queueStoryTrigger } from "./storyQueue";

export function weeklyBill(state: GameState): number {
  return weeklyRent(CAREER.weeklyRent, state.profile.difficulty);
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: BASE_DAY_HOURS, marketOpen: false },
  };
  const weekSettled = isWeekEnd(endedDay)
    ? settleWeek(advanced, weeklyBill(advanced), STYLE_TAGS, queueStoryTrigger)
    : advanced;
  const lapsed = lapseOverdueState(
    expireStaleOffers(weekSettled),
    (run) => (run.purpose.kind === "gig" ? run.purpose.gigId : null),
    abandonFlip,
  );
  const rolled = rollRail(rollOffers(lapsed));
  return isStallDay(rolled.calendar.day) ? queueStoryTrigger(rolled, "first-stall-day") : rolled;
}

export function canWorkShift(state: GameState): ActionCheck {
  const stall = stallDayIssue(state.calendar.day);
  if (stall !== null) return actionCheck(["Stall Day is for selling. The swap shop is closed."]);
  const fresh = state.calendar.hoursLeft >= BASE_DAY_HOURS;
  return actionCheck(fresh ? [] : ["A shift takes the whole day. Start it first thing in the morning."]);
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), CAREER.shiftPay, endDay);
}
