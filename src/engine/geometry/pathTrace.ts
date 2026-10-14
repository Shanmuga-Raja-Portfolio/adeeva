import type { Point } from "./point";
import { binCoverage, traceReach } from "./traceCoverage";
import { traceTrack, visitedBins, type TraceTrack } from "./traceTrack";

export interface TracePath {
  readonly points: readonly Point[];
  readonly closed: boolean;
}

export const PATH_COVERAGE_SHARE = 0.9;
const MIN_SAMPLES_PER_CM = 1;

export function pathTrack(path: TracePath): TraceTrack {
  const loop = traceTrack(path.points);
  if (path.closed) return loop;
  const segments = loop.segments.slice(0, -1);
  return { segments, perimeter: segments.reduce((sum, segment) => sum + segment.length, 0) };
}

export function pathLength(path: TracePath): number {
  return pathTrack(path).perimeter;
}

export function pathCoverage(path: TracePath, samples: readonly Point[], tolerance: number): number {
  if (samples.length === 0) return 0;
  return binCoverage(visitedBins(pathTrack(path), samples, traceReach(tolerance)));
}

export function isPathTraced(path: TracePath, samples: readonly Point[], tolerance: number): boolean {
  return (
    samples.length >= Math.ceil(pathLength(path) * MIN_SAMPLES_PER_CM) &&
    pathCoverage(path, samples, tolerance) >= PATH_COVERAGE_SHARE
  );
}
