import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { GameState } from "./gameState";
import type { MakeoverRun } from "./makeoverRun";
import { lockRoom } from "./warehouse";

export function withPaintRun(
  state: GameState,
  update: (run: MakeoverRun, locked: GameState) => MakeoverRun | null,
): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== "paint") return state;
  const locked = lockRoom(state);
  if (locked === null) return state;
  const next = updateActiveRun(locked, "paint", (current) => update(current, locked));
  return next === locked ? state : next;
}
