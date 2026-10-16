import type { ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd, weekEndDay } from "../../../engine/week";
import { settleWeek, type WeekTrigger } from "../../../engine/weekSettlement";
import type { CareerDef } from "../content/career";
import { WOOD_TAGS } from "../content/woodTag";
import { payRen, renWageDue, restRenDay } from "./apprentice";
import { careerById } from "./catalog";
import { rollSeason } from "./fairSeason";
import type { GameState } from "./gameState";
import { rollOffers } from "./offers";
import { runOpenHouse } from "./openHouse";
import { applyShopGrace } from "./shopGrace";
import { queueShowroomOffer } from "./showroomOffer";
import { queueStoryTrigger, queueTraitBeat } from "./storyQueue";

export const SKYLIGHT_HOURS = 1;

export function dayHours(state: Pick<GameState, "upgrades">): number {
  return BASE_DAY_HOURS + (state.upgrades.includes("skylight") ? SKYLIGHT_HOURS : 0);
}

export function careerOf(state: Pick<GameState, "career">): CareerDef {
  return careerById(state.career);
}

export function showroomRentDue(
  state: Pick<GameState, "career" | "showroom">,
  settlementDay: number,
): boolean {
  const showroom = state.showroom;
  return (
    state.career === "showroom" &&
    showroom !== null &&
    !showroom.rested &&
    settlementDay >= showroom.seasonStartDay
  );
}

export function rentFor(state: GameState, settlementDay = weekEndDay(state.calendar.day)): number {
  const career = careerById(showroomRentDue(state, settlementDay) ? "showroom" : "garage");
  return weeklyRent(career.weeklyRent, state.profile.difficulty);
}

export function rentLabel(state: GameState, settlementDay = weekEndDay(state.calendar.day)): string {
  return careerById(showroomRentDue(state, settlementDay) ? "showroom" : "garage").rentLabel;
}

export function weeklyBill(state: GameState, settlementDay = weekEndDay(state.calendar.day)): number {
  return rentFor(state, settlementDay) + renWageDue(state, settlementDay);
}

function queueWeekBeat(state: GameState, trigger: WeekTrigger): GameState {
  const queued = queueStoryTrigger(state, trigger);
  return trigger === "first-week" ? queueTraitBeat(queued, "trendsetter") : queued;
}

function settleShopWeek(state: GameState, settledDay: number): GameState {
  const settled = settleWeek(state, weeklyBill(state, settledDay), WOOD_TAGS, queueWeekBeat);
  return applyShopGrace(payRen(settled, settledDay));
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const housed = runOpenHouse(state, endedDay);
  const advanced: GameState = {
    ...housed,
    buzz: decayBuzz(housed.buzz),
    calendar: { day: endedDay + 1, hoursLeft: dayHours(housed) },
  };
  const settled = isWeekEnd(endedDay) ? settleShopWeek(advanced, endedDay) : advanced;
  const seasoned = restRenDay(rollSeason(settled));
  const lapsed = lapseOverdueState(expireStaleOffers(seasoned), (run) =>
    run.stage === "done" ? null : run.gigId,
  );
  return queueShowroomOffer(rollOffers(lapsed));
}

export function canWorkShift(state: GameState): ActionCheck {
  return freshDayCheck(state.calendar.hoursLeft, dayHours(state));
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), careerOf(state).shiftPay, endDay);
}
