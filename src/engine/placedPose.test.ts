import { describe, expect, it } from "vitest";
import { clampPose, isValidPose, normalisedRotation, samePose, topLayer } from "./placedPose";

const CANVAS = { width: 400, height: 400 };

describe("placed poses", () => {
  it("keeps poses on the canvas and within the size range", () => {
    expect(isValidPose(CANVAS, { x: 10, y: 10, rotation: 45, scale: 1, layer: 1 })).toBe(true);
    expect(isValidPose(CANVAS, { x: 401, y: 10, rotation: 0, scale: 1, layer: 1 })).toBe(false);
    expect(isValidPose(CANVAS, { x: 10, y: 10, rotation: 0, scale: 2.1, layer: 1 })).toBe(false);
    expect(isValidPose(CANVAS, { x: 10, y: 10, rotation: 0, scale: 1, layer: 1.5 })).toBe(false);
    expect(clampPose(CANVAS, { x: -4, y: 500, rotation: -30, scale: 9, layer: -2 })).toEqual({
      x: 0,
      y: 400,
      rotation: 330,
      scale: 2,
      layer: 0,
    });
    expect(normalisedRotation(725)).toBe(5);
    expect(topLayer([{ layer: 2 }, { layer: 5 }])).toBe(5);
    expect(
      samePose(
        { x: 1, y: 2, rotation: 3, scale: 1, layer: 1 },
        { x: 1, y: 2, rotation: 3, scale: 1, layer: 1 },
      ),
    ).toBe(true);
  });
});
