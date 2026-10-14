import type { Point } from "./point";
import { projectOnSegment } from "./segmentProjection";

export const ASSIST_CUT_ACCURACY = 0.8;

export function distanceToOutline(point: Point, outline: readonly Point[], closed = true): number {
  const segments = closed ? outline : outline.slice(0, -1);
  const distances = segments.flatMap((start, index) => {
    const end = outline[(index + 1) % outline.length];
    return end === undefined ? [] : [projectOnSegment(point, start, end).distance];
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
