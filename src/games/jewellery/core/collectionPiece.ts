import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { finishById, metalById, productById } from "./catalog";
import { canCarryMotif, hasShapeSlot } from "./collectionBrief";
import type { CollectionPiece, CollectionState, GemPick } from "./collectionState";
import { materialIssues, usedUp } from "./delivery";
import { finishCostIssues } from "./displayChoice";
import { MOTIF_CHARM } from "../content/extra";
import type { GameState } from "./gameState";
import { asPick } from "./gemTray";
import { launchStaged } from "./launchStatus";
import { runPartArea, runSheetArea } from "./lineSheet";
import { motifCutAccuracy } from "./motifMaster";
import { pieceColours } from "./pieceColours";
import { cutScore, joinScore, pieceQuality, setScore } from "./pieceQuality";
import type { PieceRun } from "./pieceRun";
import { runLook, runSource } from "./pieceSource";
import { pieceSpend } from "./pieceSpend";
import { pieceTags } from "./pieceTags";
import { polishScore } from "./polish";
import { shapeOption } from "./partGeometry";

const SWEET_SPOT_STEPS = 72;
const LAMP_STEP = 5;

function lineCollection(state: GameState): CollectionState | null {
  const collection = state.collection;
  if (state.career !== "collection" || collection === null || collection.brief === null) return null;
  return launchStaged(state, collection) ? null : collection;
}

export function canAddToCollection(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.stage !== "review" || run.purpose.kind !== "collection")
    return actionCheck(["Finish the piece first."]);
  const collection = lineCollection(state);
  if (collection === null)
    return actionCheck([
      state.collection?.brief === null
        ? "Plan this season's line on the Collection Board first."
        : "This season's line is already launched.",
    ]);
  const { slot } = run.purpose;
  if (collection.pieces.some((piece) => piece.slot === slot))
    return actionCheck(["That piece is already in the line."]);
  return actionCheck([...finishCostIssues(state, run), ...materialIssues(state, run)]);
}

export function carriesMotif(run: PieceRun, motif: string): boolean {
  const product = productById(run.design.productId);
  if (hasShapeSlot(product) && shapeOption(run.design.options) === motif) return true;
  return (
    canCarryMotif(product.id) &&
    run.display.charms.some((charm) => charm.charmId === MOTIF_CHARM && charm.shape === motif)
  );
}

function piecePot(collection: CollectionState, run: PieceRun): GemPick[] {
  return run.potStones.flatMap((index) => {
    const stone = collection.stonePot[index];
    return stone === undefined ? [] : [asPick(stone)];
  });
}

export function sweetSpotOf(seed: number): number {
  return (((seed % SWEET_SPOT_STEPS) + SWEET_SPOT_STEPS) % SWEET_SPOT_STEPS) * LAMP_STEP;
}

export function collectionPieceOf(
  state: GameState,
  collection: CollectionState,
  run: PieceRun,
  slot: number,
): CollectionPiece | null {
  const look = runLook(run);
  const brief = collection.brief;
  if (look === null || brief === null) return null;
  const potStones = piecePot(collection, run);
  const source = runSource(run);
  const seated = productById(run.design.productId).seats.length > 0;
  return {
    id: `piece-${run.id}`,
    look: { ...look, stoneTint: potStones[0]?.tint ?? null },
    quality: pieceQuality(state, run).quality,
    tags: pieceTags(source),
    colours: pieceColours(source),
    madeDay: state.calendar.day,
    slot,
    runId: run.id,
    cutAccuracy: cutScore(run),
    motifCutAccuracy: motifCutAccuracy(run, brief.motif),
    joinAccuracy: joinScore(run),
    setAccuracy: seated ? setScore(run) : null,
    polish: polishScore(run),
    carriesMotif: carriesMotif(run, brief.motif),
    potStones,
    sparkle: metalById(brief.metalId).sparkle,
    spend: pieceSpend(run),
    partArea: runPartArea(run),
    sheetArea: runSheetArea(run),
    sweetSpot: sweetSpotOf(run.seed),
  };
}

export function addToCollection(state: GameState): GameState {
  const run = state.activeRun;
  const collection = lineCollection(state);
  if (
    run === null ||
    collection === null ||
    run.purpose.kind !== "collection" ||
    !canAddToCollection(state).ok
  )
    return state;
  const piece = collectionPieceOf(state, collection, run, run.purpose.slot);
  if (piece === null) return state;
  return {
    ...state,
    coins: state.coins - finishById(run.display.finish).price,
    stock: usedUp(state.stock, run),
    activeRun: { ...run, stage: "done", reached: "done" },
    collection: {
      ...collection,
      pieces: [...collection.pieces, piece],
      nextPieceNumber: collection.nextPieceNumber + 1,
    },
  };
}
