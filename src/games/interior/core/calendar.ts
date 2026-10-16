import type { ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { isWeekEnd } from "../../../engine/week";
import { settleWeek } from "../../../engine/weekSettlement";
import { ROOM_TAGS } from "../content/roomTag";
import { careerById } from "./catalog";
import { finishCrewJobs } from "./crewJob";
import type { GameState } from "./gameState";
import { autoStage } from "./homeOpenHouse";
import { checkLarkspurOffer } from "./larkspurOffer";
import { rollOffers } from "./offers";
import { isArchivable, isOverdue, isProjectOpenOn } from "./projectCalendar";
import { withLarkspur } from "./projectUpdate";
import { queueStoryTrigger } from "./storyQueue";

export const VAN_HOURS = 1;

type BillState = Pick<GameState, "profile" | "career" | "larkspur" | "calendar">;

export function weeklyBill(state: BillState): number {
  const career = careerById(state.career);
  const open = isProjectOpenOn(state.larkspur, state.calendar.day);
  return weeklyRent(open ? career.projectRent : career.weeklyRent, state.profile.difficulty);
}

export function dayLength(state: Pick<GameState, "upgrades">): number {
  return BASE_DAY_HOURS + (state.upgrades.includes("little-van") ? VAN_HOURS : 0);
}

function endLarkspurDay(state: GameState, endedDay: number): GameState {
  const worked = finishCrewJobs(state);
  const project = worked.larkspur?.project ?? null;
  const staged = project !== null && isOverdue(project, endedDay) ? autoStage(worked) : worked;
  return withLarkspur(staged, (larkspur) =>
    larkspur.project !== null && isArchivable(larkspur.project, staged.calendar.day)
      ? { ...larkspur, project: null }
      : null,
  );
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const bill = weeklyBill(state);
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: dayLength(state) },
  };
  const weekSettled = isWeekEnd(endedDay)
    ? settleWeek(advanced, bill, ROOM_TAGS, queueStoryTrigger)
    : advanced;
  const homes = endLarkspurDay(weekSettled, endedDay);
  const lapsed = lapseOverdueState(expireStaleOffers(homes), (run) =>
    run.purpose.kind === "home-room" ? null : run.gigId,
  );
  return checkLarkspurOffer(rollOffers(lapsed));
}

export function canWorkShift(state: GameState): ActionCheck {
  return freshDayCheck(state.calendar.hoursLeft, dayLength(state));
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), careerById(state.career).shiftPay, endDay);
}
