import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { FlipRun } from "./flipRun";
import type { FlipStage } from "./flipStage";
import type { GameState } from "./gameState";
import { isStallDay } from "./stallCalendar";

export function updateRun(
  state: GameState,
  stage: FlipStage,
  update: (run: FlipRun) => FlipRun | null,
): GameState {
  return isStallDay(state.calendar.day) ? state : updateActiveRun(state, stage, update);
}
