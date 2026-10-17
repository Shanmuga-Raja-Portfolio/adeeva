import { setAsideActiveRun } from "../../../engine/activeRunUpdate";
import { drawSeed } from "../../../engine/rngDraw";
import type { ProductId, StallProductId } from "../content/product";
import type { Brief } from "./brief";
import { isStallProductId } from "./catalog";
import { defaultOptions } from "./design";
import type { GameState } from "./gameState";
import {
  createPieceRun,
  FRESH_DISPLAY,
  type DisplayChoice,
  type PieceDesign,
  type RunPurpose,
} from "./pieceRun";
import { stallBoxFull } from "./stallBox";

export function runStartIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run !== null && run.stage !== "done") return "Finish or set aside the piece on the bench first.";
  return null;
}

export function freshDesign(productId: ProductId): PieceDesign {
  return { productId, options: defaultOptions(productId), metalId: null, stoneId: null };
}

function presetDesign(brief: Brief): PieceDesign {
  const fresh = freshDesign(brief.productId);
  if (brief.preset === null) return fresh;
  return {
    ...fresh,
    options: { ...fresh.options, ...brief.preset.options },
    metalId: brief.preset.metalId,
    stoneId: brief.preset.stoneId,
  };
}

export function withNewRun(
  state: GameState,
  purpose: RunPurpose,
  brief: Brief | null,
  design: PieceDesign,
  display: DisplayChoice = FRESH_DISPLAY,
): GameState {
  const [seed, rng] = drawSeed(state.rng);
  const run = createPieceRun({
    id: `run-${state.nextRunNumber}`,
    purpose,
    brief,
    day: state.calendar.day,
    seed,
    design,
    display,
  });
  return { ...state, rng, activeRun: run, nextRunNumber: state.nextRunNumber + 1 };
}

export function startOrder(state: GameState, gigId: string): GameState {
  const gig = state.gigs.active.find((entry) => entry.id === gigId);
  if (gig === undefined || runStartIssue(state) !== null) return state;
  return withNewRun(state, { kind: "order", gigId }, gig.brief, presetDesign(gig.brief));
}

export function stallStartIssue(state: GameState): string | null {
  const issue = runStartIssue(state);
  if (issue !== null) return issue;
  return stallBoxFull(state.stallBox) ? "The stall box is full. Show your pieces on Market Day first." : null;
}

export function startStall(state: GameState, productId: StallProductId): GameState {
  if (!isStallProductId(productId) || stallStartIssue(state) !== null) return state;
  return withNewRun(state, { kind: "stall" }, null, freshDesign(productId));
}

export function setAsideIssue(state: GameState): string | null {
  const run = state.activeRun;
  if (run === null || run.stage === "done") return "Nothing is on the bench.";
  if (run.purpose.kind !== "collection" || run.consumed === null) return null;
  return (state.collection?.brief ?? null) === null ? null : "Finish this piece first.";
}

export function abandonRun(state: GameState): GameState {
  return setAsideIssue(state) === null ? setAsideActiveRun(state) : state;
}
