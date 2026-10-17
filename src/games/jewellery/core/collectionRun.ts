import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { productById } from "./catalog";
import { slotStone } from "./collectionBrief";
import type { CollectionState } from "./collectionState";
import type { GameState } from "./gameState";
import { launchStaged } from "./launchStatus";
import { FRESH_DISPLAY, type PieceDesign } from "./pieceRun";
import { freshDesign, runStartIssue, withNewRun } from "./runLifecycle";
import { LANTERN_NIGHT_SEASON_DAY, lineSeason, seasonDayOf } from "./seasonCalendar";

export function lineInProgress(state: GameState): CollectionState | null {
  const collection = lineSeason(state, state.calendar.day);
  if (collection === null || collection.brief === null || launchStaged(state, collection)) return null;
  return collection;
}

export function slotOnBench(state: GameState, slot: number): boolean {
  const run = state.activeRun;
  return (
    run !== null && run.stage !== "done" && run.purpose.kind === "collection" && run.purpose.slot === slot
  );
}

export function canStartPiece(state: GameState, slot: number): ActionCheck {
  const collection = lineInProgress(state);
  if (collection === null || collection.brief === null)
    return actionCheck(["Confirm the Collection Board first."]);
  if (!Number.isInteger(slot) || collection.brief.products[slot] === undefined)
    return actionCheck(["That piece isn't on the board."]);
  if (collection.pieces.some((piece) => piece.slot === slot)) return actionCheck(["That piece is finished."]);
  if (slotOnBench(state, slot)) return actionCheck(["That piece is already on the bench."]);
  if ((seasonDayOf(collection, state.calendar.day) ?? 0) > LANTERN_NIGHT_SEASON_DAY)
    return actionCheck(["The bench rests for the Pop-up Window today."]);
  const issue = runStartIssue(state);
  return actionCheck(issue === null ? [] : [issue]);
}

export function lineDesign(collection: CollectionState, slot: number): PieceDesign | null {
  const brief = collection.brief;
  const productId = brief?.products[slot];
  if (brief === null || productId === undefined) return null;
  const fresh = freshDesign(productId);
  const product = productById(productId);
  return {
    ...fresh,
    options: product.slots.includes("shape") ? { ...fresh.options, shape: brief.motif } : fresh.options,
    metalId: brief.metalId,
    stoneId: slotStone(brief, productId),
  };
}

export function startCollectionPiece(state: GameState, slot: number): GameState {
  const collection = lineInProgress(state);
  if (collection === null || collection.brief === null || !canStartPiece(state, slot).ok) return state;
  const design = lineDesign(collection, slot);
  if (design === null) return state;
  const display = { ...FRESH_DISPLAY, finish: collection.brief.finish, glaze: collection.brief.glaze };
  return withNewRun(state, { kind: "collection", slot }, null, design, display);
}
