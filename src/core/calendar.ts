import { actionCheck, type ActionCheck } from "./actionCheck";
import { careerById, difficultyById } from "./catalog";
import { hoursPerDay } from "./dayHours";
import type { GameState } from "./gameState";
import { lapseOverdueGigs } from "./gigDeadline";
import { rollOffers } from "./offers";
import { queueStoryTrigger } from "./storyQueue";
import { assistantWage } from "./studio";
import { advanceTrendWeek } from "./trendMarket";
import { isWeekEnd, weekEndDay } from "./week";

export const BUZZ_DECAY_PER_DAY = 2;

export interface WeeklyBill {
  readonly rent: number;
  readonly wage: number;
}

export function weeklyBill(state: GameState): WeeklyBill {
  const rent = Math.round(
    careerById(state.profile.career).weeklyRent * difficultyById(state.profile.difficulty).rentMultiplier,
  );
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

function expireOffers(state: GameState): GameState {
  const day = state.calendar.day;
  const offers = state.gigs.offers.filter((offer) => offer.expiresDay >= day);
  return offers.length === state.gigs.offers.length ? state : { ...state, gigs: { ...state.gigs, offers } };
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const advanced: GameState = {
    ...state,
    buzz: Math.max(0, state.buzz - BUZZ_DECAY_PER_DAY),
    calendar: { day: endedDay + 1, hoursLeft: hoursPerDay(state.studio), shopOpen: false },
  };
  const weekSettled = isWeekEnd(endedDay) ? settleWeek(advanced) : advanced;
  return rollOffers(lapseOverdueGigs(expireOffers(weekSettled)));
}

export function canWorkShift(state: GameState): ActionCheck {
  const fresh = state.calendar.hoursLeft >= hoursPerDay(state.studio);
  return actionCheck(fresh ? [] : ["A shift takes the whole day. Start it first thing in the morning."]);
}

export function workShift(state: GameState): GameState {
  if (!canWorkShift(state).ok) return state;
  return endDay({ ...state, coins: state.coins + careerById(state.profile.career).shiftPay });
}
