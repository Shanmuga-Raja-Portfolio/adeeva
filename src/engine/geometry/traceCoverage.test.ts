import { describe, expect, it } from "vitest";
import type { Point } from "./point";
import {
  binCoverage,
  isCoverageComplete,
  isTraceComplete,
  TRACE_COMPLETE_SHARE,
  traceCoverage,
  trackVisits,
} from "./traceCoverage";
import { pointOnTrack, traceTrack } from "./traceTrack";

const outline: readonly Point[] = [
  [0, 0],
  [30, 0],
  [30, 30],
  [0, 30],
];
const track = traceTrack(outline);
const walk = (share: number): Point[] =>
  Array.from({ length: 400 }, (_, index) => pointOnTrack(track, (track.perimeter * share * index) / 399));

describe("trace coverage", () => {
  it("counts visited bins as a share", () => {
    expect(binCoverage([true, false, true, false])).toBe(0.5);
    expect(isCoverageComplete(TRACE_COMPLETE_SHARE)).toBe(true);
    expect(isCoverageComplete(TRACE_COMPLETE_SHARE - 0.01)).toBe(false);
  });

  it("agrees between the track and outline forms", () => {
    const half = walk(0.5);
    expect(traceCoverage(half, outline, 1)).toBe(binCoverage(trackVisits(track, half, 1)));
    expect(isTraceComplete(half, outline, 1)).toBe(false);
    expect(isTraceComplete(walk(1), outline, 1)).toBe(true);
  });
});
