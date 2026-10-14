import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import {
  GOOD_PLAN,
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function midJoin(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "gran-mina");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  const atJoin = playRunTo(started, GOOD_PLAN, "join");
  return reduce(atJoin, {
    type: "recordJoin",
    jointId: "seat",
    ticks: 90,
    insideTicks: 60,
    overTicks: 12,
    assisted: false,
  });
}

function atReview(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "gran-mina");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, GOOD_PLAN, "review");
}

interface RawRun {
  joins: Record<string, unknown>;
  consumed: unknown;
  polish: Record<string, { passes: number[] }>;
  brief: { fee: number };
  purpose: { gigId: string };
}

function tamperedRun(state: GameState, change: (run: RawRun) => void): string {
  return tampered(state, (raw) => {
    change(raw.activeRun as RawRun);
  });
}

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

describe("saves", () => {
  it("round-trip a fresh game, a piece mid-join and a delivered order", () => {
    const fresh = settleStories(newTestGame());
    expect(roundTrip(fresh)).toEqual(fresh);
    const joining = midJoin();
    expect(joining.activeRun?.joins.seat?.ticks).toBe(90);
    expect(roundTrip(joining)).toEqual(joining);
    const ordered = withOrder(fresh, "kiko");
    const delivered = playOrder(ordered, lastGigId(ordered), {
      ...GOOD_PLAN,
      metalId: "copper",
      stoneId: null,
      charms: ["star-charm"],
    });
    expect(roundTrip(delivered)).toEqual(delivered);
  });

  it("refuse damaged, foreign and impossible saves with a friendly reason", () => {
    const state = midJoin();
    const cases = [
      "{ not json",
      "[]",
      JSON.stringify({ schemaVersion: 2 }),
      JSON.stringify({ schemaVersion: "1" }),
      tampered(state, (raw) => {
        raw.coins = "lots";
      }),
      tampered(state, (raw) => {
        (raw.stock as { clips: number }).clips = -1;
      }),
      tampered(state, (raw) => {
        (raw.calendar as { hoursLeft: number }).hoursLeft = 11;
      }),
      tampered(state, (raw) => {
        (raw.activeRun as { consumed: unknown }).consumed = null;
      }),
      tampered(state, (raw) => {
        (raw.activeRun as { stage: string }).stage = "polish";
      }),
      tampered(state, (raw) => {
        raw.nextRunNumber = 1;
      }),
      tampered(state, (raw) => {
        raw.marketTheme = "moon-party";
      }),
    ];
    for (const json of cases) {
      const parsed = parseSave(json);
      expect(parsed.ok, json.slice(0, 60)).toBe(false);
      if (!parsed.ok) expect(parsed.error.length).toBeGreaterThan(10);
    }
  });

  it("refuse a finished piece whose recorded work or order does not add up", () => {
    const review = atReview();
    expect(roundTrip(review)).toEqual(review);
    const cases = [
      tamperedRun(review, (run) => {
        run.joins = {};
      }),
      tamperedRun(review, (run) => {
        run.consumed = [];
      }),
      tamperedRun(review, (run) => {
        for (const record of Object.values(run.polish)) record.passes = record.passes.map(() => 1);
      }),
      tamperedRun(review, (run) => {
        run.brief.fee = 99999;
      }),
      tamperedRun(review, (run) => {
        run.purpose.gigId = "gig-404";
      }),
      tampered(review, (raw) => {
        (raw.gigs as { active: unknown[] }).active = [];
      }),
    ];
    for (const json of cases) expect(parseSave(json).ok).toBe(false);
  });
});
