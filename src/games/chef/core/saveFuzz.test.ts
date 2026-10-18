import { describe, expect, it } from "vitest";
import { fuzzSaves } from "../../../engine/saveFuzz";
import { SCHEMA_VERSION, type GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { cookDish, must, newTestGame, settleStories } from "./testPlaythrough";

function samples(): GameState[] {
  const fresh = settleStories(newTestGame());
  const lesson = settleStories(must(fresh, { type: "startLesson" }));
  const done = settleStories(cookDish(lesson));
  const head = settleStories(
    must(settleStories(newTestGame({ start: "head" })), {
      type: "setMenu",
      dishIds: ["dal-tadka", "jollof-rice", "kelewele", "elote", "miso-soup", "ratatouille"],
    }),
  );
  const offer = head.board.shifts[0];
  if (offer === undefined) throw new Error("no shift");
  const open = must(head, {
    type: "startShift",
    offerId: offer.id,
    setup: { special: null, helpers: ["lin", "yaw"] },
  });
  return [fresh, lesson, done, open];
}

describe("save fuzzing", () => {
  it("loads or cleanly refuses every hostile save and never touches shared prototypes", () => {
    const target = {
      parse: parseSave,
      serialize,
      newestVersion: SCHEMA_VERSION,
      afterLoad: (state: GameState) => reduce(state, { type: "endDay" }),
    };
    const report = fuzzSaves(target, samples(), 0xc4ef, 500);
    expect(report.failures).toEqual([]);
    expect(report.accepted).toBeGreaterThan(0);
    expect(report.rejected).toBeGreaterThan(report.tried / 2);
  }, 120_000);
});
