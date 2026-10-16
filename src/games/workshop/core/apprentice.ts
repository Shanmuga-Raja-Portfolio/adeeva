import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { weeklyRent } from "../../../engine/difficulty";
import { DAYS_PER_WEEK, weekEndDay } from "../../../engine/week";
import { REN } from "../content/apprentice";
import type { GameState } from "./gameState";

export interface ApprenticeState {
  readonly hired: boolean;
  readonly paidThroughDay: number;
  readonly jobsDone: number;
  readonly jobsToday: number;
}

export const NEW_APPRENTICE: ApprenticeState = { hired: false, paidThroughDay: 0, jobsDone: 0, jobsToday: 0 };
export const MAX_REN_LEVEL = 3;

export function renLevel(jobsDone: number): number {
  return Math.min(MAX_REN_LEVEL, 1 + Math.floor(jobsDone / REN.jobsPerLevel));
}

export function renAccuracy(jobsDone: number): number {
  return REN.accuracies[renLevel(jobsDone) - 1] ?? REN.accuracies[0];
}

export function renJobsPerDay(state: Pick<GameState, "upgrades">): number {
  return state.upgrades.includes("ren-bench") ? REN.benchJobsPerDay : REN.jobsPerDay;
}

export function renWage(state: Pick<GameState, "career" | "apprentice" | "showroom" | "profile">): number {
  const apprentice = state.apprentice;
  if (state.career !== "showroom" || apprentice === null || !apprentice.hired) return 0;
  if (state.showroom?.rested === true) return 0;
  return weeklyRent(REN.weeklyWage, state.profile.difficulty);
}

export function renWageDue(
  state: Pick<GameState, "career" | "apprentice" | "showroom" | "profile">,
  settlementDay: number,
): number {
  const apprentice = state.apprentice;
  if (apprentice === null || apprentice.paidThroughDay >= settlementDay + DAYS_PER_WEEK) return 0;
  return renWage(state);
}

export function renHireCost(state: GameState): number {
  const apprentice = state.apprentice;
  if (state.career !== "showroom" || apprentice === null) return 0;
  if (apprentice.paidThroughDay >= state.calendar.day) return 0;
  return weeklyRent(REN.weeklyWage, state.profile.difficulty);
}

export function hireCheck(state: GameState): ActionCheck {
  if (state.career !== "showroom" || state.apprentice === null)
    return actionCheck(["Ren helps in the showroom."]);
  if (state.apprentice.hired) return actionCheck(["Ren is already at the bench."]);
  if (state.showroom?.rested === true) return actionCheck(["Ren is resting with the shop this season."]);
  const cost = renHireCost(state);
  return actionCheck(state.coins < cost ? [`Taking Ren on pays this week's ${cost}-coin wage.`] : []);
}

export function takeRenOn(state: GameState): GameState {
  const apprentice = state.apprentice;
  if (apprentice === null || !hireCheck(state).ok) return state;
  const cost = renHireCost(state);
  const paidThroughDay = cost > 0 ? weekEndDay(state.calendar.day) : apprentice.paidThroughDay;
  return { ...state, coins: state.coins - cost, apprentice: { ...apprentice, hired: true, paidThroughDay } };
}

export function giveRenWeekOff(state: GameState): GameState {
  const apprentice = state.apprentice;
  if (state.career !== "showroom" || apprentice === null || !apprentice.hired) return state;
  return { ...state, apprentice: { ...apprentice, hired: false } };
}

export function payRen(state: GameState, settledDay: number): GameState {
  const apprentice = state.apprentice;
  if (apprentice === null || renWageDue(state, settledDay) === 0) return state;
  return { ...state, apprentice: { ...apprentice, paidThroughDay: settledDay + DAYS_PER_WEEK } };
}

export function restRenDay(state: GameState): GameState {
  const apprentice = state.apprentice;
  if (apprentice === null || apprentice.jobsToday === 0) return state;
  return { ...state, apprentice: { ...apprentice, jobsToday: 0 } };
}
