import { describe, expect, it } from "vitest";
import { crossfadeFrames, momentAt, progressPips, showSegments, STILL_FADE_MS } from "./showTimeline";

describe("crossfadeFrames", () => {
  it("shows only the current scene while moving", () => {
    const segments = showSegments(2, false);
    const moment = momentAt(segments, 3399);
    expect(crossfadeFrames(segments, moment, false)).toEqual([{ moment, opacity: 1 }]);
  });

  it("fades the next still in over the last part of a scene", () => {
    const segments = showSegments(2, true);
    const title = segments[0]?.durationMs ?? 0;
    const early = momentAt(segments, title - STILL_FADE_MS - 1);
    expect(crossfadeFrames(segments, early, true)).toHaveLength(1);
    const late = momentAt(segments, title - STILL_FADE_MS / 2);
    const frames = crossfadeFrames(segments, late, true);
    expect(frames).toHaveLength(2);
    expect(frames[1]?.moment.index).toBe(1);
    expect(frames[1]?.opacity).toBeCloseTo(0.5);
  });

  it("never fades past the last scene", () => {
    const segments = showSegments(1, true);
    const end = momentAt(segments, 1e9);
    expect(crossfadeFrames(segments, end, true)).toHaveLength(1);
  });
});

describe("progressPips", () => {
  it("counts walks, finale and bow but not the title or lights", () => {
    expect(progressPips(showSegments(3, false)).map((segment) => segment.kind)).toEqual([
      "walk",
      "walk",
      "walk",
      "finale",
      "bow",
    ]);
  });
});
