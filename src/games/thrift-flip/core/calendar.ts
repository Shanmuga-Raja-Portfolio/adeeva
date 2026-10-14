import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { BASE_DAY_HOURS } from "../../../engine/dayHours";
import { weeklyRent } from "../../../engine/difficulty";
import type { Gig } from "../../../engine/gigBoard";
import { expireStaleOffers, lapseOverdueState } from "../../../engine/gigBoardState";
import { freshDayCheck, workPaidShift } from "../../../engine/paidShift";
import { decayBuzz } from "../../../engine/standing";
import { STYLE_TAGS } from "../../../engine/styleTag";
import { isWeekEnd } from "../../../engine/week";
import { settleWeek } from "../../../engine/weekSettlement";
import type { CareerDef } from "../content/career";
import type { Brief } from "./brief";
import { queueBoutiqueOffer } from "./boutiqueUnlock";
import { careerById } from "./catalog";
import type { GameState } from "./gameState";
import { HALL_DAY_REASON, swapDayIsToday } from "./hallDay";
import { rollRail } from "./marketRail";
import { rollOffers } from "./offers";
import { abandonFlip } from "./runLifecycle";
import { inWelcomeWeek } from "./seasonCalendar";
import { turnBoutiqueDay } from "./seasonTurn";
import { isStallDay, stallDayIssue } from "./stallCalendar";
import { queueStoryTrigger } from "./storyQueue";

export function careerOf(state: Pick<GameState, "profile">): CareerDef {
  return careerById(state.profile.career);
}

export function weeklyBill(state: Pick<GameState, "profile" | "boutique" | "calendar">): number {
  if (inWelcomeWeek(state, state.calendar.day)) return 0;
  return weeklyRent(careerOf(state).weeklyRent, state.profile.difficulty);
}

function settled(state: GameState, endedDay: number): GameState {
  const advanced: GameState = {
    ...state,
    buzz: decayBuzz(state.buzz),
    calendar: { day: endedDay + 1, hoursLeft: BASE_DAY_HOURS, marketOpen: false },
  };
  if (!isWeekEnd(endedDay)) return advanced;
  const paid = settleWeek(advanced, weeklyBill(state), STYLE_TAGS, queueStoryTrigger);
  return state.profile.career === "stall" ? queueBoutiqueOffer(paid) : paid;
}

export function endDay(state: GameState): GameState {
  const endedDay = state.calendar.day;
  const turned = turnBoutiqueDay(state);
  const lapsed = lapseOverdueState(
    expireStaleOffers(settled(turned, endedDay)),
    (run) => (run.purpose.kind === "gig" ? run.purpose.gigId : null),
    abandonFlip,
    (gig: Gig<Brief>) => gig.brief.kind !== "flip",
  );
  const rolled = rollRail(rollOffers(lapsed));
  if (!isStallDay(rolled.calendar.day)) return rolled;
  return queueStoryTrigger(
    rolled,
    rolled.profile.career === "boutique" ? "first-till-day" : "first-stall-day",
  );
}

export function canWorkShift(state: GameState): ActionCheck {
  const stall = stallDayIssue(state.calendar.day);
  if (stall !== null)
    return actionCheck([
      state.profile.career === "boutique"
        ? "Till Day is for selling. The swap shop is closed."
        : "Stall Day is for selling. The swap shop is closed.",
    ]);
  if (swapDayIsToday(state)) return actionCheck([HALL_DAY_REASON]);
  return freshDayCheck(state.calendar.hoursLeft, BASE_DAY_HOURS);
}

export function workShift(state: GameState): GameState {
  return workPaidShift(state, canWorkShift(state), careerOf(state).shiftPay, endDay);
}
