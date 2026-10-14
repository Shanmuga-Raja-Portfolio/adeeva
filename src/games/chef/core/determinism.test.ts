import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { cookDish, must, newTestGame, playTicket, settleStories } from "./testPlaythrough";

function week(seed: number): GameState {
  let state = settleStories(newTestGame({ seed }));
  for (let day = 0; day < 6; day += 1) {
    if (state.board.lesson !== null)
      state = settleStories(cookDish(settleStories(must(state, { type: "startLesson" }))));
    state = settleStories(reduce(state, { type: "endDay" }));
  }
  return state;
}

function headService(seed: number): GameState {
  const head = settleStories(
    must(settleStories(newTestGame({ seed, start: "head" })), {
      type: "setMenu",
      dishIds: ["dal-tadka", "jollof-rice", "kelewele", "elote", "miso-soup", "ratatouille"],
    }),
  );
  const offer = head.board.shifts[0];
  if (offer === undefined) throw new Error("no shift");
  let state = settleStories(
    must(head, { type: "startShift", offerId: offer.id, setup: { special: null, helpers: ["lin", "yaw"] } }),
  );
  state = playTicket(state, 0, 10);
  return must(state, { type: "endService", at: 240 });
}

describe("determinism", () => {
  it("plays the same week the same way from the same seed", () => {
    expect(week(11)).toEqual(week(11));
    expect(headService(5)).toEqual(headService(5));
  });

  it("varies tickets and fees with the seed", () => {
    const a = settleStories(newTestGame({ seed: 1 }));
    const b = settleStories(newTestGame({ seed: 2 }));
    expect([a.board.lesson?.fee, a.trends.current]).not.toEqual([b.board.lesson?.fee, b.trends.current]);
    expect(headService(1).log).not.toEqual(headService(2).log);
  });
});
