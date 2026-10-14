import type { RunStage } from "../content/runStage";
import type { CommissionRun } from "./commissionRun";
import type { GameState } from "./gameState";

export function updateRun(
  state: GameState,
  stage: RunStage,
  update: (run: CommissionRun) => CommissionRun | null,
): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== stage) return state;
  const next = update(run);
  if (next === null || next === run) return state;
  return { ...state, activeRun: next };
}
