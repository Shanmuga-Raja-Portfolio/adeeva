import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import type { GameState } from "./gameState";
import { stageCompletionHours } from "./hourCost";
import { stageAfter, stageIndex, type RunStage } from "./runStage";
import { canAdvance } from "./stageReadiness";

export const REVISITABLE_STAGES: readonly RunStage[] = ["sketch", "fabric"];

export function canGoBack(state: GameState, target: RunStage): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No dress in progress."]);
  const reasons: string[] = [];
  if (!REVISITABLE_STAGES.includes(target) || stageIndex(target) >= stageIndex(run.stage))
    reasons.push("Only the sketch and fabric steps can be revisited.");
  if (run.cutFabrics.length > 0) reasons.push("The fabric is already cut, so the design is locked.");
  return actionCheck(reasons);
}

export function goToStage(state: GameState, target: RunStage): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  if (target === stageAfter(run.stage) && target !== "done") {
    if (!canAdvance(state).ok) return state;
    const spent = spendHours(state, stageCompletionHours(run.stage, state.studio.assistantHired));
    if (spent === null) return state;
    return { ...spent, activeRun: { ...run, stage: target } };
  }
  if (!canGoBack(state, target).ok) return state;
  return { ...state, activeRun: { ...run, stage: target } };
}
