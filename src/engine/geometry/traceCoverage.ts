import type { Point } from "./point";
import { traceTrack, visitedBins, type TraceTrack } from "./traceTrack";

export const TRACE_COMPLETE_SHARE = 0.94;

export function traceReach(toleranceCm: number): number {
  return Math.max(2.5, toleranceCm * 3);
}

export function trackVisits(track: TraceTrack, samples: readonly Point[], toleranceCm: number): boolean[] {
  return visitedBins(track, samples, traceReach(toleranceCm));
}

export function binCoverage(visited: readonly boolean[]): number {
  return visited.filter(Boolean).length / visited.length;
}

export function isCoverageComplete(coverage: number): boolean {
  return coverage >= TRACE_COMPLETE_SHARE;
}

export function traceCoverage(
  samples: readonly Point[],
  outline: readonly Point[],
  toleranceCm: number,
): number {
  return binCoverage(trackVisits(traceTrack(outline), samples, toleranceCm));
}

export function isTraceComplete(
  samples: readonly Point[],
  outline: readonly Point[],
  toleranceCm: number,
): boolean {
  return isCoverageComplete(traceCoverage(samples, outline, toleranceCm));
}
