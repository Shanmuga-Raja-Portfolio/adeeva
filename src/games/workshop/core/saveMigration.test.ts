import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { addShowroomFields } from "./saveMigrations";
import {
  dispatchAll,
  playSteps,
  runOf,
  settleStories,
  type PiecePlan,
  BIRDHOUSE_PLAN,
} from "./testPlaythrough";
import { workshopModule } from "../module";

const FIXTURES = ["fresh", "midJoin", "midFinish", "threshold", "fullRack"] as const;

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

const BENCH: PiecePlan = {
  ...BIRDHOUSE_PLAN,
  productId: "window-bench",
  options: { edge: "rounded-edge", legs: "splayed-legs" },
  woodId: "cedar",
};

function finishedDay(state: GameState): GameState {
  return settleStories(reduce(settleStories(state), { type: "endDay" }));
}

describe("saves from before the showroom (version 1)", () => {
  it("load every committed version 1 save as a garage maker", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(v1Json(name)) as Record<string, unknown>;
      expect(raw.schemaVersion, name).toBe(1);
      const state = loadV1(name);
      expect(state.schemaVersion).toBe(2);
      expect(state.career).toBe("garage");
      expect(state.profile.startedAs).toBe("garage");
      expect(state.showroom).toBeNull();
      expect(state.fair).toBeNull();
      expect(state.apprentice).toBeNull();
      expect(parseSave(serialize(state))).toEqual({ ok: true, state });
    }
  });

  it("keeps the calendar, coins, gigs, boards, upgrades, decor, log and story exactly", () => {
    for (const name of FIXTURES) {
      const raw = JSON.parse(v1Json(name)) as Record<string, unknown>;
      const state = loadV1(name);
      for (const key of [
        "calendar",
        "coins",
        "reputation",
        "buzz",
        "trends",
        "gigs",
        "story",
        "boards",
      ] as const)
        expect(state[key], `${name}.${key}`).toEqual(raw[key]);
      for (const key of [
        "upgrades",
        "decor",
        "log",
        "delivered",
        "rng",
        "nextRunNumber",
        "nextBoardNumber",
      ] as const)
        expect(state[key], `${name}.${key}`).toEqual(raw[key]);
    }
  });

  it("continues a half-joined bench to a delivery and the next day, then saves as version 2", () => {
    const state = loadV1("midJoin");
    const run = runOf(state);
    expect(run.stage).toBe("join");
    expect(run.purpose).toEqual({ kind: "commission" });
    expect(Object.values(run.joints).every((record) => !record.byApprentice)).toBe(true);
    const reviewed = playSteps(state, BENCH, "review");
    const delivered = reduce(reviewed, { type: "deliver" });
    expect(delivered.delivered).toBe(1);
    const next = finishedDay(delivered);
    expect(next.calendar.day).toBeGreaterThan(state.calendar.day);
    const saved = JSON.parse(serialize(next)) as { schemaVersion: number };
    expect(saved.schemaVersion).toBe(2);
  });

  it("gives placed extras a piece and keeps the chosen cushion while finishing", () => {
    const state = loadV1("midFinish");
    const run = runOf(state);
    expect(run.stage).toBe("finish");
    expect(run.extras.length).toBe(2);
    expect(run.extras.every((extra) => extra.piece === 0)).toBe(true);
    expect(run.cushion?.fabricId).toBe("blush-floral");
    const sewn = dispatchAll(state, [
      { type: "recordSeam", progress: 1, ticks: 600, insideTicks: 540, assisted: false },
    ]);
    const tomorrow = finishedDay(sewn);
    const reviewed = reduce(tomorrow, { type: "goToStage", stage: "review" });
    expect(runOf(reviewed).stage).toBe("review");
    expect(reduce(reviewed, { type: "deliver" }).delivered).toBe(1);
  });

  it("offers the showroom to an eligible version 1 player after their next End Day", () => {
    const state = loadV1("threshold");
    expect(state.story.queue).not.toContain("ww-showroom-offer");
    const next = reduce(state, { type: "endDay" });
    expect(next.story.queue).toContain("ww-showroom-offer");
    let opened = next;
    while (opened.story.queue[0] !== "ww-showroom-offer")
      opened = reduce(opened, { type: "markBeatSeen", beatId: opened.story.queue[0] ?? "" });
    const showroom = reduce(opened, {
      type: "chooseStoryOption",
      beatId: "ww-showroom-offer",
      choiceId: "open",
    });
    expect(showroom.career).toBe("showroom");
    expect(showroom.showroom?.seasonStartDay).toBe(22);
    expect(parseSave(serialize(showroom)).ok).toBe(true);
  });

  it("keeps the spare pieces, upgrades and decor on a full rack", () => {
    const state = loadV1("fullRack");
    expect(state.boards.every((board) => board.spare)).toBe(true);
    expect(state.upgrades).toHaveLength(4);
    expect(state.decor).toHaveLength(3);
    expect(state.calendar.hoursLeft).toBe(11);
  });

  it("never changes the raw save it migrates", () => {
    for (const name of FIXTURES) {
      const raw = deepFreeze(JSON.parse(v1Json(name)) as Record<string, unknown>);
      const before = JSON.stringify(raw);
      addShowroomFields(raw);
      expect(JSON.stringify(raw)).toBe(before);
    }
  });

  it("reports future and damaged saves instead of resetting them", () => {
    const raw = JSON.parse(v1Json("fresh")) as Record<string, unknown>;
    expect(parseSave(JSON.stringify({ ...raw, schemaVersion: 3 })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, coins: "lots" })).ok).toBe(false);
    expect(parseSave(JSON.stringify({ ...raw, activeRun: { id: "run-1" } })).ok).toBe(false);
  });

  it("reads the same studio reputation from a version 1 save as before", () => {
    const raw = JSON.parse(v1Json("threshold")) as unknown;
    expect(workshopModule.reputationOf(raw)).toBe(45);
  });
});
