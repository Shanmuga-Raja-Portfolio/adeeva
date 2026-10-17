import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { endDayOnce } from "./linePlaythrough";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { addCollectionFields } from "./saveMigrations";
import { GOOD_PLAN, playRunTo, settleStories, workStage } from "./testPlaythrough";

const FIXTURES = ["fresh", "midJoin", "stallDisplay", "afterMarket", "threshold", "fullStock"] as const;
type Fixture = (typeof FIXTURES)[number];

function v1Json(name: Fixture): string {
  return readFileSync(new URL(`./v1Saves/${name}.json`, import.meta.url), "utf8");
}

function loadV1(name: Fixture): GameState {
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

describe("saves from before the loft (version 1)", () => {
  it("load every committed version 1 save as a bench jeweller and round-trip as version 2", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(v1Json(name)) as Record<string, unknown>;
      expect(raw.schemaVersion, name).toBe(1);
      const state = loadV1(name);
      expect(state.schemaVersion).toBe(2);
      expect(state.career).toBe("bench");
      expect(state.profile.startedAs).toBe("bench");
      expect(state.collection).toBeNull();
      expect(state.launch).toBeNull();
      expect(state.stock.metal.pewter).toEqual({ sheet: 0, strip: 0, wide: 0 });
      expect(state.stock.stones.topaz).toBe(0);
      expect(state.stock.extras["motif-charm"]).toBe(0);
      expect(parseSave(serialize(state))).toEqual({ ok: true, state });
    }
  });

  it("keeps the calendar, coins, gigs, story, keepsakes and RNG exactly", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(v1Json(name)) as Record<string, unknown>;
      const state = loadV1(name);
      for (const key of ["calendar", "coins", "reputation", "buzz", "trends", "story", "rng", "log"] as const)
        expect(state[key], `${name}.${key}`).toEqual(raw[key]);
      expect(state.keepsakes).toHaveLength((raw.keepsakes as unknown[]).length);
      expect(state.gigs.active.map((gig) => gig.id)).toEqual(
        (raw.gigs as { active: { id: string }[] }).active.map((gig) => gig.id),
      );
      expect(state.gigs.active.every((gig) => gig.brief.preset === null)).toBe(true);
      expect(state.keepsakes.every((entry) => entry.look.stoneTint === null)).toBe(true);
    }
  });

  it("adds a null shape to every placed charm and keeps a stall piece at Display going", () => {
    const market = loadV1("afterMarket");
    const charms = market.keepsakes.flatMap((entry) => entry.look.charms);
    expect(charms.length).toBeGreaterThan(0);
    expect(charms.every((charm) => charm.shape === null)).toBe(true);
    expect(market.market.last?.slots.every((piece) => piece === null || piece.look.stoneTint === null)).toBe(
      true,
    );
    const display = loadV1("stallDisplay");
    expect(display.activeRun?.stage).toBe("display");
    expect(display.activeRun?.display.charms.every((charm) => charm.shape === null)).toBe(true);
    const finished = reduce(display, { type: "finishStall" });
    expect(finished.stallBox).toHaveLength(1);
  });

  it("continues a mid-order join to a delivery and End Day, then saves as version 2", () => {
    const state = loadV1("midJoin");
    expect(state.activeRun?.joins.seat).toMatchObject({ ticks: 90, twin: false });
    expect(state.activeRun?.twinGlow).toBe(false);
    const steady = { ...GOOD_PLAN, overTicks: 12 };
    const reviewed = playRunTo(workStage(state, steady), steady, "review");
    const delivered = reduce(reviewed, { type: "deliver" });
    expect(delivered.ordersDelivered).toBe(1);
    const ended = endDayOnce(delivered);
    expect(JSON.parse(serialize(ended)).schemaVersion).toBe(2);
  });

  it("gets the loft offer at the threshold and opens the loft", () => {
    const state = settleStories(loadV1("threshold"));
    expect(state.reputation).toBe(45);
    const ended = reduce(state, { type: "endDay" });
    expect(ended.story.queue).toContain("jb-loft-offer");
    const head = settleStories(ended);
    const opened = reduce(head, {
      type: "chooseStoryOption",
      beatId: "jb-loft-offer",
      choiceId: "launch",
      lineNameId: "little-lantern",
    });
    expect(opened.career).toBe("collection");
    expect(opened.gigs.active).toHaveLength(3);
    expect(parseSave(serialize(opened)).ok).toBe(true);
  });

  it("keeps full stock, upgrades and decor", () => {
    const state = loadV1("fullStock");
    expect(state.upgrades).toEqual(["steady-peg", "gentle-lamp", "magnifier", "comfy-stool"]);
    expect(state.decor).toEqual(["lantern-string", "mirror-easel", "velvet-awning"]);
    expect(state.stock.metal.gold).toEqual({ sheet: 3, strip: 2, wide: 1 });
  });

  it("never mutates its input", () => {
    for (const name of FIXTURES) {
      const raw = deepFreeze(JSON.parse(v1Json(name)) as Record<string, unknown>);
      const before = JSON.stringify(raw);
      const migrated = addCollectionFields(raw);
      expect(migrated).not.toBe(raw);
      expect(JSON.stringify(raw)).toBe(before);
    }
  });

  it("reports version 3 and damaged saves instead of resetting them", () => {
    const raw = JSON.parse(v1Json("fresh")) as Record<string, unknown>;
    const future = parseSave(JSON.stringify({ ...raw, schemaVersion: 3 }));
    expect(future.ok).toBe(false);
    if (!future.ok) expect(future.error).toContain("version 3");
    const damaged = parseSave(JSON.stringify({ ...raw, coins: "lots" }));
    expect(damaged.ok).toBe(false);
    expect(parseSave("{not json").ok).toBe(false);
  });

  it("rejects a v2 save whose career and loft disagree, or with impossible twin joins and charm shapes", () => {
    const state = loadV1("midJoin");
    expect(parseSave(serialize({ ...state, career: "collection" })).ok).toBe(false);
    const run = state.activeRun;
    if (run === null) throw new Error("no run");
    const twin = {
      ...run,
      joins: {
        seat: {
          ...(run.joins.seat ?? { ticks: 0, insideTicks: 0, overTicks: 0, assisted: false }),
          twin: true,
        },
      },
    };
    expect(parseSave(serialize({ ...state, activeRun: twin })).ok).toBe(false);
    const purpose = { ...run, purpose: { kind: "collection" as const, slot: 0 }, brief: null };
    expect(parseSave(serialize({ ...state, activeRun: purpose })).ok).toBe(false);
    const market = loadV1("afterMarket");
    const keepsake = market.keepsakes[0];
    const charm = keepsake?.look.charms[0];
    if (keepsake === undefined || charm === undefined) throw new Error("no charm");
    const shaped = {
      ...keepsake,
      look: { ...keepsake.look, charms: [{ ...charm, shape: "star" as const }] },
    };
    expect(parseSave(serialize({ ...market, keepsakes: [shaped, ...market.keepsakes.slice(1)] })).ok).toBe(
      false,
    );
  });
});
