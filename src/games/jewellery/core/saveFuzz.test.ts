import { describe, expect, it } from "vitest";
import { fuzzSaves } from "../../../engine/saveFuzz";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function samples(): GameState[] {
  const fresh = settleStories(newTestGame());
  const ordered = withOrder(fresh, "gran-mina");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  const joining = reduce(playRunTo(started, GOOD_PLAN, "join"), {
    type: "recordJoin",
    jointId: "seat",
    ticks: 90,
    insideTicks: 60,
    overTicks: 12,
    assisted: false,
  });
  const delivered = playOrder(ordered, lastGigId(ordered), GOOD_PLAN);
  return [fresh, joining, playRunTo(started, GOOD_PLAN, "review"), delivered];
}

describe("save fuzzing", () => {
  it("loads or cleanly refuses every hostile save and never touches shared prototypes", () => {
    const target = {
      parse: parseSave,
      serialize,
      newestVersion: SCHEMA_VERSION,
      afterLoad: (state: GameState) => reduce(state, { type: "endDay" }),
    };
    const report = fuzzSaves(target, samples(), 0x9e3, 500);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.rejected).toBeGreaterThan(report.tried / 2);
  }, 120_000);
});
