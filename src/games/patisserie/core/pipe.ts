import { cappedAccuracy } from "../../../engine/assistCap";
import type { Point } from "../../../engine/geometry/point";
import { traceAccuracy } from "../../../engine/geometry/traceAccuracy";
import { PIPE_PATTERNS, type PipePathDef } from "../content/pipePattern";
import { PIPE_CANVAS_CM } from "../content/pipeShape";
import { updateActiveRun } from "./activeRunUpdate";
import type { BakeRun, PipeRecord } from "./bakeRun";
import type { GameState } from "./gameState";
import { skillTolerance } from "./skillTolerance";

export const BASE_PIPE_TOLERANCE_CM = 0.8;
export const PIPING_SET_MULTIPLIER = 1.15;
export const CHECKPOINT_SPACING_CM = 1;
export const MIN_SAMPLE_SPACING_CM = 0.2;
export const MAX_PIPE_SAMPLES = 2000;
const SPACING_SLACK = 1e-6;

export function pipeTolerance(state: GameState): number {
  return (
    BASE_PIPE_TOLERANCE_CM *
    skillTolerance(state, { upgrade: "piping-set", multiplier: PIPING_SET_MULTIPLIER })
  );
}

export function runPipePaths(run: BakeRun): readonly PipePathDef[] {
  if (run.purpose.kind === "tray" || run.design.productId === null) return [];
  return PIPE_PATTERNS[run.design.productId][run.design.pattern].paths;
}

function segmentsOf(path: PipePathDef): [Point, Point][] {
  const { points, closed } = path;
  return points.flatMap((start, index): [Point, Point][] => {
    const end = points[index + 1] ?? (closed ? points[0] : undefined);
    return end === undefined ? [] : [[start, end]];
  });
}

export function pathLength(path: PipePathDef): number {
  return segmentsOf(path).reduce((sum, [a, b]) => sum + Math.hypot(b[0] - a[0], b[1] - a[1]), 0);
}

export function checkpoints(path: PipePathDef): Point[] {
  const result: Point[] = [];
  let carry = 0;
  for (const [a, b] of segmentsOf(path)) {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    let along = carry;
    while (along <= length) {
      const t = length === 0 ? 0 : along / length;
      result.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
      along += CHECKPOINT_SPACING_CM;
    }
    carry = along - length;
  }
  return result;
}

export function coverage(samples: readonly Point[], path: PipePathDef, toleranceCm: number): number {
  const marks = checkpoints(path);
  if (marks.length === 0 || samples.length === 0) return 0;
  const reached = marks.filter((mark) =>
    samples.some((sample) => Math.hypot(sample[0] - mark[0], sample[1] - mark[1]) <= toleranceCm),
  ).length;
  return reached / marks.length;
}

export function pipeAccuracy(
  samples: readonly Point[],
  path: PipePathDef,
  toleranceCm: number,
  assisted: boolean,
): number {
  const raw =
    traceAccuracy(samples, path.points, toleranceCm, path.closed) * coverage(samples, path, toleranceCm);
  return cappedAccuracy(raw, assisted);
}

export function areSamplesValid(samples: readonly Point[]): boolean {
  if (samples.length < 2 || samples.length > MAX_PIPE_SAMPLES) return false;
  return samples.every((point, index) => {
    const [x, y] = point;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (x < 0 || y < 0 || x > PIPE_CANVAS_CM || y > PIPE_CANVAS_CM) return false;
    const previous = samples[index - 1];
    return (
      previous === undefined ||
      Math.hypot(x - previous[0], y - previous[1]) >= MIN_SAMPLE_SPACING_CM - SPACING_SLACK
    );
  });
}

export function pipePath(
  state: GameState,
  pathId: string,
  samples: readonly Point[],
  assisted: boolean,
): GameState {
  if (!areSamplesValid(samples) || typeof assisted !== "boolean") return state;
  const tolerance = pipeTolerance(state);
  return updateActiveRun(state, "pipe", (run) => {
    const path = runPipePaths(run).find((entry) => entry.id === pathId);
    if (path === undefined || Object.hasOwn(run.pipes, pathId)) return null;
    const record: PipeRecord = { accuracy: pipeAccuracy(samples, path, tolerance, assisted), assisted };
    return { ...run, pipes: { ...run.pipes, [pathId]: record } };
  });
}
