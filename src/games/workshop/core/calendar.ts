import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireOffers, lapseOverdue } from "../../../engine/gigBoard";
import { workPaidShift } from "../../../engine/paidShift";
import { applyStanding, decayBuzz } from "../../../engine/standing";
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

function lapseOverdueCommissions(state: GameState): GameState {
  const lapse = lapseOverdue(state.gigs, state.calendar.day, state.profile.difficulty, state.profile.trait);
  if (lapse === null) return state;
  const run = state.activeRun;
  const runLapsed = run !== null && run.stage !== "done" && lapse.lapsedIds.has(run.gigId);
  const updated: GameState = { ...state, activeRun: runLapsed ? null : run, gigs: lapse.board };
  return applyStanding(updated, { coins: 0, reputation: lapse.reputation, buzz: 0 });
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
  const expired = expireOffers(settled.gigs, settled.calendar.day);
  return rollOffers(lapseOverdueCommissions({ ...settled, gigs: expired }));
}

export function canWorkShift(state: GameState): ActionCheck {
  const fresh = state.calendar.hoursLeft >= dayHours(state);
  return actionCheck(fresh ? [] : ["A shift takes the whole day. Start it first thing in the morning."]);
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), CAREER.shiftPay, endDay);
}
