import { describe, expect, it } from "vitest";
import { fuzzSaves } from "../../../engine/saveFuzz";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import {
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  recipeFor,
  rowStroke,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function samples(): GameState[] {
  const fresh = settleStories(newTestGame());
  const ordered = withOrder(fresh, "nana-pearl");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  const atPaint = playRunTo(started, recipeFor("nana-pearl"), "paint");
  const rolling = reduce(atPaint, {
    type: "rollStroke",
    wall: "back",
    points: rowStroke(0),
    durationMs: 120,
  });
  const revealed = playOrder(ordered, lastGigId(ordered), recipeFor("nana-pearl"));
  return [fresh, rolling, revealed];
}

describe("save fuzzing", () => {
  it("loads or cleanly refuses every hostile save and never touches shared prototypes", () => {
    const target = {
      parse: parseSave,
      serialize,
      newestVersion: SCHEMA_VERSION,
      afterLoad: (state: GameState) => reduce(state, { type: "endDay" }),
    };
    const report = fuzzSaves(target, samples(), 0x1e7e, 500);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.rejected).toBeGreaterThan(report.tried / 2);
  }, 120_000);
});
