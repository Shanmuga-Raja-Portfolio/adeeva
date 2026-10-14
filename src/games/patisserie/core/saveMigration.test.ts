import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { addDepthFields } from "./saveMigrations";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { GOOD_PLAN, playRunTo, settleStories } from "./testPlaythrough";

const FIXTURES = ["fresh", "midOrderPipe", "counterOpen", "busyMidweek", "threshold"] as const;

function v1Json(name: (typeof FIXTURES)[number]): string {
  return readFileSync(new URL(`./v1Saves/${name}.json`, import.meta.url), "utf8");
}

function loadV1(name: (typeof FIXTURES)[number]): GameState {
  const result = parseSave(v1Json(name));
  if (!result.ok) throw new Error(`${name}: ${result.error}`);
  return result.state;
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const entry of Object.values(value)) deepFreeze(entry);
    Object.freeze(value);
  }
  return value;
}

describe("saves from before the Comet Room", () => {
  it("load every committed version 1 save as a Corner Baker", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(v1Json(name)) as Record<string, unknown>;
      expect(raw.schemaVersion, name).toBe(1);
      const state = loadV1(name);
      expect(state.schemaVersion).toBe(2);
      expect(state.career).toBe("bakery");
      expect(state.profile.startedAs).toBe("bakery");
      expect(state.salon).toBeNull();
      expect(state.fair).toBeNull();
      expect(state.pantry.teas).toEqual({
        "garden-mint": 0,
        "apple-cinnamon": 0,
        "red-bush-vanilla": 0,
        "hot-cocoa": 0,
      });
      expect(state.pantry.ingredients.cream).toBe(0);
      expect(state.pantry.toppings["sugar-daisy"]).toBe(0);
      expect(state.bakeBook.every((entry) => entry.quality === null)).toBe(true);
      expect(parseSave(serialize(state))).toEqual({ ok: true, state });
    }
  });

  it("keeps the calendar, coins, orders, counter and story exactly", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(v1Json(name)) as Record<string, unknown>;
      const state = loadV1(name);
      expect(state.calendar).toEqual(raw.calendar);
      expect(state.coins).toBe(raw.coins);
      expect(state.reputation).toBe(raw.reputation);
      expect(state.counter).toEqual(raw.counter);
      expect(state.story).toEqual(raw.story);
      expect(state.rng).toBe(raw.rng);
      expect(state.log).toEqual(raw.log);
      const gigs = raw.gigs as { offers: unknown[]; active: unknown[] };
      expect(state.gigs.offers).toHaveLength(gigs.offers.length);
      expect(state.gigs.active).toHaveLength(gigs.active.length);
      expect(state.gigs.active.every((gig) => gig.brief.minColours === 0)).toBe(true);
    }
  });

  it("continues a half-piped order to a delivery and the next day", () => {
    const state = loadV1("midOrderPipe");
    expect(state.activeRun?.stage).toBe("pipe");
    expect(state.activeRun?.flourishes).toEqual([]);
    expect(state.activeRun?.word).toBeNull();
    const plan = {
      ...GOOD_PLAN,
      productId: "cupcake-tray" as const,
      mixIds: ["vanilla-sponge" as const],
      fillingId: null,
      colours: ["sky" as const],
    };
    const delivered = reduce(playRunTo(state, plan, "review"), { type: "deliver" });
    expect(delivered.activeRun?.stage).toBe("done");
    expect(delivered.ordersDelivered).toBe(state.ordersDelivered + 1);
    expect(delivered.bakeBook[delivered.bakeBook.length - 1]?.quality).toBeGreaterThan(80);
    const tomorrow = reduce(settleStories(delivered), { type: "endDay" });
    expect(tomorrow.calendar.day).toBe(state.calendar.day + 1);
  });

  it("carries on an open Counter Day", () => {
    const state = loadV1("counterOpen");
    const session = state.counter.session;
    expect(session).not.toBeNull();
    const closed = reduce(state, { type: "closeCounter" });
    expect(closed.counter.session).toBeNull();
    const nextWeek = reduce(closed, { type: "endDay" });
    expect(nextWeek.coins).toBe(closed.coins - 70);
  });

  it("keeps four pending offers and three active orders on a mid-week day", () => {
    const state = loadV1("busyMidweek");
    expect(state.calendar.day).toBe(10);
    expect(state.gigs.offers).toHaveLength(4);
    expect(state.gigs.active).toHaveLength(3);
    const started = reduce(state, { type: "startOrder", gigId: state.gigs.active[0]?.id ?? "" });
    expect(started.activeRun?.brief?.minColours).toBe(0);
  });

  it("offers the parlour to a player already at the threshold after their next delivery", () => {
    const state = loadV1("threshold");
    expect(state.story.queue).not.toContain("pa-salon-offer");
    const delivered = reduce(state, { type: "deliver" });
    expect(delivered.story.queue).toContain("pa-salon-offer");
    const opened = reduce(
      settleStories({ ...delivered, story: { ...delivered.story, queue: ["pa-salon-offer"] } }),
      {
        type: "chooseStoryOption",
        beatId: "pa-salon-offer",
        choiceId: "open",
      },
    );
    expect(opened.career).toBe("salon");
  });

  it("never changes the save it was given", () => {
    const raw = deepFreeze(JSON.parse(v1Json("threshold")) as Record<string, unknown>);
    const before = JSON.stringify(raw);
    const migrated = addDepthFields(raw);
    expect(JSON.stringify(raw)).toBe(before);
    expect(migrated).not.toBe(raw);
    expect(migrated.career).toBe("bakery");
  });

  it("still refuses saves from the future and damaged saves", () => {
    const raw = JSON.parse(v1Json("fresh")) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...raw, schemaVersion: 3 })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, pantry: "empty" })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, profile: null })).ok).toBe(false);
    const v2 = JSON.parse(serialize(loadV1("fresh"))) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...v2, career: "salon" })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...v2, career: "pirate" })).ok).toBe(false);
  });
});
