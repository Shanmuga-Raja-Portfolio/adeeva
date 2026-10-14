import { describe, expect, it } from "vitest";
import { ASSIST_SEW_ACCURACY_CAP } from "../../adeeva/core/seamAccuracy";
import { flipQuality } from "./flipQuality";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { isSewingComplete, sewMaterial } from "./sewing";
import {
  cutActions,
  dispatchAll,
  flipAtUnpick,
  layoutActions,
  newTestGame,
  runOf,
  scrubAll,
  settleStories,
  unpickAll,
} from "./testPlaythrough";
import { sewBand } from "./tolerance";

function atSew(): GameState {
  const unpicking = flipAtUnpick(
    settleStories(newTestGame()),
    "juniper-wren",
    { recipeId: "scrunchie-trio", parts: {} },
    [{ findId: "gingham-shirt", grade: "like-new" }],
  );
  const cleaning = reduce(unpickAll(unpicking, 2), { type: "goToStage", stage: "clean" });
  const laying = reduce(scrubAll(cleaning, 0), { type: "goToStage", stage: "layout" });
  const cutting = dispatchAll(laying, [...layoutActions(laying), { type: "goToStage", stage: "cut" }]);
  return dispatchAll(cutting, [...cutActions(cutting, "assist"), { type: "goToStage", stage: "sew" }]);
}

describe("sewing the seams", () => {
  it("uses ADEEVA's band, narrowed by the main find's material", () => {
    const state = atSew();
    expect(sewMaterial(runOf(state))).toBe("cotton");
    expect(sewBand(state, "cotton", false)).toBeCloseTo(0.12 * 0.95, 5);
    expect(sewBand(state, "silk", false)).toBeCloseTo(0.12 * 0.65, 5);
    expect(sewBand(state, "cotton", true)).toBeCloseTo(0.12 * 0.95 * 1.6, 5);
  });

  it("records seams that only grow and caps assisted seams at 0.8", () => {
    const state = atSew();
    const seam = (progress: number, ticks: number, insideTicks: number, assisted: boolean) =>
      ({ type: "recordSeam", seamId: "tube", progress, ticks, insideTicks, assisted }) as const;
    const half = reduce(state, seam(0.5, 300, 300, false));
    expect(reduce(half, seam(0.4, 400, 400, false))).toBe(half);
    expect(reduce(half, seam(0.6, 300, 300, false))).toBe(half);
    const done = dispatchAll(half, [seam(1, 600, 600, true), seam(1, 600, 600, false)]);
    const loop = reduce(done, {
      type: "recordSeam",
      seamId: "loop",
      progress: 1,
      ticks: 600,
      insideTicks: 600,
      assisted: false,
    });
    expect(isSewingComplete(runOf(loop))).toBe(true);
    expect(flipQuality(loop, runOf(loop)).seams).toBeCloseTo((ASSIST_SEW_ACCURACY_CAP + 1) / 2, 5);
    expect(
      reduce(loop, {
        type: "recordSeam",
        seamId: "nope",
        progress: 1,
        ticks: 600,
        insideTicks: 1,
        assisted: false,
      }),
    ).toBe(loop);
    const reset = reduce(loop, { type: "resetSeam", seamId: "tube" });
    expect(runOf(reset).seams.tube).toBeUndefined();
    expect(reduce(reset, { type: "resetSeam", seamId: "tube" })).toBe(reset);
  });

  it("takes one hour for scrunchies", () => {
    const state = atSew();
    const sewn = dispatchAll(state, [
      { type: "recordSeam", seamId: "tube", progress: 1, ticks: 600, insideTicks: 600, assisted: false },
      { type: "recordSeam", seamId: "loop", progress: 1, ticks: 600, insideTicks: 600, assisted: false },
      { type: "goToStage", stage: "finish" },
    ]);
    expect(sewn.calendar.hoursLeft).toBe(state.calendar.hoursLeft - 1);
  });
});
