import type { ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd } from "../../../engine/week";
import { settleWeek, type WeekTrigger } from "../../../engine/weekSettlement";
import { CAREER } from "../content/career";
import { WOOD_TAGS } from "../content/woodTag";
import type { GameState } from "./gameState";
import { rollOffers } from "./offers";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";

export const SKYLIGHT_HOURS = 1;

export function dayHours(state: Pick<GameState, "upgrades">): number {
  return BASE_DAY_HOURS + (state.upgrades.includes("skylight") ? SKYLIGHT_HOURS : 0);
}

export function weeklyBill(state: GameState): number {
  return weeklyRent(CAREER.weeklyRent, state.profile.difficulty);
}

function queueWeekBeat(state: GameState, trigger: WeekTrigger): GameState {
  const queued = queueStoryTrigger(state, trigger);
  return trigger === "first-week" ? queueTraitBeat(queued, "trendsetter") : queued;
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: dayHours(state) },
  };
  const settled = isWeekEnd(endedDay)
    ? settleWeek(advanced, weeklyBill(advanced), WOOD_TAGS, queueWeekBeat)
    : advanced;
  const lapsed = lapseOverdueState(expireStaleOffers(settled), (run) =>
    run.stage === "done" ? null : run.gigId,
  );
  return rollOffers(lapsed);
}

export function canWorkShift(state: GameState): ActionCheck {
  return freshDayCheck(state.calendar.hoursLeft, dayHours(state));
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), CAREER.shiftPay, endDay);
}
