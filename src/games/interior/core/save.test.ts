import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import {
  lastGigId,
  newTestGame,
  playOrder,
  playRunTo,
  recipeFor,
  rowStroke,
  settleStories,
  withOrder,
} from "./testPlaythrough";

function midPaint(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "nana-pearl");
  const started = reduce(ordered, { type: "startOrder", gigId: lastGigId(ordered) });
  const atPaint = playRunTo(started, recipeFor("nana-pearl"), "paint");
  return reduce(atPaint, { type: "rollStroke", wall: "back", points: rowStroke(0), durationMs: 120 });
}

function atStyle(): GameState {
  const ordered = withOrder(settleStories(newTestGame()), "orla");
  const started = reduce({ ...ordered, coins: 300 }, { type: "startOrder", gigId: lastGigId(ordered) });
  return playRunTo(started, recipeFor("orla"), "reveal");
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

function tamperedRun(state: GameState, change: (run: Record<string, unknown>) => void): string {
  return tampered(state, (raw) => change(raw.activeRun as Record<string, unknown>));
}

describe("saves", () => {
  it("round-trip a fresh game, a wall mid-roll, a styled room and a revealed makeover", () => {
    const fresh = settleStories(newTestGame());
    expect(roundTrip(fresh)).toEqual(fresh);
    const rolling = midPaint();
    expect(rolling.activeRun?.rolls.back?.splats).toHaveLength(1);
    expect(roundTrip(rolling)).toEqual(rolling);
    const styled = atStyle();
    expect(styled.activeRun?.decor).toHaveLength(3);
    expect(roundTrip(styled)).toEqual(styled);
    const ordered = withOrder(fresh, "nana-pearl");
    const revealed = playOrder(ordered, lastGigId(ordered), recipeFor("nana-pearl"));
    expect(roundTrip(revealed)).toEqual(revealed);
  });

  it("refuse damaged, foreign and impossible saves with a friendly reason", () => {
    const state = midPaint();
    const cases = [
      "{ not json",
      "[]",
      JSON.stringify({ schemaVersion: 2 }),
      JSON.stringify({ schemaVersion: "1" }),
      tampered(state, (raw) => {
        raw.coins = "lots";
      }),
      tampered(state, (raw) => {
        (raw.calendar as { hoursLeft: number }).hoursLeft = 12;
      }),
      tampered(state, (raw) => {
        (raw.stock as { decor: Record<string, number> }).decor["round-rug"] = -1;
      }),
      tampered(state, (raw) => {
        raw.nextRunNumber = 1;
      }),
      tamperedRun(state, (run) => {
        run.locked = false;
      }),
      tamperedRun(state, (run) => {
        run.stage = "light";
      }),
      tamperedRun(state, (run) => {
        run.roller = 99;
      }),
      tamperedRun(state, (run) => {
        (run.plan as { pieces: { col: number }[] }).pieces.forEach((piece) => {
          piece.col = 0;
        });
      }),
      tamperedRun(state, (run) => {
        (run.brief as { fee: number }).fee = 9999;
      }),
    ];
    for (const json of cases) {
      const parsed = parseSave(json);
      expect(parsed.ok, json.slice(0, 80)).toBe(false);
      if (!parsed.ok) expect(parsed.error.length).toBeGreaterThan(10);
    }
  });

  it("refuse a styled room whose finished steps do not add up", () => {
    const styled = atStyle();
    const cases = [
      tamperedRun(styled, (run) => {
        run.floorLaid = {};
      }),
      tamperedRun(styled, (run) => {
        run.edges = {};
      }),
      tamperedRun(styled, (run) => {
        run.lightPlaces = {};
      }),
      tamperedRun(styled, (run) => {
        (run.decor as { rotation: number }[]).forEach((item) => {
          item.rotation = 7;
        });
      }),
    ];
    for (const json of cases) expect(parseSave(json).ok).toBe(false);
  });

  it("refuse counters, steps and records that a real game could never write", () => {
    const styled = atStyle();
    const fresh = settleStories(newTestGame());
    const ordered = withOrder(fresh, "nana-pearl");
    const revealed = playOrder(ordered, lastGigId(ordered), recipeFor("nana-pearl"));
    const cases = [
      tamperedRun(styled, (run) => {
        (run.plan as { nextPieceNumber: number }).nextPieceNumber = 1;
      }),
      tamperedRun(styled, (run) => {
        run.nextDecorNumber = 1;
      }),
      tamperedRun(styled, (run) => {
        run.reached = "done";
      }),
      tamperedRun(styled, (run) => {
        run.startedDay = 99;
      }),
      tamperedRun(styled, (run) => {
        Object.values(run.floorLaid as Record<string, { offset: number; accuracy: number }>).forEach(
          (record) => {
            record.offset = 99;
            record.accuracy = 1;
          },
        );
      }),
      tamperedRun(styled, (run) => {
        Object.values(run.floorLaid as Record<string, { offset: number; accuracy: number }>).forEach(
          (record) => {
            record.offset = 3;
            record.accuracy = 1;
          },
        );
      }),
      tamperedRun(styled, (run) => {
        run.stage = "done";
        run.reached = "done";
      }),
      tampered(revealed, (raw) => {
        raw.log = [];
      }),
    ];
    for (const json of cases) expect(parseSave(json).ok).toBe(false);
  });
});
