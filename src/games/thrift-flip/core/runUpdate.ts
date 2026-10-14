import type { FlipRun } from "./flipRun";
import type { FlipStage } from "./flipStage";
import type { GameState } from "./gameState";
import { isStallDay } from "./stallCalendar";

export function updateRun(
  state: GameState,
  stage: FlipStage,
  update: (run: FlipRun) => FlipRun | null,
): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== stage || isStallDay(state.calendar.day)) return state;
  const next = update(run);
  if (next === null || next === run) return state;
  return { ...state, activeRun: next };
}
