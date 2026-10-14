import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { spendHours } from "../../../engine/dayHours";
import { dreamerFlair } from "../../../engine/trendReward";
import { productById } from "./catalog";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { pieceColours } from "./pieceColours";
import { runKind, type PieceRun } from "./pieceRun";
import { runSource } from "./pieceSource";
import { pieceTags } from "./pieceTags";
import { stageAfter, stageIndex, stagesFor, type RunStage } from "./runStage";
import { canAdvance } from "./stageReadiness";
import { queueTraitBeat } from "./storyQueue";

export const REVISITABLE_STAGES: readonly RunStage[] = ["design", "supplies", "plan"];

export function runStages(run: PieceRun): readonly RunStage[] {
  return stagesFor(runKind(run), productById(run.design.productId).seats.length);
}

export function canGoBack(state: GameState, target: RunStage): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["Nothing is on the bench."]);
  if (!REVISITABLE_STAGES.includes(target) || !runStages(run).includes(target))
    return actionCheck(["Only the design, supplies and plan steps can be revisited."]);
  if (stageIndex(target) >= stageIndex(run.stage)) return actionCheck(["That step is still ahead."]);
  if (run.consumed !== null) return actionCheck(["The first shape is cut, so the design is locked."]);
  return actionCheck([]);
}

function entered(state: GameState, run: PieceRun, target: RunStage): GameState {
  const moved: PieceRun = {
    ...run,
    stage: target,
    reached: stageIndex(target) > stageIndex(run.reached) ? target : run.reached,
    suppliesHourPaid: target === "supplies" ? false : run.suppliesHourPaid,
  };
  const next: GameState = { ...state, activeRun: moved };
  const source = runSource(run);
  if (run.stage === "design" && dreamerFlair(pieceColours(source).length, pieceTags(source)))
    return queueTraitBeat(next, "dreamer");
  return next;
}

export function goToStage(state: GameState, target: RunStage): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  if (target === stageAfter(runStages(run), run.stage) && target !== "done") {
    if (!canAdvance(state).ok) return state;
    const spent = spendHours(state, leaveHours(run));
    if (spent === null) return state;
    return entered(spent, run, target);
  }
  if (!canGoBack(state, target).ok) return state;
  return entered(state, run, target);
}
