import { describe, expect, it } from "vitest";
import { parseSave, serialize } from "./save";
import { reduce } from "./reduce";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  settleStories,
  withOrder,
} from "./testPlaythrough";

describe("saving", () => {
  it("round-trips a fresh game, a bake mid-oven and a delivered order", () => {
    const fresh = newTestGame();
    expect(parseSave(serialize(fresh))).toEqual({ ok: true, state: fresh });
    const ordered = withOrder(settleStories(fresh), "pip");
    const plan = {
      ...GOOD_PLAN,
      productId: "cupcake-tray" as const,
      mixIds: ["vanilla-sponge" as const],
      fillingId: null,
      colours: ["sky" as const],
    };
    const midBake = playRunTo(
      reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) }),
      plan,
      "pipe",
    );
    expect(parseSave(serialize(midBake))).toEqual({ ok: true, state: midBake });
    const delivered = playOrder(ordered, lastGigId(ordered), plan);
    expect(parseSave(serialize(delivered))).toEqual({ ok: true, state: delivered });
  });

  it("explains damaged, foreign and future saves", () => {
    expect(parseSave("{not json")).toEqual({
      ok: false,
      error: "The save file is damaged and could not be read.",
    });
    expect(parseSave("[]").ok).toBe(false);
    const raw = JSON.parse(serialize(newTestGame())) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...raw, schemaVersion: 2 })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, coins: "lots" })).ok).toBe(false);
    expect(
      parseSave(JSON.stringify({ ...raw, pantry: { ...(raw.pantry as object), gels: { glitter: 2 } } })).ok,
    ).toBe(false);
    expect(
      parseSave(JSON.stringify({ ...raw, nextRunNumber: 1, log: [], activeRun: null, bakeBook: [] })).ok,
    ).toBe(true);
    const run = { id: "run-9", stage: "baking" };
    const damaged = parseSave(JSON.stringify({ ...raw, activeRun: run }));
    expect(damaged.ok).toBe(false);
    if (!damaged.ok) expect(damaged.error).toContain("The save file is damaged");
  });

  it("refuses bakes and counters that could never happen", () => {
    const ordered = withOrder(settleStories(newTestGame()), "pip");
    const plan = {
      ...GOOD_PLAN,
      productId: "cupcake-tray" as const,
      mixIds: ["vanilla-sponge" as const],
      fillingId: null,
      colours: ["sky" as const],
    };
    const atWeigh = playRunTo(
      reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) }),
      plan,
      "weigh",
    );
    const raw = JSON.parse(serialize(atWeigh)) as { activeRun: Record<string, unknown> } & Record<
      string,
      unknown
    >;
    const run = raw.activeRun;
    const design = run.design as Record<string, unknown>;
    const loads = (changes: Record<string, unknown>, top: Record<string, unknown> = {}) =>
      parseSave(JSON.stringify({ ...raw, ...top, activeRun: { ...run, ...changes } })).ok;
    expect(loads({})).toBe(true);
    expect(loads({ purpose: { kind: "tray" }, brief: null, stage: "pipe", reached: "pipe" })).toBe(false);
    expect(loads({ design: { ...design, productId: "two-tier-cake" } })).toBe(false);
    expect(loads({ design: { ...design, colours: ["sky", "sky"] } })).toBe(false);
    expect(loads({ design: { ...design, colours: ["sky", "blush", "ivory", "rose"] } })).toBe(false);
    expect(loads({ stack: { stand: "ghost" } })).toBe(false);
    expect(loads({ stage: "review", reached: "review" })).toBe(false);
    expect(loads({ reached: "design" })).toBe(false);
    expect(loads({ pipes: { "not-a-line": { accuracy: 1, assisted: false } } })).toBe(false);
    const counter = raw.counter as Record<string, unknown>;
    const session = (sold: number[]) => ({ counter: { ...counter, session: { cards: [], sold, coins: 0 } } });
    expect(loads({}, session([]))).toBe(true);
    expect(loads({}, session([50]))).toBe(false);
  });
});
