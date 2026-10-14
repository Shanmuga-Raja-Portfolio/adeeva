import type { Point } from "./point";

export interface SegmentProjection {
  readonly t: number;
  readonly distance: number;
}

export function projectOnSegment(point: Point, start: Point, end: Point): SegmentProjection {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const squared = dx * dx + dy * dy;
  const t =
    squared === 0
      ? 0
      : Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / squared));
  return { t, distance: Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy)) };
}
