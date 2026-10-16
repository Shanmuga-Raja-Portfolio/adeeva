import { describe, expect, it } from "vitest";
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

function base() {
  return withActiveGig(settleStories(newTestGame()), "grandpa-teodor");
}

describe("saving", () => {
  it("round-trips a fresh game, a piece mid-sawing and a delivered commission", () => {
    const fresh = newTestGame();
    expect(parseSave(serialize(fresh))).toEqual({ ok: true, state: fresh });
    const start = base();
    const midSaw = playUntil(start, lastGigId(start), BIRDHOUSE_PLAN, "saw");
    const halfSawn = reduce(midSaw, { type: "sawAssist", partId: "roof-1" });
    expect(parseSave(serialize(halfSawn))).toEqual({ ok: true, state: halfSawn });
    const delivered = reduce(playToReview(start, lastGigId(start), BIRDHOUSE_PLAN), { type: "deliver" });
    expect(parseSave(serialize(delivered))).toEqual({ ok: true, state: delivered });
  });

  it("explains damaged, foreign and future saves", () => {
    expect(parseSave("{not json")).toEqual({
      ok: false,
      error: "The save file is damaged and could not be read.",
    });
    expect(parseSave("[]").ok).toBe(false);
    const raw = JSON.parse(serialize(newTestGame())) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...raw, schemaVersion: 3 })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, schemaVersion: 0 })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, coins: "lots" })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, trends: { current: ["shiny"], next: [] } })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, upgrades: ["skylight", "skylight"] })).ok).toBe(false);
    const damaged = parseSave(JSON.stringify({ ...raw, activeRun: { id: "run-9", stage: "sawing" } }));
    expect(damaged.ok).toBe(false);
    if (!damaged.ok) expect(damaged.error).toContain("The save file is damaged");
  });

  it("refuses pieces that could never happen", () => {
    const start = base();
    const midSaw = playUntil(start, lastGigId(start), BIRDHOUSE_PLAN, "saw");
    const raw = JSON.parse(serialize(midSaw)) as { activeRun: Record<string, unknown> } & Record<
      string,
      unknown
    >;
    const run = raw.activeRun;
    const design = run.design as Record<string, unknown>;
    const loads = (changes: Record<string, unknown>, top: Record<string, unknown> = {}) =>
      parseSave(JSON.stringify({ ...raw, ...top, activeRun: { ...run, ...changes } })).ok;
    expect(loads({})).toBe(true);
    expect(loads({ design: { ...design, productId: "toy-chest" } })).toBe(false);
    expect(loads({ design: { ...design, woodId: "ebony" } })).toBe(false);
    expect(loads({ design: { ...design, options: { legs: "tapered-legs" } } })).toBe(false);
    expect(loads({ reached: "design" })).toBe(false);
    expect(loads({ cuts: { "ghost#0": { accuracy: 1, assisted: false } } })).toBe(false);
    expect(
      loads({ joints: { "peg-1": { offsetMm: 0, angleDeg: 0, goodTaps: 2, assisted: false, accuracy: 1 } } }),
    ).toBe(false);
    expect(loads({ cuts: { "roof-1#0": { accuracy: 2, assisted: false } } })).toBe(false);
    expect(loads({}, { nextBoardNumber: 1 })).toBe(false);
    expect(loads({}, { nextRunNumber: 1 })).toBe(false);
  });

  it("refuses extras whose numbers the next extra would reuse", () => {
    const start = base();
    const atFinish = playUntil(start, lastGigId(start), BIRDHOUSE_PLAN, "finish");
    const decorated = reduce(atFinish, { type: "addExtra", extraId: "wood-knob", x: 200, y: 150, piece: 0 });
    expect(decorated.activeRun?.extras.map((extra) => extra.id)).toEqual(["extra-1"]);
    const raw = JSON.parse(serialize(decorated)) as { activeRun: Record<string, unknown> } & Record<
      string,
      unknown
    >;
    const loads = (changes: Record<string, unknown>) =>
      parseSave(JSON.stringify({ ...raw, activeRun: { ...raw.activeRun, ...changes } })).ok;
    expect(loads({})).toBe(true);
    expect(loads({ nextExtraNumber: 1 })).toBe(false);
    const extras = raw.activeRun.extras as Record<string, unknown>[];
    expect(loads({ extras: extras.map((extra) => ({ ...extra, id: "knob" })) })).toBe(false);
  });

  it("refuses more hours today than the garage's day holds", () => {
    const raw = JSON.parse(serialize(newTestGame())) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...raw, calendar: { day: 1, hoursLeft: 11 } })).ok).toBe(false);
    const lit = { ...raw, calendar: { day: 1, hoursLeft: 11 }, upgrades: ["skylight"] };
    expect(parseSave(JSON.stringify(lit)).ok).toBe(true);
  });
});
