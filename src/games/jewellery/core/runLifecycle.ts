import { nextRandom } from "../../../engine/rng";
import type { ProductId, StallProductId } from "../content/product";
import type { Brief } from "./brief";
import { isStallProductId } from "./catalog";
import { defaultOptions } from "./design";
import type { GameState } from "./gameState";
import { createPieceRun, type RunPurpose } from "./pieceRun";
import { stallBoxFull } from "./stallBox";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the piece on the bench first.";
  return null;
}

function withNewRun(
  state: GameState,
  purpose: RunPurpose,
  brief: Brief | null,
  productId: ProductId,
): GameState {
  const [roll, rng] = nextRandom(state.rng);
  const run = createPieceRun({
    id: `run-${state.nextRunNumber}`,
    purpose,
    brief,
    day: state.calendar.day,
    seed: Math.floor(roll * 2147483647),
    productId,
    options: defaultOptions(productId),
  });
  return { ...state, rng, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function startOrder(state: GameState, gigId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || runStartIssue(state) !== null) return state;
  return withNewRun(state, { kind: "order", gigId }, gig.brief, gig.brief.productId);
}

export function stallStartIssue(state: GameState): string | null {
  const issue = runStartIssue(state);
  if (issue !== null) return issue;
  return stallBoxFull(state.stallBox) ? "The stall box is full. Show your pieces on Market Day first." : null;
}

export function startStall(state: GameState, productId: StallProductId): GameState {
  if (!isStallProductId(productId) || stallStartIssue(state) !== null) return state;
  return withNewRun(state, { kind: "stall" }, null, productId);
}

export function abandonRun(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null || run.stage === "done") return state;
  return { ...state, activeRun: null };
}
