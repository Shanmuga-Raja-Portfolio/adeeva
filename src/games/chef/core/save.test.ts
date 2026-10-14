import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { cookDish, must, newTestGame, perfectFollow, settleStories } from "./testPlaythrough";

function roundTrip(state: GameState): GameState {
  const parsed = parseSave(serialize(state));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.state;
}

function tampered(state: GameState, change: (raw: Record<string, unknown>) => void): string {
  const raw = JSON.parse(serialize(state)) as Record<string, unknown>;
  change(raw);
  return JSON.stringify(raw);
}

function midSimmer(): GameState {
  const start = settleStories(must(settleStories(newTestGame()), { type: "startLesson" }));
  const placed = ["toor-dal", "ghee", "cumin-seeds", "garlic", "turmeric"].reduce(
    (next, ingredientId) => reduce(next, { type: "placeIngredient", ingredientId }),
    must(start, { type: "goToStage", stage: "mise" }),
  );
  const cooking = must(placed, { type: "goToStage", stage: "cook" });
  const chopped = must(cooking, {
    type: "chopItem",
    itemIndex: 0,
    record: { offsets: [0, 0], assisted: false },
  });
  return must(chopped, {
    type: "stirSimmer",
    sample: { ...perfectFollow(3), progress: 1, ticks: 240, insideTicks: 200 },
  });
}

describe("saves", () => {
  it("round-trip a fresh kitchen, a pot mid-simmer, a finished lesson and a head chef service", () => {
    const fresh = settleStories(newTestGame());
    expect(roundTrip(fresh)).toEqual(fresh);
    const simmering = midSimmer();
    expect(simmering.activeRun?.simmer?.follow.ticks).toBe(240);
    expect(roundTrip(simmering)).toEqual(simmering);
    const done = settleStories(cookDish(settleStories(must(fresh, { type: "startLesson" }))));
    expect(roundTrip(done)).toEqual(done);
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
    expect(roundTrip(open)).toEqual(open);
    const ended = must(settleStories(open), { type: "endService", at: 240 });
    expect(roundTrip(ended)).toEqual(ended);
  });

  it("refuse damaged, foreign and inconsistent saves with a plain message", () => {
    const fresh = settleStories(newTestGame());
    expect(parseSave("{not json").ok).toBe(false);
    expect(parseSave("[]").ok).toBe(false);
    expect(parseSave(JSON.stringify({ schemaVersion: 9 })).ok).toBe(false);
    expect(parseSave(tampered(fresh, (raw) => (raw.rung = "astronaut"))).ok).toBe(false);
    expect(parseSave(tampered(fresh, (raw) => (raw.mentorsMet = ["indian", "indian"]))).ok).toBe(false);
    expect(parseSave(tampered(fresh, (raw) => (raw.menu = ["dal-tadka"]))).ok).toBe(false);
    expect(parseSave(tampered(fresh, (raw) => (raw.calendar = { day: 1, hoursLeft: 11 }))).ok).toBe(false);
    expect(
      parseSave(tampered(fresh, (raw) => (raw.profile = { ...(raw.profile as object), start: "chef" }))).ok,
    ).toBe(false);
    const simmering = midSimmer();
    const broken = tampered(simmering, (raw) => {
      (raw.activeRun as { dishId: string }).dishId = "pizza";
    });
    const result = parseSave(broken);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toMatch(/damaged/);
    expect(parseSave(tampered(simmering, (raw) => (raw.nextRunNumber = 1))).ok).toBe(false);
  });
});
