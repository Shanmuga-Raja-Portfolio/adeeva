import type { Point } from "./point";

export const ASSIST_CUT_ACCURACY = 0.8;

function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / lengthSquared));
  return Math.hypot(point[0] - (start[0] + t * dx), point[1] - (start[1] + t * dy));
}

export function distanceToOutline(point: Point, outline: readonly Point[], closed = true): number {
  const segments = closed ? outline : outline.slice(0, -1);
  const distances = segments.flatMap((start, index) => {
    const end = outline[(index + 1) % outline.length];
    return end === undefined ? [] : [distanceToSegment(point, start, end)];
  });
  return distances.length === 0 ? Infinity : Math.min(...distances);
}

export function traceAccuracy(
  samples: readonly Point[],
  outline: readonly Point[],
  toleranceCm: number,
  closed = true,
): number {
  if (samples.length === 0) return 0;
  const within = samples.filter((sample) => distanceToOutline(sample, outline, closed) <= toleranceCm).length;
  return within / samples.length;
}
