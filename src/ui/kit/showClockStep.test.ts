import { describe, expect, it } from "vitest";
import { momentAt, sceneLabel, showSegments } from "../show/showTimeline";
import { MAX_SHOW_FRAME_MS, nextShowElapsed } from "./showClockStep";

describe("nextShowElapsed", () => {
  it("plays ordinary frames at full speed and stops at the end", () => {
    expect(nextShowElapsed(0, 16, 3000)).toBe(16);
    expect(nextShowElapsed(2990, 16, 3000)).toBe(3000);
  });

  it("ignores a clock that runs backwards", () => {
    expect(nextShowElapsed(500, -40, 3000)).toBe(500);
  });

  it("slows a long frame down instead of jumping ahead", () => {
    expect(nextShowElapsed(1000, 60_000, 30_000)).toBe(1000 + MAX_SHOW_FRAME_MS);
  });

  it("never skips a scene, however long the device stalls between frames", () => {
    for (const still of [false, true]) {
      const segments = showSegments(3, still);
      const shortest = Math.min(...segments.map((segment) => segment.durationMs).filter((ms) => ms > 0));
      expect(MAX_SHOW_FRAME_MS).toBeLessThan(shortest);
      const total = segments.reduce((sum, segment) => sum + segment.durationMs, 0);
      const seen: string[] = [];
      for (let elapsed = 0, frame = 0; elapsed < total; frame += 1) {
        elapsed = nextShowElapsed(elapsed, frame % 2 === 0 ? 16 : 9000, total);
        const label = sceneLabel(momentAt(segments, elapsed).segment);
        if (seen[seen.length - 1] !== label) seen.push(label);
      }
      expect(seen).toEqual(segments.filter((segment) => segment.durationMs > 0).map(sceneLabel));
    }
  });
});
