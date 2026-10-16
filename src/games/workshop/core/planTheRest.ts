import { showMeSpot } from "./boardLayout";
import type { GameState } from "./gameState";
import { designParts } from "./pieceParts";

export function planTheRest(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== "layout" || run.purpose.kind !== "set") return state;
  let current = run;
  for (const part of designParts(run)) {
    if (Object.hasOwn(current.placements, part.id)) continue;
    const spot = showMeSpot(state, current, part.id);
    if (spot === null) continue;
    current = { ...current, placements: { ...current.placements, [part.id]: spot } };
  }
  return current === run ? state : { ...state, activeRun: current };
}
