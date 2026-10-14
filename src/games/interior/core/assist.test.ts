import type { DifficultyId } from "../../../engine/difficulty";
import { describe, expect, it } from "vitest";
import { kidSummary } from "./kidSummary";
import { lastResult } from "./reveal";
import { lastGigId, newTestGame, playOrder, recipeFor, settleStories, withOrder } from "./testPlaythrough";

function assistedReveal(difficulty: DifficultyId) {
  const ordered = withOrder(settleStories(newTestGame({ difficulty })), "nana-pearl");
  const recipe = {
    ...recipeFor("nana-pearl"),
    tidy: true,
    paintAssist: true,
    floorAssist: true,
    lightAssist: true,
  };
  const state = playOrder(ordered, lastGigId(ordered), recipe);
  const run = state.activeRun;
  const entry = run === null ? null : lastResult(state, run.id);
  if (run === null || entry === null) throw new Error("no result");
  return { run, entry };
}

describe("helpers", () => {
  it("cap every assisted step at 0.8 on Standard", () => {
    const { entry } = assistedReveal("standard");
    const { quality } = entry.evaluation;
    for (const value of [quality.flow, quality.paint, quality.floor, quality.light]) expect(value).toBe(0.8);
    expect(quality.quality).toBeGreaterThanOrEqual(80);
    expect(quality.quality).toBeLessThanOrEqual(84);
    expect(entry.evaluation.passed).toBe(true);
  });

  it("cap every assisted step at 0.7 on Challenging", () => {
    const { entry } = assistedReveal("challenging");
    const { quality } = entry.evaluation;
    for (const value of [quality.flow, quality.paint, quality.floor, quality.light]) expect(value).toBe(0.7);
  });

  it("explain the result in kid words", () => {
    const { run, entry } = assistedReveal("standard");
    const lines = kidSummary(run, entry.evaluation);
    expect(lines.map((line) => `${line.label}: ${line.verdict}`)).toEqual([
      "Walk-through: easy",
      "Walls: neat",
      "Floor: steady",
      "Light: 2 of 2 spots",
      "Must-haves: all there!",
      "Budget: on target!",
    ]);
    expect(lines.every((line) => line.good)).toBe(true);
  });
});
