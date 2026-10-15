import type { Point } from "./point";
import { projectOnSegment } from "./segmentProjection";

export const ASSIST_CUT_ACCURACY = 0.8;

export function distanceToOutline(point: Point, outline: readonly Point[], closed = true): number {
  const count = closed ? outline.length : outline.length - 1;
  let nearest = Infinity;
  for (let index = 0; index < count; index += 1) {
    const start = outline[index];
    const end = outline[(index + 1) % outline.length];
    if (start !== undefined && end !== undefined)
      nearest = Math.min(nearest, projectOnSegment(point, start, end).distance);
  }
  return nearest;
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
