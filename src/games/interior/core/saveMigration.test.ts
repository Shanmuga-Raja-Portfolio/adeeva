import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { DECOR_IDS } from "../content/decor";
import { FURNITURE_IDS } from "../content/furniture";
import type { GameState } from "./gameState";
import { OFFER_BEAT_ID } from "./larkspurOffer";
import { project, startHome } from "./larkspurPlaythrough";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { addDevelopmentFields } from "./saveMigrations";
import { playRunTo, recipeFor, settleStories } from "./testPlaythrough";

const FIXTURES = ["fresh", "midPaint", "bellwindStyle", "threshold", "fourOffers"] as const;
type Fixture = (typeof FIXTURES)[number];

function fixture(name: Fixture): string {
  return readFileSync(new URL(`./v1Saves/${name}.json`, import.meta.url), "utf8");
}

function loaded(name: Fixture): GameState {
  const parsed = parseSave(fixture(name));
  if (!parsed.ok) throw new Error(parsed.error);
  return parsed.state;
}

function deepFreeze<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    for (const entry of Object.values(value)) deepFreeze(entry);
    Object.freeze(value);
  }
  return value;
}

describe("saves from version 1", { timeout: 60_000 }, () => {
  it("load every committed fixture as a version 2 Room Designer save and round trip", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(fixture(name)) as { schemaVersion: number; coins: number; log: unknown[] };
      expect(raw.schemaVersion, name).toBe(1);
      const state = loaded(name);
      expect(state.schemaVersion).toBe(2);
      expect(state.career).toBe("loft");
      expect(state.larkspur).toBeNull();
      expect(state.profile.startedAs).toBe("loft");
      expect(state.coins).toBe(raw.coins);
      expect(state.log).toHaveLength(raw.log.length);
      for (const id of FURNITURE_IDS) expect(state.stock.furniture[id]).toBeGreaterThanOrEqual(0);
      for (const id of DECOR_IDS) expect(state.stock.decor[id]).toBeGreaterThanOrEqual(0);
      expect(state.stock.paints["golden-hour"]).toBe(0);
      const again = parseSave(serialize(state));
      expect(again.ok && again.state).toEqual(state);
    }
  });

  it("marks old work as done by hand, one zone, no smudges, and keeps the splats", () => {
    const raw = JSON.parse(fixture("midPaint")) as {
      activeRun: { rolls: { back: { splats: unknown[] } } };
    };
    const run = loaded("midPaint").activeRun;
    if (run === null) throw new Error("No run");
    expect(run.purpose).toEqual({ kind: "makeover" });
    expect(run.rollerZone).toBe("top");
    expect(run.lightCrew).toBeNull();
    expect(run.plan.lowerPaint).toBeNull();
    expect(Object.values(run.edges).every((edge) => !edge.byCrew)).toBe(true);
    expect(run.rolls["back"]?.byCrew).toBe(false);
    expect(run.rolls["back"]?.smudges).toBe(0);
    expect(run.rolls["back"]?.splats).toEqual(raw.activeRun.rolls.back.splats);
  });

  it("continues an open makeover to its reveal and End Day", () => {
    const state = loaded("midPaint");
    const revealed = reduce(playRunTo(state, recipeFor("nana-pearl"), "reveal"), { type: "reveal" });
    expect(revealed.log.at(-1)?.clientId).toBe("nana-pearl");
    const ended = reduce(settleStories(revealed), { type: "endDay" });
    expect(ended.calendar.day).toBeGreaterThan(state.calendar.day);
    const show = loaded("bellwindStyle");
    const opened = reduce(playRunTo(show, recipeFor("bellwind"), "reveal"), { type: "reveal" });
    expect(opened.log.at(-1)?.openHouse).not.toBeNull();
    const busy = loaded("fourOffers");
    expect(busy.gigs.offers).toHaveLength(4);
    expect(busy.gigs.active).toHaveLength(3);
  });

  it("offers Larkspur Close at the threshold, takes the keys, finishes the Bellwind room and starts plot 1", () => {
    const state = loaded("threshold");
    expect(state.story.queue).not.toContain(OFFER_BEAT_ID);
    const ended = reduce(state, { type: "endDay" });
    expect(ended.story.queue[0]).toBe(OFFER_BEAT_ID);
    const keys = reduce(ended, { type: "chooseStoryOption", beatId: OFFER_BEAT_ID, choiceId: "take-keys" });
    expect(keys.career).toBe("development");
    expect(keys.activeRun?.brief.clientId).toBe("bellwind");
    const revealed = settleStories(
      reduce(playRunTo(keys, recipeFor("bellwind"), "reveal"), { type: "reveal" }),
    );
    expect(revealed.log.at(-1)?.openHouse).not.toBeNull();
    const started = startHome(revealed);
    expect(project(started).plotId).toBe("garden-flat");
    const again = parseSave(serialize(started));
    expect(again.ok).toBe(true);
  });

  it("gets the offer after the next reveal when the save already meets the thresholds", () => {
    const state = loaded("threshold");
    const revealed = reduce(playRunTo(state, recipeFor("bellwind"), "reveal"), { type: "reveal" });
    expect(revealed.story.queue).toContain(OFFER_BEAT_ID);
  });

  it("never mutates its input and rejects future or damaged saves", () => {
    const raw = deepFreeze(JSON.parse(fixture("midPaint")) as Record<string, unknown>);
    const before = JSON.stringify(raw);
    const migrated = addDevelopmentFields(raw);
    expect(JSON.stringify(raw)).toBe(before);
    expect(migrated).not.toBe(raw);
    expect(migrated["career"]).toBe("loft");
    const future = parseSave(JSON.stringify({ ...JSON.parse(fixture("fresh")), schemaVersion: 3 }));
    expect(future.ok).toBe(false);
    expect(parseSave("{nope").ok).toBe(false);
    const broken = JSON.parse(fixture("fresh")) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...broken, coins: "lots" })).ok).toBe(false);
    const v2 = JSON.parse(serialize(loaded("fresh"))) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...v2, career: "development" })).ok).toBe(false);
    const showHome = JSON.parse(
      serialize(startHome(reduce(loaded("threshold"), { type: "openLarkspur" }))),
    ) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...showHome, career: "loft" })).ok).toBe(false);
  });
});
