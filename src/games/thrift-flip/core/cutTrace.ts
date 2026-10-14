import type { Point } from "../../../engine/geometry/point";
import { traceAccuracy } from "../../../engine/geometry/traceAccuracy";
import { isTraceComplete } from "../../../engine/geometry/traceCoverage";
import { flipPiece } from "./flipPieces";
import type { GameState } from "./gameState";
import { piecePolygon } from "./placement";
import { updateRun } from "./runUpdate";
import { cutTolerance } from "./tolerance";

export const MIN_TRACE_SAMPLES = 8;

function wellFormed(samples: readonly Point[]): boolean {
  return (
    samples.length >= MIN_TRACE_SAMPLES &&
    samples.every((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
  );
}

export function traceCut(state: GameState, pieceId: string, samples: readonly Point[]): GameState {
  if (!wellFormed(samples)) return state;
  const tolerance = cutTolerance(state);
  return updateRun(state, "cut", (run) => {
    const piece = flipPiece(run.design, pieceId);
    const placement = piece === undefined ? undefined : run.placements[pieceId];
    if (run.cutDone || piece === undefined || placement === undefined) return null;
    const outline = piecePolygon(piece, placement);
    if (!isTraceComplete(samples, outline, tolerance)) return null;
    const accuracy = traceAccuracy(samples, outline, tolerance);
    if (run.cutTraces[pieceId] === accuracy) return null;
    return { ...run, cutTraces: { ...run.cutTraces, [pieceId]: accuracy } };
  });
}
