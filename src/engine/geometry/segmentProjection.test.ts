import { describe, expect, it } from "vitest";
import { projectOnSegment } from "./segmentProjection";

describe("projectOnSegment", () => {
  it("finds how far along the segment a point falls and how far away it is", () => {
    expect(projectOnSegment([5, 3], [0, 0], [10, 0])).toEqual({ t: 0.5, distance: 3 });
    expect(projectOnSegment([-4, 3], [0, 0], [10, 0])).toEqual({ t: 0, distance: 5 });
    expect(projectOnSegment([13, 4], [0, 0], [10, 0])).toEqual({ t: 1, distance: 5 });
    expect(projectOnSegment([3, 4], [0, 0], [0, 0])).toEqual({ t: 0, distance: 5 });
  });
});
