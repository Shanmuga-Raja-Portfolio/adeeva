import { describe, expect, it } from "vitest";
import { fuzzSaves } from "../../../engine/saveFuzz";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { craftToReview, newTestGame, withActiveGig } from "./testPlaythrough";

function samples(): GameState[] {
  const base = withActiveGig(newTestGame({ career: "label" }), "valentina");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  const crafting = craftToReview(reduce(base, { type: "startRun", gigId: gig.id }));
  const delivered = reduce(crafting, { type: "deliver" });
  return [newTestGame(), crafting, reduce(delivered, { type: "startLook", lookIndex: 1 })];
}

describe("save fuzzing", () => {
  it("loads or cleanly refuses every hostile save and never touches shared prototypes", () => {
    const target = {
      parse: parseSave,
      serialize,
      newestVersion: SCHEMA_VERSION,
      afterLoad: (state: GameState) => reduce(state, { type: "endDay" }),
    };
    const report = fuzzSaves(target, samples(), 0xade7a, 500);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.rejected).toBeGreaterThan(report.tried / 2);
  }, 120_000);
});
