import type { Point } from "../../../../../../engine/geometry/point";
import { MAX_SCRUB_TICKS, MIN_SCRUB_SPEED, stainGrid, type Stain, type StainWork } from "../../../../core";

export interface ScrubSample {
  readonly point: Point;
  readonly speed: number;
}

export function cellAt(stain: Stain, point: Point): number | null {
  const dx = point[0] - stain.cx;
  const dy = point[1] - stain.cy;
  if (Math.hypot(dx, dy) > stain.radius) return null;
  const { rows, cols } = stainGrid(stain.cells);
  const col = Math.min(cols - 1, Math.max(0, Math.floor(((dx + stain.radius) / (stain.radius * 2)) * cols)));
  const row = Math.min(rows - 1, Math.max(0, Math.floor(((dy + stain.radius) / (stain.radius * 2)) * rows)));
  return row * cols + col;
}

export function scrubTick(work: StainWork, stain: Stain, sample: ScrubSample, gentle: number): StainWork {
  if (work.scrubTicks >= MAX_SCRUB_TICKS || sample.speed < MIN_SCRUB_SPEED) return work;
  const cell = cellAt(stain, sample.point);
  if (cell === null) return work;
  if (sample.speed > gentle)
    return { ...work, harshTicks: work.harshTicks + 1, scrubTicks: work.scrubTicks + 1 };
  const cellTicks = work.cellTicks.map((ticks, index) => (index === cell ? ticks + 1 : ticks));
  return { ...work, cellTicks, scrubTicks: work.scrubTicks + 1 };
}
