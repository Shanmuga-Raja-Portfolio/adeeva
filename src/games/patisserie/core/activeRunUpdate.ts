import type { BakeRun } from "./bakeRun";
import type { GameState } from "./gameState";
import type { RunStage } from "./runStage";

export function updateActiveRun(
  state: GameState,
  stage: RunStage,
  update: (run: BakeRun) => BakeRun | null,
): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== stage) return state;
  const next = update(run);
  if (next === null || next === run) return state;
  return { ...state, activeRun: next };
}
