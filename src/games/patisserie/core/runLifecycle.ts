import { setAsideActiveRun } from "../../../engine/activeRunUpdate";
import { TRAY_PRODUCT_IDS, type TrayProductId } from "../content/product";
import { createBakeRun, type BakeRun, type RunPurpose } from "./bakeRun";
import type { Brief } from "./brief";
import { counterCapacity, isCounterDay } from "./counter";
import { chooseProduct } from "./design";
import type { GameState } from "./gameState";

export const COUNTER_DAY_REST = "It's Counter Day, so the oven rests. Open the counter instead!";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the bake on the bench first.";
  if (isCounterDay(state.calendar.day)) return COUNTER_DAY_REST;
  return null;
}

function withNewRun(state: GameState, purpose: RunPurpose, brief: Brief | null): GameState {
  const run: BakeRun = createBakeRun(`run-${state.nextRunNumber}`, purpose, brief, state.calendar.day);
  return { ...state, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function startOrder(state: GameState, gigId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || runStartIssue(state) !== null) return state;
  return withNewRun(state, { kind: "order", gigId }, gig.brief);
}

export function trayStartIssue(state: GameState): string | null {
  const issue = runStartIssue(state);
  if (issue !== null) return issue;
  if (state.counter.trays.length >= counterCapacity(state))
    return "The counter is full. Sell the trays on Counter Day first.";
  return null;
}

export function startTray(state: GameState, productId: TrayProductId): GameState {
  if (!TRAY_PRODUCT_IDS.includes(productId) || trayStartIssue(state) !== null) return state;
  return chooseProduct(withNewRun(state, { kind: "tray" }, null), productId);
}

export function abandonRun(state: GameState): GameState {
  return setAsideActiveRun(state);
}
