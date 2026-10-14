import { updateActiveRun } from "../../../engine/activeRunUpdate";
import { cappedAccuracy } from "../../../engine/assistCap";
import { average } from "../../../engine/average";
import type { Point } from "../../../engine/geometry/point";
import { polylineLength } from "../../../engine/geometry/polylineLength";
import { recordWithout } from "../../../engine/recordWithout";
import type { PartDef } from "../content/product";
import { productById, productPart } from "./catalog";
import type { GameState } from "./gameState";
import { designInput, partOutline } from "./partGeometry";
import type { PieceRun, PolishRecord } from "./pieceRun";

export const POLISH_GRID = 6;
export const POLISH_CELLS = POLISH_GRID * POLISH_GRID;
const MIN_STROKE_PX = 20;
export const MAX_PASSES = 3;
const SHINE_PASSES = 2;
const POLISHED_SHARE = 0.6;
export const MAX_POLISH_STROKES = 400;
const MAX_STROKE_SAMPLES = 600;
const MIN_POLISH_PX_PER_MM = 2;
const MAX_POLISH_PX_PER_MM = 40;
const SUBSAMPLES = 3;
const LIVE_SUBSAMPLES = 3;
const STROKE_MARGIN_MM = 4;

export function pointInPolygon(point: Point, polygon: readonly Point[]): boolean {
  let inside = false;
  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index, index += 1) {
    const a = polygon[index];
    const b = polygon[previous];
    if (a === undefined || b === undefined) continue;
    const crosses = a[1] > point[1] !== b[1] > point[1];
    if (crosses && point[0] < ((b[0] - a[0]) * (point[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
  }
  return inside;
}

export function polishMask(outline: readonly Point[], width: number, height: number): boolean[] {
  const cellWidth = width / POLISH_GRID;
  const cellHeight = height / POLISH_GRID;
  return Array.from({ length: POLISH_CELLS }, (_, cell) => {
    const column = cell % POLISH_GRID;
    const row = Math.floor(cell / POLISH_GRID);
    let inside = 0;
    for (let sx = 0; sx < SUBSAMPLES; sx += 1)
      for (let sy = 0; sy < SUBSAMPLES; sy += 1) {
        const point: Point = [
          (column + (sx + 0.5) / SUBSAMPLES) * cellWidth,
          (row + (sy + 0.5) / SUBSAMPLES) * cellHeight,
        ];
        if (pointInPolygon(point, outline)) inside += 1;
      }
    return inside >= LIVE_SUBSAMPLES;
  });
}

export function partMask(run: PieceRun, part: PartDef): boolean[] {
  return polishMask(partOutline(part, designInput(run.design)), part.width, part.height);
}

function cellAt(point: Point, width: number, height: number): number | null {
  const column = Math.floor((point[0] / width) * POLISH_GRID);
  const row = Math.floor((point[1] / height) * POLISH_GRID);
  if (column < 0 || row < 0 || column >= POLISH_GRID || row >= POLISH_GRID) return null;
  return row * POLISH_GRID + column;
}

function strokeCells(samples: readonly Point[], width: number, height: number): Set<number> {
  const cells = new Set<number>();
  const step = Math.min(width, height) / (POLISH_GRID * 4);
  samples.forEach((point, index) => {
    const next = samples[index + 1] ?? point;
    const length = Math.hypot(next[0] - point[0], next[1] - point[1]);
    const parts = Math.max(1, Math.ceil(length / step));
    for (let part = 0; part <= parts; part += 1) {
      const t = part / parts;
      const cell = cellAt(
        [point[0] + (next[0] - point[0]) * t, point[1] + (next[1] - point[1]) * t],
        width,
        height,
      );
      if (cell !== null) cells.add(cell);
    }
  });
  return cells;
}

export function emptyPolish(): PolishRecord {
  return { passes: Array.from({ length: POLISH_CELLS }, () => 0), strokes: 0, assisted: false };
}

export function rubbed(
  record: PolishRecord,
  mask: readonly boolean[],
  samples: readonly Point[],
  part: PartDef,
): PolishRecord {
  const crossed = strokeCells(samples, part.width, part.height);
  return {
    passes: record.passes.map((passes, cell) =>
      mask[cell] === true && crossed.has(cell) ? Math.min(MAX_PASSES, passes + 1) : passes,
    ),
    strokes: record.strokes + 1,
    assisted: record.assisted,
  };
}

function samplesAreValid(samples: readonly Point[], part: PartDef): boolean {
  return (
    samples.length >= 2 &&
    samples.length <= MAX_STROKE_SAMPLES &&
    samples.every(
      ([x, y]) =>
        Number.isFinite(x) &&
        Number.isFinite(y) &&
        x >= -STROKE_MARGIN_MM &&
        y >= -STROKE_MARGIN_MM &&
        x <= part.width + STROKE_MARGIN_MM &&
        y <= part.height + STROKE_MARGIN_MM,
    )
  );
}

export function polishStroke(
  state: GameState,
  partKey: string,
  samples: readonly Point[],
  pxPerMm: number,
): GameState {
  if (!Number.isFinite(pxPerMm) || pxPerMm < MIN_POLISH_PX_PER_MM || pxPerMm > MAX_POLISH_PX_PER_MM)
    return state;
  return updateActiveRun(state, "polish", (run) => {
    const part = productPart(run.design.productId, partKey);
    if (part === undefined || !samplesAreValid(samples, part)) return null;
    if (polylineLength(samples) * pxPerMm < MIN_STROKE_PX) return null;
    const before = run.polish[partKey] ?? emptyPolish();
    if (before.assisted || before.strokes >= MAX_POLISH_STROKES) return null;
    const record = rubbed(before, partMask(run, part), samples, part);
    return { ...run, polish: { ...run.polish, [partKey]: record } };
  });
}

export function buffPart(state: GameState, partKey: string): GameState {
  return updateActiveRun(state, "polish", (run) => {
    const part = productPart(run.design.productId, partKey);
    if (part === undefined || run.polish[partKey]?.assisted === true) return null;
    const mask = partMask(run, part);
    const before = run.polish[partKey] ?? emptyPolish();
    const record: PolishRecord = {
      passes: before.passes.map((passes, cell) =>
        mask[cell] === true ? Math.max(passes, SHINE_PASSES) : passes,
      ),
      strokes: before.strokes,
      assisted: true,
    };
    return { ...run, polish: { ...run.polish, [partKey]: record } };
  });
}

export function shineShare(record: PolishRecord, mask: readonly boolean[]): number {
  const live = mask.filter(Boolean).length;
  if (live === 0) return 0;
  return record.passes.filter((passes, cell) => mask[cell] === true && passes >= SHINE_PASSES).length / live;
}

export function isPolished(record: PolishRecord | undefined, mask: readonly boolean[]): boolean {
  return record !== undefined && shineShare(record, mask) >= POLISHED_SHARE;
}

export function restartPolish(state: GameState, partKey: string): GameState {
  return updateActiveRun(state, "polish", (run) => {
    const part = productPart(run.design.productId, partKey);
    const record = run.polish[partKey];
    if (part === undefined || record === undefined || isPolished(record, partMask(run, part))) return null;
    return {
      ...run,
      polish: recordWithout(run.polish, partKey),
    };
  });
}

export function partPolishScore(record: PolishRecord | undefined, mask: readonly boolean[]): number {
  if (record === undefined) return 0;
  const live = mask.filter(Boolean).length;
  if (live === 0) return 0;
  const shine = record.passes.reduce(
    (sum, passes, cell) => sum + (mask[cell] === true ? Math.min(passes, SHINE_PASSES) : 0),
    0,
  );
  return cappedAccuracy(shine / (SHINE_PASSES * live), record.assisted);
}

export function polishScore(run: PieceRun): number {
  return average(
    productById(run.design.productId).parts.map((part) =>
      partPolishScore(run.polish[part.key], partMask(run, part)),
    ),
  );
}

export function polishedParts(run: PieceRun): number {
  return productById(run.design.productId).parts.filter((part) =>
    isPolished(run.polish[part.key], partMask(run, part)),
  ).length;
}

export function dullSpotsLeft(run: PieceRun): boolean {
  return productById(run.design.productId).parts.some((part) => {
    const record = run.polish[part.key];
    const mask = partMask(run, part);
    return (
      record === undefined || mask.some((live, cell) => live && (record.passes[cell] ?? 0) < SHINE_PASSES)
    );
  });
}

export function polishIssues(run: PieceRun): string[] {
  const left = productById(run.design.productId).parts.length - polishedParts(run);
  return left === 0 ? [] : [`Polish ${left} more ${left === 1 ? "piece" : "pieces"}.`];
}
