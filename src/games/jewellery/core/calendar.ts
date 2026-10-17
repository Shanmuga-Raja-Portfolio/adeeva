import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { weeklyRent, type DifficultyId } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd, weekEndDay } from "../../../engine/week";
import { settleWeek } from "../../../engine/weekSettlement";
import { JEWEL_TAGS } from "../content/jewelTag";
import { dayLength } from "./calendarHours";
import { careerById } from "./catalog";
import { pinCopyRequests } from "./copyRequests";
import type { GameState } from "./gameState";
import { launchEndDayIssue } from "./launchEndDay";
import { turnSeason } from "./launchSeason";
import { queueLoftOffer } from "./loftOffer";
import { applyLoftGrace } from "./loftGrace";
import { isMarketDay, rollNextTheme } from "./marketDay";
import { rollOffers } from "./offers";
import { loftCollection } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";

type BillView = Pick<GameState, "profile" | "career" | "collection" | "calendar">;

export function weeklyBill(state: BillView, settleDay = weekEndDay(state.calendar.day)): number {
  const collection = loftCollection(state);
  const loftRent =
    collection !== null && settleDay >= collection.seasonStartDay && !collection.rested
      ? careerById("collection").weeklyRent
      : careerById("bench").weeklyRent;
  return weeklyRent(loftRent, state.profile.difficulty);
}

export interface LoftRents {
  readonly bench: number;
  readonly loft: number;
}

export function loftRents(difficulty: DifficultyId): LoftRents {
  return {
    bench: weeklyRent(careerById("bench").weeklyRent, difficulty),
    loft: weeklyRent(careerById("collection").weeklyRent, difficulty),
  };
}

export function rentLabel(state: BillView, settleDay = weekEndDay(state.calendar.day)): string {
  const bench = careerById("bench");
  return weeklyBill(state, settleDay) > weeklyRent(bench.weeklyRent, state.profile.difficulty)
    ? careerById("collection").rentLabel
    : bench.rentLabel;
}

function newWeek(state: GameState, endedDay: number): GameState {
  const settled = settleWeek(state, weeklyBill(state, endedDay), JEWEL_TAGS, queueStoryTrigger);
  const [marketTheme, rng] = rollNextTheme(settled.marketTheme, settled.rng);
  return applyLoftGrace({ ...settled, marketTheme, rng });
}

export function canEndDay(state: GameState): ActionCheck {
  const issue = launchEndDayIssue(state);
  return actionCheck(issue === null ? [] : [issue]);
}

export function endDay(state: GameState): GameState {
  if (!canEndDay(state).ok) return state;
  const endedDay = state.calendar.day;
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: dayLength(state) },
  };
  const weekSettled = isWeekEnd(endedDay) ? newWeek(advanced, endedDay) : advanced;
  const turned = turnSeason(weekSettled);
  const lapsed = lapseOverdueState(expireStaleOffers(turned), (run) =>
    run.purpose.kind === "order" ? run.purpose.gigId : null,
  );
  const withOffers = rollOffers(pinCopyRequests(lapsed));
  const marketQueued = isMarketDay(withOffers, withOffers.calendar.day)
    ? queueStoryTrigger(withOffers, "first-market-day")
    : withOffers;
  return queueLoftOffer(marketQueued);
}

export function canWorkShift(state: GameState): ActionCheck {
  const fresh = freshDayCheck(state.calendar.hoursLeft, dayLength(state));
  if (!fresh.ok) return fresh;
  return canEndDay(state);
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), careerById(state.career).shiftPay, endDay);
}
