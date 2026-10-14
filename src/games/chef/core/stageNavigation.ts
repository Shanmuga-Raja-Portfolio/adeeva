import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { dishById } from "./catalog";
import { cookStarted, currentCookStep, stageAfter, stageIndex, type RunStage } from "./dishRun";
import type { GameState } from "./gameState";

export const REVISITABLE_STAGES: readonly RunStage[] = ["ticket", "mise"];

export function canAdvance(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["Nothing is on the board."]);
  const dish = dishById(run.dishId);
  switch (run.stage) {
    case "ticket":
      return actionCheck([]);
    case "mise": {
      const missing = dish.ingredients.length - run.mise.length;
      return actionCheck(
        missing === 0
          ? []
          : [`Get ${missing} more ${missing === 1 ? "ingredient" : "ingredients"} ready first.`],
      );
    }
    case "cook":
      return actionCheck(currentCookStep(run, dish) === null ? [] : ["Finish every cooking step first."]);
    case "plate":
      return actionCheck(run.plated === null ? ["Plate the dish first."] : []);
    case "pass":
      return actionCheck(["Ring the pass bell to send it out."]);
    case "done":
      return actionCheck(["This dish is finished."]);
  }
}

export function canGoBack(state: GameState, target: RunStage): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["Nothing is on the board."]);
  if (!REVISITABLE_STAGES.includes(target))
    return actionCheck(["Only the ticket and Get ready can be revisited."]);
  if (stageIndex(target) >= stageIndex(run.stage)) return actionCheck(["That step is still ahead."]);
  if (cookStarted(run)) return actionCheck(["Cooking has started, so the ticket is locked."]);
  return actionCheck([]);
}

export function goToStage(state: GameState, target: RunStage): GameState {
  const run = state.activeRun;
  if (run === null || target === "done") return state;
  const forward = target === stageAfter(run.stage);
  if (forward ? !canAdvance(state).ok : !canGoBack(state, target).ok) return state;
  return { ...state, activeRun: { ...run, stage: target } };
}
