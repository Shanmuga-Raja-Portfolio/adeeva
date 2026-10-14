import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import type { RunStage } from "../content/runStage";
import type { CommissionRun } from "./commissionRun";
import type { GameState } from "./gameState";
import { leaveHours, stageAfter, stageIndex } from "./hourCost";
import { canAdvance } from "./stageReadiness";

export const REVISITABLE_STAGES: readonly RunStage[] = ["design", "timber", "layout"];

function designLocked(run: CommissionRun): boolean {
  return Object.keys(run.cuts).length > 0;
}

export function canGoBack(state: GameState, target: RunStage): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["Nothing on the workbench."]);
  if (!REVISITABLE_STAGES.includes(target))
    return actionCheck(["Only the design, timber and board plan can be revisited."]);
  if (stageIndex(target) >= stageIndex(run.stage)) return actionCheck(["That step is still ahead."]);
  if (designLocked(run)) return actionCheck(["The first board is sawn, so the design is locked."]);
  return actionCheck([]);
}

function entered(state: GameState, run: CommissionRun, target: RunStage): GameState {
  const moved: CommissionRun = {
    ...run,
    stage: target,
    reached: stageIndex(target) > stageIndex(run.reached) ? target : run.reached,
    tripPaid: target === "timber" ? false : run.tripPaid,
  };
  return { ...state, activeRun: moved };
}

export function goToStage(state: GameState, target: RunStage): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  if (target === stageAfter(run.stage) && target !== "done") {
    if (!canAdvance(state).ok) return state;
    const spent = spendHours(state, leaveHours(run));
    return spent === null ? state : entered(spent, run, target);
  }
  if (!canGoBack(state, target).ok) return state;
  return entered(state, run, target);
}
