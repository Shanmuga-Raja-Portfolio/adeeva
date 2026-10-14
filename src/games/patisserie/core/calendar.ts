import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { isWeekEnd } from "../../../engine/week";
import { settleWeek } from "../../../engine/weekSettlement";
import { closeCounter } from "./boxItUp";
import { careerById } from "./catalog";
import { seasonOpened, rollSeason } from "./fairSeason";
import type { GameState } from "./gameState";
import { rollOffers } from "./offers";
import { queueSalonOffer } from "./openSalon";
import { weeklyBill, withGrace } from "./parlour";
import { dayKind, isSalonDay } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";
import { finishSalonDay } from "./tableSession";

export { weeklyBill };

const SHIFT_CLOSED: Readonly<Record<"counter" | "salon" | "fair", string>> = {
  counter: "The café is closed on Counter Day.",
  salon: "Salon Day keeps you busy in the Comet Room.",
  fair: "It's Fair Day! The glasshouse is waiting.",
};

function settle(state: GameState, endedDay: number): GameState {
  const [graced, bill] = withGrace(state, weeklyBill(state, endedDay), endedDay);
  return settleWeek(graced, bill, STYLE_TAGS, queueStoryTrigger);
}

function endSalonDay(state: GameState): GameState {
  if (!isSalonDay(state)) return state;
  const finished = finishSalonDay(state);
  const served = finished.salon?.lastSummary?.served ?? 0;
  return state.profile.trait === "charmer" && served > 0
    ? queueStoryTrigger(finished, "charmer-parlour")
    : finished;
}

function openingSeason(state: GameState): GameState {
  const fair = state.fair;
  if (fair === null) return state;
  if (fair.seasonNumber === 1 && state.calendar.day === fair.seasonStartDay) return seasonOpened(state);
  return rollSeason(state);
}

function dayTriggers(state: GameState): GameState {
  switch (dayKind(state)) {
    case "counter":
      return queueStoryTrigger(state, "first-counter-day");
    case "salon":
      return queueStoryTrigger(state, "first-salon-day");
    case "fair":
    case "baking":
      return state;
  }
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const closed = closeCounter(endSalonDay(state));
  const advanced: GameState = {
    ...closed,
    buzz: decayBuzz(closed.buzz),
    calendar: { day: endedDay + 1, hoursLeft: BASE_DAY_HOURS },
  };
  const weekSettled = isWeekEnd(endedDay) ? settle(advanced, endedDay) : advanced;
  const lapsed = lapseOverdueState(expireStaleOffers(weekSettled), (run) =>
    run.purpose.kind === "order" ? run.purpose.gigId : null,
  );
  const withOffers = rollOffers(openingSeason(lapsed));
  return queueSalonOffer(dayTriggers(withOffers));
}

export function canWorkShift(state: GameState): ActionCheck {
  const kind = dayKind(state);
  if (kind !== "baking") return actionCheck([SHIFT_CLOSED[kind]]);
  return freshDayCheck(state.calendar.hoursLeft, BASE_DAY_HOURS);
}

export function shiftPay(state: GameState): number {
  return careerById(state.career).shiftPay;
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), shiftPay(state), endDay);
}
