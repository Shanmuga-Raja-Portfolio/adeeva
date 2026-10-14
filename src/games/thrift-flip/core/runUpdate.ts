import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { FlipRun } from "./flipRun";
import type { FlipStage } from "./flipStage";
import type { GameState } from "./gameState";
import { hallCommittedToday } from "./hallDay";
import { isStallDay } from "./stallCalendar";

export function updateRun(
  state: GameState,
  stage: FlipStage,
  update: (run: FlipRun) => FlipRun | null,
): GameState {
  if (isStallDay(state.calendar.day) || hallCommittedToday(state)) return state;
  return updateActiveRun(state, stage, update);
}
