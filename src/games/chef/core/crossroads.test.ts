import { describe, expect, it } from "vitest";
import { crossroadsGoals, crossroadsOpen, pathStartCost, previewPath } from "./crossroads";
import { reduce } from "./reduce";
import { currentBeat } from "./storyQueue";
import { crossroadsReady, must, newTestGame, settleStories } from "./testPlaythrough";
import { withCrossroadsBeat } from "./crossroads";

describe("the Crossroads", () => {
  it("opens for a head chef with reputation 85 and 12 passes, and plays its beat once", () => {
    const head = settleStories(newTestGame({ start: "head" }));
    expect(crossroadsOpen(head)).toBe(false);
    expect(crossroadsGoals(head)).toHaveLength(2);
    const student = settleStories(newTestGame());
    expect(crossroadsGoals({ ...student, reputation: 99, passes: { ...student.passes, head: 20 } })).toEqual([
      "Become head chef at the Hall.",
    ]);
    const ready = withCrossroadsBeat({ ...head, reputation: 85, passes: { ...head.passes, head: 12 } });
    expect(currentBeat(ready)?.id).toBe("ch-crossroads");
    const seen = settleStories(ready);
    expect(withCrossroadsBeat(seen)).toBe(seen);
  });

  it("queues the beat the moment an action brings the Crossroads into reach", () => {
    const head = settleStories(newTestGame({ start: "head" }));
    const almost = { ...head, reputation: 85, passes: { ...head.passes, head: 12 } };
    const next = reduce(almost, { type: "setGuide", on: !almost.guide });
    expect(currentBeat(next)?.id).toBe("ch-crossroads");
  });

  it("lets the player peek through each door once", () => {
    const ready = crossroadsReady();
    const peeked = must(ready, { type: "peekPath", path: "truck" });
    expect(peeked.peeked).toEqual(["truck"]);
    expect(reduce(peeked, { type: "peekPath", path: "truck" })).toBe(peeked);
    expect(reduce(ready, { type: "peekPath", path: "castle" })).toBe(ready);
    const closed = settleStories(newTestGame({ start: "head" }));
    expect(reduce(closed, { type: "peekPath", path: "tv" })).toBe(closed);
  });

  it("previews a door without spending or choosing", () => {
    const ready = crossroadsReady();
    const preview = previewPath(ready, "restaurant");
    expect(preview.path?.kind).toBe("restaurant");
    expect(preview.coins).toBe(ready.coins);
    expect(ready.path).toBeNull();
  });

  it("charges the start cost, halved on Relaxed, and makes the choice permanent", () => {
    const ready = crossroadsReady();
    expect(pathStartCost(ready, "restaurant")).toBe(900);
    expect(pathStartCost(crossroadsReady({ difficulty: "relaxed" }), "restaurant")).toBe(450);
    expect(pathStartCost(ready, "truck")).toBe(600);
    expect(pathStartCost(ready, "tv")).toBe(200);
    expect(reduce(ready, { type: "choosePath", path: "restaurant", nameCard: null })).toBe(ready);
    expect(reduce(ready, { type: "choosePath", path: "truck", nameCard: "warm-lamp" })).toBe(ready);
    const chosen = must(ready, { type: "choosePath", path: "restaurant", nameCard: "warm-lamp" });
    expect(chosen.coins).toBe(ready.coins - 900);
    expect(chosen.path?.kind).toBe("restaurant");
    expect(currentBeat(chosen)?.id).toBe("rs-keys");
    const settled = settleStories(chosen);
    expect(reduce(settled, { type: "choosePath", path: "tv", nameCard: null })).toBe(settled);
    expect(settled.board.shifts).toEqual([]);
  });

  it("asks for savings that cover the door", () => {
    const poor = crossroadsReady({}, 300);
    expect(reduce(poor, { type: "choosePath", path: "truck", nameCard: null })).toBe(poor);
    const tv = must(poor, { type: "choosePath", path: "tv", nameCard: null });
    expect(tv.coins).toBe(100);
    expect(currentBeat(tv)?.id).toBe("tv-first-segment");
    const truck = must(crossroadsReady(), { type: "choosePath", path: "truck", nameCard: null });
    expect(currentBeat(truck)?.id).toBe("tr-clementine");
  });
});
