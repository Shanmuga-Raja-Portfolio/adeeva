import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { overallScore } from "../../../engine/panelScore";
import { lateShowPenalty } from "../../../engine/showDay";
import { applyStanding } from "../../../engine/standing";
import { FAIR_BOOTH_NUMBERS, type FairBoothNumber } from "../content/fairBooth";
import { clientById, fairThemeById } from "./catalog";
import { fairPanels, fairTip } from "./fairPanels";
import { fairEligibleSets } from "./fairPick";
import { planIssue } from "./fairPlan";
import { boothAdvanceMark, fairPrize, rosetteFor, rosetteRank } from "./fairPrize";
import type { FairPlan, FairResult, FairState } from "./fairState";
import type { GameState } from "./gameState";
import { atLeast, everyHookGold, GOLD, hangRosette, railFinished, SILVER } from "./rosetteRail";
import { isFairDay, isLateFairDay } from "./seasonCalendar";
import { setPrice } from "./setPrice";
import type { FloorSet, ShowroomState } from "./showroomState";
import { queueStoryTrigger } from "./storyQueue";

export const LATE_STAGING_HOURS = 4;
export const CANOPY_BOOTH: FairBoothNumber = 3;
export const PAVILION_BOOTH: FairBoothNumber = 4;

export function canStageFair(state: GameState): ActionCheck {
  const { fair, showroom } = state;
  if (state.career !== "showroom" || fair === null || showroom === null)
    return actionCheck(["Open the showroom first."]);
  if (fair.result !== null) return actionCheck(["This season's Fair is done. Well made!"]);
  if (showroom.themeId === null) return actionCheck(["Choose this season's theme first."]);
  if (!isFairDay(state) && !isLateFairDay(state)) return actionCheck(["The Fair opens on Fair Day."]);
  if (fair.pickSetId === null || !fairEligibleSets(state).some((set) => set.setId === fair.pickSetId))
    return actionCheck(["Pick a set on the Fair Board first."]);
  if (isLateFairDay(state) && state.calendar.hoursLeft < LATE_STAGING_HOURS)
    return actionCheck([`A late booth needs ${LATE_STAGING_HOURS} hours. End the day to try tomorrow.`]);
  return actionCheck([]);
}

function nextBooth(booth: FairBoothNumber): FairBoothNumber {
  return FAIR_BOOTH_NUMBERS.find((entry) => entry === booth + 1) ?? booth;
}

function advancedBooth(state: GameState, fair: FairState, overall: number): FairBoothNumber {
  if (state.profile.difficulty === "relaxed") return fair.booth;
  return overall >= boothAdvanceMark(state.profile.difficulty) ? nextBooth(fair.booth) : fair.booth;
}

function boothBeats(state: GameState, before: FairBoothNumber, after: FairBoothNumber): GameState {
  const canopy =
    before < CANOPY_BOOTH && after >= CANOPY_BOOTH ? queueStoryTrigger(state, "booth-canopy") : state;
  return before < PAVILION_BOOTH && after >= PAVILION_BOOTH
    ? queueStoryTrigger(canopy, "booth-pavilion")
    : canopy;
}

function fairBeats(state: GameState, before: FairState, result: FairResult): GameState {
  const fair = state.fair;
  if (fair === null) return state;
  let next = queueStoryTrigger(state, "first-fair");
  if (atLeast(result.rosette, GOLD)) next = queueStoryTrigger(next, "gold-rosette");
  next = boothBeats(next, before.booth, result.boothAfter);
  if (railFinished(fair)) next = queueStoryTrigger(next, "rosette-rail");
  if (everyHookGold(fair)) next = queueStoryTrigger(next, "every-hook-gold");
  return next;
}

function repricedFloor(showroom: ShowroomState, set: FloorSet, rosetteWon: boolean): ShowroomState {
  const price = setPrice({
    products: set.pieces.map((piece) => piece.productId),
    quality: set.stats.quality,
    woodId: set.woodId,
    harmony: set.stats.harmony,
    rosette: rosetteWon,
  });
  return {
    ...showroom,
    floor: showroom.floor.map((entry) =>
      entry.setId === set.setId ? { ...entry, price, mode: "sale" } : entry,
    ),
  };
}

export function stageFair(state: GameState, plan: FairPlan): GameState {
  const { fair, showroom } = state;
  if (fair === null || showroom === null || showroom.themeId === null) return state;
  if (!canStageFair(state).ok || planIssue(state, plan) !== null) return state;
  const set = showroom.floor.find((entry) => entry.setId === plan.setId);
  if (set === undefined) return state;
  const theme = fairThemeById(showroom.themeId);
  const late = isLateFairDay(state);
  const panels = fairPanels(set, theme, plan, state.upgrades.includes("booth-awning"));
  const penalty = lateShowPenalty(late, state.profile.difficulty);
  const overall = overallScore(panels, penalty);
  const rosette = rosetteFor(overall);
  const prize = fairPrize(overall, fair.booth, state.profile.difficulty);
  const boothAfter = advancedBooth(state, fair, overall);
  const visitor = fair.visitors.find((id) => clientById(id) !== undefined) ?? "grandpa-teodor";
  const result: FairResult = {
    day: state.calendar.day,
    seasonNumber: showroom.seasonNumber,
    themeId: theme.id,
    booth: fair.booth,
    plan: { ...plan, order: [...plan.order] },
    panels,
    latePenalty: penalty,
    overall,
    rosette,
    coins: prize.coins,
    reputation: prize.reputation,
    buzz: prize.buzz,
    tip: fairTip(panels),
    boothAfter,
    visitor,
  };
  const staged: GameState = {
    ...state,
    calendar: {
      ...state.calendar,
      hoursLeft: late ? Math.max(0, state.calendar.hoursLeft - LATE_STAGING_HOURS) : 0,
    },
    showroom: repricedFloor(showroom, set, rosetteRank(rosette) >= rosetteRank(SILVER)),
    fair: {
      ...fair,
      result,
      booth: boothAfter,
      boothOffer:
        state.profile.difficulty === "relaxed" &&
        overall >= boothAdvanceMark("standard") &&
        nextBooth(fair.booth) !== fair.booth,
      rosetteRail: hangRosette(fair.rosetteRail, theme.id, rosette),
      rosettesBySet: { ...fair.rosettesBySet, [set.setId]: rosette },
    },
  };
  return fairBeats(applyStanding(staged, prize), fair, result);
}

export function moveUpBooth(state: GameState): GameState {
  const fair = state.fair;
  if (fair === null || !fair.boothOffer) return state;
  const booth = nextBooth(fair.booth);
  return boothBeats({ ...state, fair: { ...fair, booth, boothOffer: false } }, fair.booth, booth);
}
