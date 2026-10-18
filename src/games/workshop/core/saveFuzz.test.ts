import { describe, expect, it } from "vitest";
import { fuzzSaves } from "../../../engine/saveFuzz";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import {
  BIRDHOUSE_PLAN,
  lastGigId,
  newTestGame,
  playToReview,
  playUntil,
  settleStories,
  withActiveGig,
} from "./testPlaythrough";

function samples(): GameState[] {
  const fresh = newTestGame();
  const start = withActiveGig(settleStories(fresh), "grandpa-teodor");
  const midSaw = playUntil(start, lastGigId(start), BIRDHOUSE_PLAN, "saw");
  const halfSawn = reduce(midSaw, { type: "sawAssist", partId: "roof-1" });
  const delivered = reduce(playToReview(start, lastGigId(start), BIRDHOUSE_PLAN), { type: "deliver" });
  return [fresh, halfSawn, delivered];
}

describe("save fuzzing", () => {
  it("loads or cleanly refuses every hostile save and never touches shared prototypes", () => {
    const target = {
      parse: parseSave,
      serialize,
      newestVersion: SCHEMA_VERSION,
      afterLoad: (state: GameState) => reduce(state, { type: "endDay" }),
    };
    const report = fuzzSaves(target, samples(), 0x3d0d, 500);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.rejected).toBeGreaterThan(report.tried / 2);
  }, 120_000);
});
