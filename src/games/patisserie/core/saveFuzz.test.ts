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
  const fresh = newTestGame();
  const ordered = withOrder(settleStories(fresh), "pip");
  const plan = {
    ...GOOD_PLAN,
    productId: "cupcake-tray" as const,
    mixIds: ["vanilla-sponge" as const],
    fillingId: null,
    colours: ["sky" as const],
  };
  const midBake = playRunTo(reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) }), plan, "pipe");
  return [fresh, midBake, playOrder(ordered, lastGigId(ordered), plan)];
}

describe("save fuzzing", () => {
  it("loads or cleanly refuses every hostile save and never touches shared prototypes", () => {
    const target = {
      parse: parseSave,
      serialize,
      newestVersion: SCHEMA_VERSION,
      afterLoad: (state: GameState) => reduce(state, { type: "endDay" }),
    };
    const report = fuzzSaves(target, samples(), 0xca4e, 500);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.rejected).toBeGreaterThan(report.tried / 2);
  }, 120_000);
});
