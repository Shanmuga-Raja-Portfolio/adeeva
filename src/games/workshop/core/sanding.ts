import { updateActiveRun } from "../../../engine/activeRunUpdate";
import type { Point } from "../../../engine/geometry/point";
import { recordWithout } from "../../../engine/recordWithout";
import type { CommissionRun, SandRecord } from "./commissionRun";
import type { GameState } from "./gameState";
import { designSurfaces } from "./pieceParts";
import { sandAngleLimit } from "./tolerance";

export const SAND_CANVAS = { width: 320, height: 160 } as const;
export const SAND_COLUMNS = 8;
export const SAND_ROWS = 4;
export const SAND_CELLS = SAND_COLUMNS * SAND_ROWS;
export const MAX_PASSES = 3;
export const MAX_STROKES = 400;
const SEGMENT_UNITS = 10;
const MIN_STROKE_UNITS = 30;
const MAX_DRAG_POINTS = 4000;
export const ASSIST_SAND_CAP = 0.7;
const SAND_DONE_SMOOTH = 0.75;
export const ACROSS_WARNING_SHARE = 1 / 3;

export const EMPTY_SAND: SandRecord = {
  passes: Array.from({ length: SAND_CELLS }, () => 0),
  strokes: 0,
  across: 0,
  assisted: false,
};

interface SandStroke {
  readonly points: readonly Point[];
  readonly along: boolean;
}

function distance(a: Point, b: Point): number {
  return Math.hypot(b[0] - a[0], b[1] - a[1]);
}

interface EvenPoint {
  readonly point: Point;
  readonly next: number;
}

export interface SettledDrag {
  readonly settled: readonly Point[];
  readonly rest: readonly Point[];
}

function evenPoints(points: readonly Point[], step: number): EvenPoint[] {
  const first = points[0];
  if (first === undefined) return [];
  const out: EvenPoint[] = [{ point: first, next: 1 }];
  let last: Point = first;
  for (let index = 1; index < points.length; index += 1) {
    const point = points[index];
    if (point === undefined) continue;
    let gap = distance(last, point);
    while (gap >= step) {
      const t = step / gap;
      last = [last[0] + (point[0] - last[0]) * t, last[1] + (point[1] - last[1]) * t];
      out.push({ point: last, next: index });
      gap = distance(last, point);
    }
  }
  return out;
}

function resample(points: readonly Point[], step: number): Point[] {
  return evenPoints(points, step).map((entry) => entry.point);
}

function reverses(before: Point, previous: Point, point: Point): boolean {
  return (
    (previous[0] - before[0]) * (point[0] - previous[0]) +
      (previous[1] - before[1]) * (point[1] - previous[1]) <
    0
  );
}

export function settleDrag(points: readonly Point[]): SettledDrag {
  const even = evenPoints(points, SEGMENT_UNITS);
  let cut: EvenPoint | null = null;
  for (let index = 2; index < even.length; index += 1) {
    const before = even[index - 2];
    const previous = even[index - 1];
    const point = even[index];
    if (before === undefined || previous === undefined || point === undefined) continue;
    if (reverses(before.point, previous.point, point.point)) cut = previous;
  }
  if (cut === null) return { settled: [], rest: points };
  return {
    settled: [...points.slice(0, cut.next), cut.point],
    rest: [cut.point, ...points.slice(cut.next)],
  };
}

function pathLength(points: readonly Point[]): number {
  return points.slice(1).reduce((sum, point, index) => sum + distance(points[index] ?? point, point), 0);
}

export function splitStrokes(points: readonly Point[]): Point[][] {
  const even = resample(points, SEGMENT_UNITS);
  const strokes: Point[][] = [];
  let current: Point[] = even.slice(0, 1);
  for (let index = 1; index < even.length; index += 1) {
    const point = even[index];
    const previous = even[index - 1];
    const before = even[index - 2];
    if (point === undefined || previous === undefined) continue;
    if (before !== undefined && reverses(before, previous, point)) {
      strokes.push(current);
      current = [previous];
    }
    current.push(point);
  }
  strokes.push(current);
  return strokes.filter((stroke) => pathLength(stroke) >= MIN_STROKE_UNITS);
}

function strokeAngleFromLines(stroke: readonly Point[]): number {
  const start = stroke[0];
  const end = stroke[stroke.length - 1];
  if (start === undefined || end === undefined) return 0;
  const angle = Math.abs((Math.atan2(end[1] - start[1], end[0] - start[0]) * 180) / Math.PI);
  return Math.min(angle, 180 - angle);
}

function cellOf(point: Point): number {
  const column = Math.min(
    SAND_COLUMNS - 1,
    Math.max(0, Math.floor((point[0] / SAND_CANVAS.width) * SAND_COLUMNS)),
  );
  const row = Math.min(SAND_ROWS - 1, Math.max(0, Math.floor((point[1] / SAND_CANVAS.height) * SAND_ROWS)));
  return row * SAND_COLUMNS + column;
}

function cellsCrossed(stroke: readonly Point[]): Set<number> {
  return new Set(resample(stroke, SEGMENT_UNITS / 2).map(cellOf));
}

export function sandStrokes(points: readonly Point[], angleLimit: number, assisted: boolean): SandStroke[] {
  return splitStrokes(points).map((stroke) => ({
    points: stroke,
    along: assisted || strokeAngleFromLines(stroke) <= angleLimit,
  }));
}

export function applyStrokes(
  record: SandRecord,
  strokes: readonly SandStroke[],
  assisted: boolean,
): SandRecord {
  const passes = [...record.passes];
  for (const stroke of strokes)
    for (const cell of cellsCrossed(stroke.points))
      passes[cell] = Math.min(MAX_PASSES, (passes[cell] ?? 0) + 1);
  return {
    passes,
    strokes: record.strokes + strokes.length,
    across: record.across + strokes.filter((stroke) => !stroke.along).length,
    assisted: record.assisted || assisted,
  };
}

export function surfaceSmooth(record: SandRecord): number {
  return (
    record.passes.reduce((sum, passes) => sum + Math.min(passes, MAX_PASSES), 0) / (MAX_PASSES * SAND_CELLS)
  );
}

export function crossShare(record: SandRecord): number {
  return record.strokes === 0 ? 0 : record.across / record.strokes;
}

export function surfaceScore(record: SandRecord): number {
  const score = surfaceSmooth(record) * (1 - 0.5 * crossShare(record));
  return record.assisted ? Math.min(ASSIST_SAND_CAP, score) : score;
}

export function isSurfaceWornOut(record: SandRecord): boolean {
  return record.strokes >= MAX_STROKES;
}

export function isSurfaceDone(record: SandRecord): boolean {
  return record.passes.every((passes) => passes >= 1) && surfaceSmooth(record) >= SAND_DONE_SMOOTH;
}

export function sandRecordOf(run: CommissionRun, surfaceId: string): SandRecord {
  return Object.hasOwn(run.sanding, surfaceId) ? (run.sanding[surfaceId] ?? EMPTY_SAND) : EMPTY_SAND;
}

function wellFormed(points: readonly Point[]): boolean {
  return (
    points.length >= 2 &&
    points.length <= MAX_DRAG_POINTS &&
    points.every(
      ([x, y]) =>
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= -SEGMENT_UNITS &&
        y >= -SEGMENT_UNITS &&
        x <= SAND_CANVAS.width + SEGMENT_UNITS &&
        y <= SAND_CANVAS.height + SEGMENT_UNITS,
    )
  );
}

export function sandDrag(
  state: GameState,
  surfaceId: string,
  points: readonly Point[],
  assisted: boolean,
): GameState {
  if (!wellFormed(points)) return state;
  const limit = sandAngleLimit(state);
  return updateActiveRun(state, "sand", (run) => {
    if (!designSurfaces(run.design).some((part) => part.id === surfaceId)) return null;
    const before = sandRecordOf(run, surfaceId);
    if (isSurfaceDone(before) && before.passes.every((passes) => passes >= MAX_PASSES)) return null;
    const strokes = sandStrokes(points, limit, assisted).slice(0, Math.max(0, MAX_STROKES - before.strokes));
    if (strokes.length === 0) return null;
    return { ...run, sanding: { ...run.sanding, [surfaceId]: applyStrokes(before, strokes, assisted) } };
  });
}

export function resetSurface(state: GameState, surfaceId: string): GameState {
  return updateActiveRun(state, "sand", (run) =>
    Object.hasOwn(run.sanding, surfaceId) ? { ...run, sanding: recordWithout(run.sanding, surfaceId) } : null,
  );
}

export function surfaceScores(run: CommissionRun): number[] {
  return designSurfaces(run.design).map((part) => surfaceScore(sandRecordOf(run, part.id)));
}

export function sandedSurfaceCount(run: CommissionRun): number {
  return designSurfaces(run.design).filter((part) => isSurfaceDone(sandRecordOf(run, part.id))).length;
}
