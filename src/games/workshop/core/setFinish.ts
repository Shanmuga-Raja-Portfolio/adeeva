import { actionCheck, type ActionCheck } from "../../../engine/actionCheck";
import { average } from "../../../engine/average";
import type { CommissionRun } from "./commissionRun";
import { harmonyPanel, paletteShare } from "./fairPanels";
import { autoSpots, rugsFor } from "./floorArrange";
import type { GameState } from "./gameState";
import { runJointAccuracy } from "./joint";
import { matchedFaces } from "./matchedFaces";
import { matchingHardware } from "./matchingHardware";
import { pieceColours } from "./pieceColours";
import { runPieces } from "./pieceParts";
import { constructionCount, isConstructionComplete, pieceQuality } from "./pieceQuality";
import { pieceTags } from "./pieceTags";
import { setEvenness } from "./setEvenness";
import { setPrice } from "./setPrice";
import { pieceQualities } from "./setQuality";
import { bayCount, freeBay } from "./showroomFloor";
import type { FloorSet, SetStats } from "./showroomState";

export function canFinishSet(state: GameState): ActionCheck {
  const run = state.activeRun;
  if (run === null || run.purpose.kind !== "set" || run.stage !== "review")
    return actionCheck(["Finish the set on the bench first."]);
  if (state.showroom === null) return actionCheck(["Open the showroom first."]);
  if (!isConstructionComplete(constructionCount(state, run)))
    return actionCheck(["The set is not finished yet."]);
  if (freeBay(state.showroom, bayCount(state)) === null) return actionCheck(["The floor is full."]);
  return actionCheck([]);
}

export function setStats(state: GameState, run: CommissionRun): SetStats {
  const qualities = pieceQualities(state, run);
  const quality = qualities.length === 0 ? 0 : Math.round(average(qualities));
  const colours = pieceColours(run);
  const faces = matchedFaces(run);
  const evenness = setEvenness(qualities);
  const hardware = matchingHardware(run);
  const harmony = harmonyPanel({
    matchedFaces: faces,
    evenness,
    palette: paletteShare(colours, run.brief.favouredColours),
    hardware,
  }).score;
  return {
    quality,
    jointAccuracy: runJointAccuracy(run),
    sandScore: pieceQuality(state, run).sand,
    matchedFaces: faces,
    evenness,
    hardware,
    harmony,
    colours,
    tags: pieceTags(run),
  };
}

export function finishSet(state: GameState): GameState {
  const run = state.activeRun;
  const showroom = state.showroom;
  if (run === null || showroom === null || run.purpose.kind !== "set" || !canFinishSet(state).ok)
    return state;
  const { woodId } = run.design;
  const bay = freeBay(showroom, bayCount(state));
  if (woodId === null || bay === null) return state;
  const pieces = runPieces(run);
  const rug = rugsFor(bayCount(state))[bay];
  if (rug === undefined) return state;
  const spots = autoSpots(
    pieces.map((piece) => piece.productId),
    rug,
  );
  const stats = setStats(state, run);
  const set: FloorSet = {
    setId: run.purpose.setId,
    templateId: run.purpose.templateId,
    madeDay: state.calendar.day,
    seasonNumber: showroom.seasonNumber,
    themeId: showroom.themeId,
    woodId,
    options: run.design.options,
    finish: run.finish,
    cushion: run.cushion?.fabricId ?? null,
    setJoint: run.purpose.setJoint,
    pieces: pieces.map((piece) => ({
      productId: piece.productId,
      quality: pieceQuality(state, run, piece.index).quality,
      tags: pieceTags(run, piece.index),
      extras: run.extras.filter((placed) => placed.piece === piece.index),
      spot: spots[piece.index] ?? { x: rug.x, y: rug.y, rotation: 0 },
    })),
    stats,
    price: setPrice({
      products: pieces.map((piece) => piece.productId),
      quality: stats.quality,
      woodId,
      harmony: stats.harmony,
      rosette: false,
    }),
    mode: "sale",
    bay,
  };
  return {
    ...state,
    activeRun: { ...run, stage: "done", reached: "done" },
    showroom: { ...showroom, floor: [...showroom.floor, set] },
  };
}
