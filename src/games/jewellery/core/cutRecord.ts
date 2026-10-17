import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { ASSIST_ACCURACY_CAP } from "../../../engine/assistCap";
import { clamp } from "../../../engine/clamp";
import type { Point } from "../../../engine/geometry/point";
import { traceAccuracy } from "../../../engine/geometry/traceAccuracy";
import { binCoverage } from "../../../engine/geometry/traceCoverage";
import { traceTrack, visitedBins } from "../../../engine/geometry/traceTrack";
import type { MetalId } from "../content/metal";
import { metalById } from "./catalog";
import type { GameState } from "./gameState";
import { designCutPaths, type CutPath } from "./partGeometry";
import type { PieceRun } from "./pieceRun";
import { claimLineSheet, plansOnLineSheet } from "./lineSheet";
import { withMotifMaster } from "./motifMaster";
import { plannedSizes } from "./sheetPlan";
import { skillMultiplier, type SkillState } from "./skillTolerance";
import { withMetal } from "./stock";

const BASE_PIERCE_TOLERANCE_MM = 0.8;
const MIN_SCREEN_TOLERANCE_PX = 8;
export const MIN_PX_PER_MM = 5;
export const MAX_PX_PER_MM = 20;
export const CUT_COVERAGE_NEEDED = 0.9;
export const MAX_STROKES = 240;
const MAX_CUT_SAMPLES = 9000;
const CUT_MARGIN_MM = 6;
const COVERAGE_REACH_FACTOR = 2;

export function cutToleranceMm(state: SkillState, metalId: MetalId): number {
  return BASE_PIERCE_TOLERANCE_MM * skillMultiplier(state, "steady-peg") * (1 - metalById(metalId).hardness);
}

export function scoringTolerance(toleranceMm: number, pxPerMm: number): number {
  return Math.max(toleranceMm, MIN_SCREEN_TOLERANCE_PX / pxPerMm);
}

export function dotReach(path: CutPath): number {
  const spacings = path.dots.flatMap((dot, index) =>
    path.dots.slice(index + 1).map((other) => Math.hypot(other[0] - dot[0], other[1] - dot[1])),
  );
  if (spacings.length === 0) return 1.2;
  return clamp(0.35 * Math.min(...spacings), 0.5, 1.5);
}

function nearestDot(point: Point, dots: readonly Point[], reach: number): number | null {
  let best: number | null = null;
  let bestDistance = reach;
  dots.forEach((dot, index) => {
    const distance = Math.hypot(point[0] - dot[0], point[1] - dot[1]);
    if (distance <= bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  return best;
}

export function trimStroke(stroke: readonly Point[], dots: readonly Point[], reach: number): Point[] {
  const first = stroke[0];
  if (first === undefined) return [];
  const startDot = nearestDot(first, dots, reach);
  let left = startDot === null;
  for (let index = 1; index < stroke.length; index += 1) {
    const point = stroke[index];
    if (point === undefined) break;
    const dot = nearestDot(point, dots, reach);
    if (dot === null) {
      left = true;
      continue;
    }
    if (dot !== startDot || left) {
      let end = index + 1;
      while (end < stroke.length) {
        const next = stroke[end];
        if (next === undefined || nearestDot(next, dots, reach) !== dot) break;
        end += 1;
      }
      return stroke.slice(0, end);
    }
  }
  return [...stroke];
}

export function cutSamples(
  strokes: readonly (readonly Point[])[],
  path: CutPath,
  assisted: boolean,
): Point[] {
  if (assisted) return strokes.flat();
  const reach = dotReach(path);
  return strokes.flatMap((stroke) => trimStroke(stroke, path.dots, reach));
}

function pathPerimeter(path: CutPath): number {
  return traceTrack(path.points).perimeter;
}

export function cutCoverage(samples: readonly Point[], path: CutPath, toleranceMm: number): number {
  if (samples.length === 0) return 0;
  return binCoverage(visitedBins(traceTrack(path.points), samples, COVERAGE_REACH_FACTOR * toleranceMm));
}

export function isCutComplete(samples: readonly Point[], path: CutPath, toleranceMm: number): boolean {
  return (
    cutCoverage(samples, path, toleranceMm) >= CUT_COVERAGE_NEEDED && samples.length >= pathPerimeter(path)
  );
}

export function cutAccuracy(
  samples: readonly Point[],
  path: CutPath,
  toleranceMm: number,
  assisted: boolean,
): number {
  if (assisted) return ASSIST_ACCURACY_CAP;
  return traceAccuracy(samples, path.points, toleranceMm);
}

export function runCutPaths(run: PieceRun): CutPath[] {
  return designCutPaths(run.design);
}

function strokesAreValid(strokes: readonly (readonly Point[])[], path: CutPath): boolean {
  if (strokes.length === 0 || strokes.length > MAX_STROKES) return false;
  const total = strokes.reduce((sum, stroke) => sum + stroke.length, 0);
  if (total > MAX_CUT_SAMPLES) return false;
  return strokes.every(
    (stroke) =>
      stroke.length > 0 &&
      stroke.every(
        ([x, y]) =>
          Number.isFinite(x) &&
          Number.isFinite(y) &&
          x >= -CUT_MARGIN_MM &&
          y >= -CUT_MARGIN_MM &&
          x <= path.width + CUT_MARGIN_MM &&
          y <= path.height + CUT_MARGIN_MM,
      ),
  );
}

function consumeSheets(state: GameState, run: PieceRun): GameState | null {
  if (run.consumed !== null) return state;
  const metalId = run.design.metalId;
  if (metalId === null) return null;
  const sizes = plannedSizes(run);
  const reused = plansOnLineSheet(state, run);
  const taken = reused ? sizes.filter((size) => size !== "wide") : sizes;
  if (sizes.length === 0 || taken.some((size) => state.stock.metal[metalId][size] < 1)) return null;
  const stock = taken.reduce((current, size) => withMetal(current, metalId, size, -1), state.stock);
  const consumed: PieceRun = { ...run, consumed: sizes, lineSheet: reused };
  return claimLineSheet({ ...state, stock, activeRun: consumed }, consumed, reused);
}

export function cutPath(
  state: GameState,
  pathId: string,
  strokes: readonly (readonly Point[])[],
  pxPerMm: number,
  assisted: boolean,
): GameState {
  const run = state.activeRun;
  if (run === null || run.stage !== "cut" || typeof assisted !== "boolean") return state;
  if (!Number.isFinite(pxPerMm) || pxPerMm < MIN_PX_PER_MM || pxPerMm > MAX_PX_PER_MM) return state;
  const metalId = run.design.metalId;
  const path = runCutPaths(run).find((entry) => entry.id === pathId);
  if (metalId === null || path === undefined || Object.hasOwn(run.cuts, pathId)) return state;
  if (!strokesAreValid(strokes, path)) return state;
  const tolerance = scoringTolerance(cutToleranceMm(state, metalId), pxPerMm);
  const samples = cutSamples(strokes, path, assisted);
  if (!isCutComplete(samples, path, tolerance)) return state;
  const consumed = consumeSheets(state, run);
  if (consumed === null) return state;
  const accuracy = cutAccuracy(samples, path, tolerance, assisted);
  const cut = updateActiveRun(consumed, "cut", (current) => ({
    ...current,
    cuts: { ...current.cuts, [pathId]: { accuracy, assisted } },
  }));
  return withMotifMaster(cut, run, pathId, accuracy);
}

export function cutIssues(run: PieceRun): string[] {
  const left = runCutPaths(run).filter((path) => !Object.hasOwn(run.cuts, path.id)).length;
  return left === 0 ? [] : [`Cut out ${left} more ${left === 1 ? "shape" : "shapes"}.`];
}
