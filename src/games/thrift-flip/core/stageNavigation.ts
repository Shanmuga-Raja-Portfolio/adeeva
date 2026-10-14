import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import { stageIndex, type FlipStage } from "./flipStage";
import type { GameState } from "./gameState";
import { runHasStage, runStageAfter } from "./runStages";
import { canAdvance, runStageHours } from "./stageReadiness";

export const REVISITABLE_STAGES: readonly FlipStage[] = ["design", "market", "layout"];

export function canGoBack(state: GameState, target: FlipStage): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No flip on the bench."]);
  const reasons: string[] = [];
  if (
    !REVISITABLE_STAGES.includes(target) ||
    !runHasStage(run, target) ||
    stageIndex(target) >= stageIndex(run.stage)
  )
    reasons.push("Only the plan, the rail and the layout can be revisited.");
  if (run.cutDone) reasons.push("The pieces are cut, so the plan is locked.");
  return actionCheck(reasons);
}

export function goToStage(state: GameState, target: FlipStage): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  if (target === runStageAfter(run, run.stage) && target !== "done") {
    if (!canAdvance(state).ok) return state;
    const spent = spendHours(state, runStageHours(run, state.upgrades));
    if (spent === null) return state;
    const reachedStage = stageIndex(target) > stageIndex(run.reachedStage) ? target : run.reachedStage;
    return {
      ...spent,
      calendar: { ...spent.calendar, marketOpen: false },
      activeRun: { ...run, stage: target, reachedStage },
    };
  }
  if (!canGoBack(state, target).ok) return state;
  return {
    ...state,
    calendar: { ...state.calendar, marketOpen: false },
    activeRun: { ...run, stage: target },
  };
}
