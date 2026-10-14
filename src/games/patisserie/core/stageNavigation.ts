import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { dreamerFlair } from "../../../engine/trendReward";
import { runKind, type BakeRun } from "./bakeRun";
import { bakeTags } from "./bakeTags";
import { spendHours } from "../../../engine/dayHours";
import type { GameState } from "./gameState";
import { leaveHours } from "./hourCost";
import { applyIcing } from "./icing";
import { stageAfter, stageIndex, stagesFor, type RunStage } from "./runStage";
import { canAdvance } from "./stageReadiness";
import { queueTraitBeat } from "./storyQueue";

export const REVISITABLE_STAGES: readonly RunStage[] = ["design", "pantry"];

export function canGoBack(state: GameState, target: RunStage): ActionCheck {
  const run = state.activeRun;
  if (run === null) return actionCheck(["No bake on the bench."]);
  if (!REVISITABLE_STAGES.includes(target) || !stagesFor(runKind(run)).includes(target))
    return actionCheck(["Only the design and pantry steps can be revisited."]);
  if (stageIndex(target) >= stageIndex(run.stage)) return actionCheck(["That step is still ahead."]);
  if (run.batches.some((batch) => batch.bake !== null))
    return actionCheck(["The first bake is in the oven, so the design is locked."]);
  if (target === "design" && run.batches.some((batch) => batch.committed))
    return actionCheck(["The mix is in the bowl, so the design is locked."]);
  return actionCheck([]);
}

function entered(state: GameState, run: BakeRun, target: RunStage): GameState | null {
  const moved: BakeRun = {
    ...run,
    stage: target,
    reached: stageIndex(target) > stageIndex(run.reached) ? target : run.reached,
    pantryHourPaid: target === "pantry" ? false : run.pantryHourPaid,
  };
  const next: GameState = { ...state, activeRun: moved };
  if (run.stage === "design" && dreamerFlair(run.design.colours.length, bakeTags(run)))
    return queueTraitBeat(next, "dreamer");
  if (target === "pipe") return applyIcing(next, moved);
  return next;
}

export function goToStage(state: GameState, target: RunStage): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  if (target === stageAfter(runKind(run), run.stage) && target !== "done") {
    if (!canAdvance(state).ok) return state;
    const spent = spendHours(state, leaveHours(run, state.upgrades));
    if (spent === null) return state;
    return entered(spent, run, target) ?? state;
  }
  if (!canGoBack(state, target).ok) return state;
  return entered(state, run, target) ?? state;
}
