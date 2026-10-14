import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { weeklyRent } from "../../../engine/difficulty";
import { careerById } from "./catalog";
import type { GameState } from "./gameState";
import { seasonBegun } from "./seasonCalendar";
import { queueStoryTrigger } from "./storyQueue";

export const PARLOUR_GRACE = 30;

function salonRentActive(state: GameState, day: number): boolean {
  const { fair, salon } = state;
  return (
    state.career === "salon" &&
    fair !== null &&
    salon !== null &&
    salon.parlour !== "resting" &&
    day >= fair.seasonStartDay
  );
}

export function weeklyBill(state: GameState, day = state.calendar.day): number {
  const career = salonRentActive(state, day) ? "salon" : "bakery";
  return weeklyRent(careerById(career).weeklyRent, state.profile.difficulty);
}

export function rentLabel(state: GameState): string {
  return careerById(salonRentActive(state, state.calendar.day) ? "salon" : "bakery").rentLabel;
}

export function graceApplies(state: GameState, bill: number, day: number): boolean {
  const { fair, salon } = state;
  return (
    state.profile.difficulty === "standard" &&
    fair !== null &&
    salon !== null &&
    salonRentActive(state, day) &&
    state.coins - bill < 0 &&
    salon.graceSeason !== fair.seasonNumber
  );
}

export function withGrace(state: GameState, bill: number, day: number): [GameState, number] {
  const { fair, salon } = state;
  if (fair === null || salon === null || !graceApplies(state, bill, day)) return [state, bill];
  const graced: GameState = { ...state, salon: { ...salon, graceSeason: fair.seasonNumber } };
  return [queueStoryTrigger(graced, "parlour-grace"), bill - PARLOUR_GRACE];
}

export function canRestParlour(state: GameState): ActionCheck {
  const { fair, salon } = state;
  if (state.career !== "salon" || fair === null || salon === null)
    return actionCheck(["Open the Comet Room first."]);
  if (!seasonBegun(fair, state.calendar.day))
    return actionCheck([`Fair Season ${fair.seasonNumber} opens on day ${fair.seasonStartDay}.`]);
  if (salon.parlour !== "undecided" || fair.themeId !== null)
    return actionCheck(["The parlour's plan is set until next season."]);
  return actionCheck([]);
}

export function restParlour(state: GameState): GameState {
  const salon = state.salon;
  if (salon === null || !canRestParlour(state).ok) return state;
  return { ...state, salon: { ...salon, parlour: "resting" } };
}
