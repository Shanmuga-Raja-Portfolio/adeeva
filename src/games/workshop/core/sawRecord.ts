import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { average } from "../../../engine/average";
import type { Point } from "../../../engine/geometry/point";
import { ASSIST_CUT_ACCURACY, traceAccuracy } from "../../../engine/geometry/traceAccuracy";
import { binCoverage, traceReach } from "../../../engine/geometry/traceCoverage";
import { traceTrack, visitedBins, type TraceTrack } from "../../../engine/geometry/traceTrack";
import { polygonBounds } from "../../../engine/geometry/polygonPlacement";
import type { PartDef } from "../content/product";
import { boardSizeById } from "./catalog";
import type { CommissionRun, CutRecord } from "./commissionRun";
import { partPolygon, runBoardById } from "./boardLayout";
import type { GameState } from "./gameState";
import type { OwnedBoard } from "./ownedBoard";
import { designParts, findPart } from "./pieceParts";
import { cutLength, sawCuts, type SawCut } from "./sawPath";
import { sawTolerance } from "./tolerance";

const SAW_COVERAGE_SHARE = 0.9;
const MIN_SAMPLES_PER_CM = 1;
const MAX_SAW_SAMPLES = 20000;
const SPARE_MIN_LENGTH_CM = 60;

export function cutKey(partId: string, cutIndex: number): string {
  return `${partId}#${cutIndex}`;
}

export function partCuts(state: GameState, run: CommissionRun, part: PartDef): SawCut[] {
  const placement = Object.hasOwn(run.placements, part.id) ? run.placements[part.id] : undefined;
  const board = placement === undefined ? undefined : runBoardById(state, run, placement.boardId);
  if (placement === undefined || board === undefined) return [];
  return sawCuts(part, run.design, placement, board);
}

function cutRecord(run: CommissionRun, key: string): CutRecord | undefined {
  return Object.hasOwn(run.cuts, key) ? run.cuts[key] : undefined;
}

export function isPartSawn(state: GameState, run: CommissionRun, part: PartDef): boolean {
  const cuts = partCuts(state, run, part);
  return cuts.length > 0 && cuts.every((_, index) => cutRecord(run, cutKey(part.id, index)) !== undefined);
}

function partSawAccuracy(state: GameState, run: CommissionRun, part: PartDef): number {
  const cuts = partCuts(state, run, part);
  if (cuts.length === 0) return 0;
  return average(cuts.map((_, index) => cutRecord(run, cutKey(part.id, index))?.accuracy ?? 0));
}

export function runSawAccuracy(state: GameState, run: CommissionRun): number {
  const parts = designParts(run.design);
  return parts.length === 0 ? 0 : average(parts.map((part) => partSawAccuracy(state, run, part)));
}

function sawTrack(cut: SawCut): TraceTrack {
  const loop = traceTrack(cut.points);
  if (cut.closed) return loop;
  const segments = loop.segments.slice(0, -1);
  return { segments, perimeter: segments.reduce((sum, segment) => sum + segment.length, 0) };
}

export function sawCoverage(cut: SawCut, samples: readonly Point[], tolerance: number): number {
  if (samples.length === 0) return 0;
  return binCoverage(visitedBins(sawTrack(cut), samples, traceReach(tolerance)));
}

export function isSawComplete(cut: SawCut, samples: readonly Point[], tolerance: number): boolean {
  return (
    samples.length >= Math.ceil(cutLength(cut) * MIN_SAMPLES_PER_CM) &&
    sawCoverage(cut, samples, tolerance) >= SAW_COVERAGE_SHARE
  );
}

export function fitSawSamples(samples: readonly Point[]): readonly Point[] {
  if (samples.length <= MAX_SAW_SAMPLES) return samples;
  const step = Math.ceil(samples.length / (MAX_SAW_SAMPLES - 1));
  return samples.filter((_, index) => index % step === 0 || index === samples.length - 1);
}

function wellFormed(samples: readonly Point[]): boolean {
  return (
    samples.length > 0 &&
    samples.length <= MAX_SAW_SAMPLES &&
    samples.every((point) => Number.isFinite(point[0]) && Number.isFinite(point[1]))
  );
}

function sparePiece(board: OwnedBoard, run: CommissionRun, number: number): OwnedBoard | null {
  if (board.size !== "long") return null;
  const width = boardSizeById("long").width;
  const furthest = designParts(run.design).reduce((edge, part) => {
    const placement = Object.hasOwn(run.placements, part.id) ? run.placements[part.id] : undefined;
    if (placement === undefined || placement.boardId !== board.id) return edge;
    return Math.max(edge, polygonBounds(partPolygon(part, placement)).maxX);
  }, 0);
  if (width - furthest < SPARE_MIN_LENGTH_CM) return null;
  const offset = width - boardSizeById("short").width;
  return {
    id: `board-${number}`,
    woodId: board.woodId,
    size: "short",
    knots: board.knots
      .filter((knot) => knot.x + knot.r > offset)
      .map((knot) => ({ ...knot, x: knot.x - offset })),
    cost: 0,
    spare: true,
  };
}

function consumeSawnBoards(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) return state;
  const parts = designParts(run.design);
  const finished = state.boards.filter((board) => {
    const onBoard = parts.filter((part) => run.placements[part.id]?.boardId === board.id);
    return onBoard.length > 0 && onBoard.every((part) => isPartSawn(state, run, part));
  });
  if (finished.length === 0) return state;
  let nextBoardNumber = state.nextBoardNumber;
  const spares = finished.flatMap((board) => {
    const spare = sparePiece(board, run, nextBoardNumber);
    if (spare === null) return [];
    nextBoardNumber += 1;
    return [spare];
  });
  const finishedIds = new Set(finished.map((board) => board.id));
  return {
    ...state,
    boards: [...state.boards.filter((board) => !finishedIds.has(board.id)), ...spares],
    nextBoardNumber,
    activeRun: { ...run, usedBoards: [...run.usedBoards, ...finished] },
  };
}

export function sawCut(
  state: GameState,
  partId: string,
  cutIndex: number,
  samples: readonly Point[],
): GameState {
  if (!wellFormed(samples) || !Number.isInteger(cutIndex)) return state;
  const run = state.activeRun;
  const woodId = run?.design.woodId ?? null;
  if (run === null || woodId === null) return state;
  const tolerance = sawTolerance(state, woodId);
  const recorded = updateActiveRun(state, "saw", (current) => {
    const part = findPart(current.design, partId);
    const cut = part === undefined ? undefined : partCuts(state, current, part)[cutIndex];
    const key = cutKey(partId, cutIndex);
    if (cut === undefined || cutRecord(current, key) !== undefined) return null;
    if (!isSawComplete(cut, samples, tolerance)) return null;
    const accuracy = traceAccuracy(samples, cut.points, tolerance, cut.closed);
    return { ...current, cuts: { ...current.cuts, [key]: { accuracy, assisted: false } } };
  });
  return recorded === state ? state : consumeSawnBoards(recorded);
}

export function sawAssist(state: GameState, partId: string): GameState {
  const recorded = updateActiveRun(state, "saw", (run) => {
    const part = findPart(run.design, partId);
    if (part === undefined) return null;
    const open = partCuts(state, run, part)
      .map((_, index) => cutKey(partId, index))
      .filter((key) => cutRecord(run, key) === undefined);
    if (open.length === 0) return null;
    const added = Object.fromEntries(
      open.map((key): [string, CutRecord] => [key, { accuracy: ASSIST_CUT_ACCURACY, assisted: true }]),
    );
    return { ...run, cuts: { ...run.cuts, ...added } };
  });
  return recorded === state ? state : consumeSawnBoards(recorded);
}

export function sawnPartCount(state: GameState, run: CommissionRun): number {
  return designParts(run.design).filter((part) => isPartSawn(state, run, part)).length;
}
