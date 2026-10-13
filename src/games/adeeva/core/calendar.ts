import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { weeklyRent } from "../../../engine/difficulty";
import { expireOffers } from "../../../engine/gigBoard";
import { decayBuzz } from "../../../engine/standing";
import { careerById } from "./catalog";
import { hoursPerDay } from "./dayHours";
import type { GameState } from "./gameState";
import { lapseOverdueGigs } from "./gigDeadline";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";
import { assistantWage } from "./studio";
import { advanceTrendWeek } from "../../../engine/trendMarket";
import { isWeekEnd, weekEndDay } from "../../../engine/week";

export interface WeeklyBill {
  readonly rent: number;
  readonly wage: number;
}

export function weeklyBill(state: GameState): WeeklyBill {
  const rent = weeklyRent(careerById(state.profile.career).weeklyRent, state.profile.difficulty);
  return { rent, wage: state.studio.assistantHired ? assistantWage(state) : 0 };
}

function settleWeek(state: GameState): GameState {
  const bill = weeklyBill(state);
  const [trends, rng] = advanceTrendWeek(state.trends, state.rng);
  const studio = state.studio.assistantHired
    ? { ...state.studio, assistantPaidThroughDay: weekEndDay(state.calendar.day) }
    : state.studio;
  const settled = queueStoryTrigger(
    { ...state, coins: state.coins - bill.rent - bill.wage, trends, rng, studio },
    "first-week",
  );
  const bankrupt = settled.profile.difficulty === "challenging" && settled.coins < 0;
  return bankrupt ? queueStoryTrigger(settled, "bankrupt") : settled;
}

function expireStaleOffers(state: GameState): GameState {
  const gigs = expireOffers(state.gigs, state.calendar.day);
  return gigs === state.gigs ? state : { ...state, gigs };
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: hoursPerDay(state.studio), shopOpen: false },
  };
  const weekSettled = isWeekEnd(endedDay) ? settleWeek(advanced) : advanced;
  return rollOffers(lapseOverdueGigs(expireStaleOffers(weekSettled)));
}

export function canWorkShift(state: GameState): ActionCheck {
  const fresh = state.calendar.hoursLeft >= hoursPerDay(state.studio);
  return actionCheck(fresh ? [] : ["A shift takes the whole day. Start it first thing in the morning."]);
}

export function workShift(state: GameState): GameState {
  if (!canWorkShift(state).ok) return state;
  return endDay({ ...state, coins: state.coins + careerById(state.profile.career).shiftPay });
}
