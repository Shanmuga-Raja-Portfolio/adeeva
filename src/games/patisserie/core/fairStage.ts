import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { applyStanding } from "../../../engine/standing";
import { FAIR_TENT_NUMBERS, type FairTentNumber } from "../content/fairTent";
import { fairThemeById } from "./catalog";
import { bookPlate, fairPanels, fairTip } from "./fairPanels";
import { overallScore } from "../../../engine/panelScore";
import { lateShowPenalty } from "../../../engine/showDay";
import { planIssue } from "./fairPlan";
import { fairPrize, ribbonFor, ribbonRank, tentAdvanceMark } from "./fairPrize";
import type { FairPlan, FairResult, FairState } from "./fairState";
import type { GameState } from "./gameState";
import { everyHookGold, GOLD, hangRibbon, wallFinished } from "./ribbonWall";
import { isFairDay, isFairLateDay } from "./seasonCalendar";
import { sidePlateOptions } from "./sidePlates";
import { queueStoryTrigger } from "./storyQueue";

export const GLASSHOUSE_TENT: FairTentNumber = 3;
export const GRAND_TENT: FairTentNumber = 5;

export function canStageFair(state: GameState): ActionCheck {
  const fair = state.fair;
  if (fair === null) return actionCheck(["Open the Comet Room first."]);
  if (fair.result !== null) return actionCheck(["This season's Fair is done. Well baked!"]);
  if (fair.entry === null) return actionCheck(["Take a showpiece to the Fair first."]);
  if (!isFairDay(state) && !isFairLateDay(state)) return actionCheck(["The Fair opens on Fair Day."]);
  return actionCheck([]);
}

function nextTent(tent: FairTentNumber): FairTentNumber {
  return FAIR_TENT_NUMBERS.find((entry) => entry === tent + 1) ?? tent;
}

function advancedTent(state: GameState, fair: FairState, overall: number): FairTentNumber {
  if (state.profile.difficulty === "relaxed") return fair.tent;
  return overall >= tentAdvanceMark(state.profile.difficulty) ? nextTent(fair.tent) : fair.tent;
}

function fairBeats(state: GameState, before: FairState, result: FairResult): GameState {
  const fair = state.fair;
  if (fair === null) return state;
  let next = queueStoryTrigger(state, "first-fair-done");
  if (ribbonRank(result.ribbon) >= ribbonRank(GOLD)) next = queueStoryTrigger(next, "gold-ribbon");
  if (before.tent < GLASSHOUSE_TENT && result.tentAfter >= GLASSHOUSE_TENT)
    next = queueStoryTrigger(next, "tent-glasshouse");
  if (before.tent < GRAND_TENT && result.tentAfter >= GRAND_TENT)
    next = queueStoryTrigger(next, "tent-grand");
  if (wallFinished(fair)) next = queueStoryTrigger(next, "ribbon-wall");
  if (everyHookGold(fair)) next = queueStoryTrigger(next, "every-hook-gold");
  return next;
}

export function stageFair(state: GameState, plan: FairPlan): GameState {
  const fair = state.fair;
  if (fair === null || fair.entry === null || fair.themeId === null) return state;
  if (!canStageFair(state).ok || planIssue(state, plan) !== null) return state;
  const theme = fairThemeById(fair.themeId);
  const options = sidePlateOptions(state);
  const sides = plan.sidePlates.flatMap((runId) => {
    const entry = options.find((option) => option.runId === runId);
    return entry === undefined ? [] : [bookPlate(entry)];
  });
  const panels = fairPanels(fair.entry, sides, theme, plan);
  const penalty = lateShowPenalty(isFairLateDay(state), state.profile.difficulty);
  const overall = overallScore(panels, penalty);
  const ribbon = ribbonFor(overall);
  const prize = fairPrize(overall, fair.tent, state.profile.difficulty);
  const tentAfter = advancedTent(state, fair, overall);
  const result: FairResult = {
    day: state.calendar.day,
    themeId: theme.id,
    tent: fair.tent,
    plan: { ...plan, sidePlates: [...plan.sidePlates], order: [...plan.order] },
    panels,
    latePenalty: penalty,
    overall,
    ribbon,
    coins: prize.coins,
    reputation: prize.reputation,
    buzz: prize.buzz,
    tip: fairTip(panels),
    tentAfter,
  };
  const staged: GameState = {
    ...state,
    fair: {
      ...fair,
      result,
      tent: tentAfter,
      tentOffer:
        state.profile.difficulty === "relaxed" &&
        overall >= tentAdvanceMark("standard") &&
        nextTent(fair.tent) !== fair.tent,
      shownRunIds: [...fair.shownRunIds, fair.entry.runId, ...plan.sidePlates],
      ribbonWall: hangRibbon(fair.ribbonWall, theme.id, ribbon),
      ribbonsByRun: { ...fair.ribbonsByRun, [fair.entry.runId]: ribbon },
    },
  };
  return fairBeats(applyStanding(staged, prize), fair, result);
}

export function moveUpTent(state: GameState): GameState {
  const fair = state.fair;
  if (fair === null || !fair.tentOffer) return state;
  const tent = nextTent(fair.tent);
  const moved: GameState = { ...state, fair: { ...fair, tent, tentOffer: false } };
  const glasshouse = fair.tent < GLASSHOUSE_TENT && tent >= GLASSHOUSE_TENT;
  const grand = fair.tent < GRAND_TENT && tent >= GRAND_TENT;
  if (glasshouse) return queueStoryTrigger(moved, "tent-glasshouse");
  return grand ? queueStoryTrigger(moved, "tent-grand") : moved;
}
