import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import type { MakeoverRun } from "./makeoverRun";
import { stageAfter, stageIndex, type RunStage } from "./runStage";
import { canAdvance } from "./stageReadiness";

export const REVISITABLE_STAGES: readonly RunStage[] = ["plan", "shop"];

export function canGoBack(state: GameState, target: RunStage): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No room is in progress."]);
  if (!REVISITABLE_STAGES.includes(target))
    return actionCheck(["Only the plan and the warehouse can be revisited."]);
  if (stageIndex(target) >= stageIndex(run.stage)) return actionCheck(["That step is still ahead."]);
  if (run.locked) return actionCheck(["The first wall is painted, so the plan is locked."]);
  return actionCheck([]);
}

function entered(state: GameState, run: MakeoverRun, target: RunStage): GameState {
  const moved: MakeoverRun = {
    ...run,
    stage: target,
    reached: stageIndex(target) > stageIndex(run.reached) ? target : run.reached,
  };
  return { ...state, activeRun: moved };
}

export function goToStage(state: GameState, target: RunStage): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  if (target === stageAfter(run.stage) && target !== "done") {
    if (!canAdvance(state).ok) return state;
    const spent = spendHours(state, leaveHours(run));
    if (spent === null) return state;
    return entered(spent, run, target);
  }
  if (!canGoBack(state, target).ok) return state;
  return entered(state, run, target);
}
