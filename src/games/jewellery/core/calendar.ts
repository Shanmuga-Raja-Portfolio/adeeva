import type { ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd } from "../../../engine/week";
import { settleWeek } from "../../../engine/weekSettlement";
import { CAREER } from "../content/career";
import { JEWEL_TAGS } from "../content/jewelTag";
import type { GameState } from "./gameState";
import { isMarketDay, rollNextTheme } from "./marketDay";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";

export const STOOL_HOURS = 1;

export function weeklyBill(state: Pick<GameState, "profile">): number {
  return weeklyRent(CAREER.weeklyRent, state.profile.difficulty);
}

export function dayLength(state: Pick<GameState, "upgrades">): number {
  return BASE_DAY_HOURS + (state.upgrades.includes("comfy-stool") ? STOOL_HOURS : 0);
}

function newWeek(state: GameState): GameState {
  const settled = settleWeek(state, weeklyBill(state), JEWEL_TAGS, queueStoryTrigger);
  const [marketTheme, rng] = rollNextTheme(settled.marketTheme, settled.rng);
  return { ...settled, marketTheme, rng };
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: dayLength(state) },
  };
  const weekSettled = isWeekEnd(endedDay) ? newWeek(advanced) : advanced;
  const lapsed = lapseOverdueState(expireStaleOffers(weekSettled), (run) =>
    run.purpose.kind === "order" ? run.purpose.gigId : null,
  );
  const withOffers = rollOffers(lapsed);
  return isMarketDay(withOffers.calendar.day)
    ? queueStoryTrigger(withOffers, "first-market-day")
    : withOffers;
}

export function canWorkShift(state: GameState): ActionCheck {
  return freshDayCheck(state.calendar.hoursLeft, dayLength(state));
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), CAREER.shiftPay, endDay);
}
