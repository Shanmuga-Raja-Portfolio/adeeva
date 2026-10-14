import type { ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd } from "../../../engine/week";
import { settleWeek } from "../../../engine/weekSettlement";
import { CAREER } from "../content/career";
import { ROOM_TAGS } from "../content/roomTag";
import type { GameState } from "./gameState";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";

export const VAN_HOURS = 1;

export function weeklyBill(state: Pick<GameState, "profile">): number {
  return weeklyRent(CAREER.weeklyRent, state.profile.difficulty);
}

export function dayLength(state: Pick<GameState, "upgrades">): number {
  return BASE_DAY_HOURS + (state.upgrades.includes("little-van") ? VAN_HOURS : 0);
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: dayLength(state) },
  };
  const weekSettled = isWeekEnd(endedDay)
    ? settleWeek(advanced, weeklyBill(advanced), ROOM_TAGS, queueStoryTrigger)
    : advanced;
  const lapsed = lapseOverdueState(expireStaleOffers(weekSettled), (run) => run.gigId);
  return rollOffers(lapsed);
}

export function canWorkShift(state: GameState): ActionCheck {
  return freshDayCheck(state.calendar.hoursLeft, dayLength(state));
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), CAREER.shiftPay, endDay);
}
