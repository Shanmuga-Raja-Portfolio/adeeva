import { describe, expect, it } from "vitest";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { parseSave, serialize } from "./save";
import { legacySeamCounts } from "./saveMigrations";
import {
  assembleToSew,
  craftToReview,
  layoutAndCut,
  newTestGame,
  sketchAndShop,
  withActiveGig,
} from "./testPlaythrough";

function midGame(): GameState {
  const base = withActiveGig(newTestGame({ career: "label" }), "valentina");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  const delivered = reduce(craftToReview(reduce(base, { type: "startRun", gigId: gig.id })), {
    type: "deliver",
  });
  return reduce(delivered, { type: "startLook", lookIndex: 1 });
}

describe("save", () => {
  it("round-trips a fresh game and a busy mid-game state", () => {
    for (const state of [newTestGame(), midGame()]) {
      const parsed = parseSave(serialize(state));
      expect(parsed).toEqual({ ok: true, state });
    }
  });

  it("continues identically after reload", () => {
    const state = midGame();
    const parsed = parseSave(serialize(state));
    if (!parsed.ok) throw new Error(parsed.error);
    expect(reduce(parsed.state, { type: "endDay" })).toEqual(reduce(state, { type: "endDay" }));
  });

  it("reports damaged json", () => {
    const parsed = parseSave("{not json");
    expect(parsed.ok).toBe(false);
  });

  it("reports structural damage with a path", () => {
    const raw = JSON.parse(serialize(midGame())) as Record<string, unknown>;
    const tampered = parseSave(JSON.stringify({ ...raw, coins: "lots" }));
    expect(tampered).toEqual({
      ok: false,
      error: "The save file is damaged (save.coins: expected a whole number).",
    });
    const badFabric = parseSave(
      JSON.stringify({ ...raw, inventory: { fabricMetres: { "mystery-silk": 1 }, trims: {} } }),
    );
    expect(badFabric.ok).toBe(false);
    expect(parseSave("[]").ok).toBe(false);
    expect(parseSave("null").ok).toBe(false);
  });

  it("rejects unknown or missing versions", () => {
    const raw = JSON.parse(serialize(newTestGame())) as Record<string, unknown>;
    const future = parseSave(JSON.stringify({ ...raw, schemaVersion: 99 }));
    expect(future).toEqual({
      ok: false,
      error: "This save uses version 99, which this game does not recognise.",
    });
    const missing = parseSave(JSON.stringify({ ...raw, schemaVersion: undefined }));
    expect(missing.ok).toBe(false);
  });
});

describe("save validation regressions", () => {
  type RawSave = Record<string, Record<string, unknown> & { design: { parts: Record<string, unknown> } }>;

  function rejectsWhen(change: (raw: RawSave) => void): boolean {
    const raw = JSON.parse(serialize(midGame())) as RawSave;
    change(raw);
    return !parseSave(JSON.stringify(raw)).ok;
  }

  function onRun(change: (run: RawSave[string]) => void): (raw: RawSave) => void {
    return (raw) => {
      const run = raw.activeRun;
      if (run === undefined) throw new Error("expected a run in the save");
      change(run);
    };
  }

  it("accepts the untouched save", () => {
    expect(rejectsWhen(() => undefined)).toBe(false);
  });

  it("rejects a part saved under the wrong category", () => {
    expect(rejectsWhen(onRun((run) => (run.design.parts.bodice = "a-line-skirt")))).toBe(true);
  });

  it("rejects duplicate upgrades and fractional coins", () => {
    expect(
      rejectsWhen((raw) => {
        const studio = raw.studio;
        if (studio !== undefined) studio.upgrades = ["big-table", "big-table"];
      }),
    ).toBe(true);
    expect(rejectsWhen((raw) => Object.assign(raw, { coins: 10.5 }))).toBe(true);
  });

  it("rejects a look on the table without a season", () => {
    expect(rejectsWhen((raw) => Object.assign(raw, { season: null }))).toBe(true);
  });

  it("rejects decorations off the doll or with impossible scale or layer", () => {
    const decoration = { id: "decoration-1", trimId: "pearl", x: 10, y: 10, rotation: 0, scale: 1, layer: 1 };
    const withDecoration = (patch: Record<string, number>) =>
      rejectsWhen(onRun((run) => (run.decorations = [{ ...decoration, ...patch }])));
    expect(withDecoration({ x: 500 })).toBe(true);
    expect(withDecoration({ y: 900 })).toBe(true);
    expect(withDecoration({ scale: 4 })).toBe(true);
    expect(withDecoration({ layer: -1 })).toBe(true);
    expect(withDecoration({})).toBe(false);
  });

  it("rejects more hours than a day holds and a stale run counter", () => {
    expect(
      rejectsWhen((raw) => {
        const calendar = raw.calendar;
        if (calendar !== undefined) calendar.hoursLeft = 11;
      }),
    ).toBe(true);
    expect(rejectsWhen((raw) => Object.assign(raw, { nextRunNumber: 1 }))).toBe(true);
  });

  it("rejects placement, cut and seam keys that are not in the design", () => {
    const placement = { fabricId: "ivory-cotton", x: 0, y: 0, rotation: 0 };
    const inherited = JSON.parse(
      '{"constructor": {"fabricId": "ivory-cotton", "x": 0, "y": 0, "rotation": 0}}',
    ) as unknown;
    expect(rejectsWhen(onRun((run) => (run.placements = inherited)))).toBe(true);
    expect(rejectsWhen(onRun((run) => (run.placements = { "fitted-front": placement })))).toBe(true);
    expect(rejectsWhen(onRun((run) => (run.cutAccuracy = { "fitted-front": 0.5 })))).toBe(true);
    expect(
      rejectsWhen(
        onRun((run) => (run.seams = { hem: { progress: 1, ticks: 9, insideTicks: 9, assisted: false } })),
      ),
    ).toBe(true);
  });
});

describe("save migrations", () => {
  it("upgrades a version 1 save by adding the assistant's paid-through day", () => {
    const current = midGame();
    const { assistantPaidThroughDay, ...legacyStudio } = current.studio;
    expect(assistantPaidThroughDay).toBe(0);
    const legacy = { ...current, schemaVersion: 1, studio: legacyStudio };
    expect(parseSave(JSON.stringify(legacy))).toEqual({ ok: true, state: current });
  });

  it("upgrades version 2 seams to exact tick counts", () => {
    const current = halfSewn();
    const legacy = { ...current, schemaVersion: 2, activeRun: legacyRun(current) };
    const parsed = parseSave(JSON.stringify(legacy));
    expect(parsed).toEqual({ ok: true, state: migratedSeams(current) });
  });

  it("upgrades a version 1 save all the way to version 3", () => {
    const current = halfSewn();
    const { assistantPaidThroughDay, ...legacyStudio } = current.studio;
    expect(assistantPaidThroughDay).toBe(0);
    const legacy = { ...current, schemaVersion: 1, studio: legacyStudio, activeRun: legacyRun(current) };
    expect(parseSave(JSON.stringify(legacy))).toEqual({ ok: true, state: migratedSeams(current) });
  });

  it("converts legacy progress and accuracy deterministically", () => {
    expect(legacySeamCounts(1, 0.9)).toEqual({ progress: 1, ticks: 247, insideTicks: 222, assisted: false });
    expect(legacySeamCounts(0.5, 0.5)).toEqual({
      progress: 0.5,
      ticks: 124,
      insideTicks: 62,
      assisted: false,
    });
    expect(legacySeamCounts(0.001, 1)).toEqual({
      progress: 0.001,
      ticks: 1,
      insideTicks: 1,
      assisted: false,
    });
    expect(legacySeamCounts(0, 0)).toEqual({ progress: 0, ticks: 0, insideTicks: 0, assisted: false });
  });
});

const LEGACY_SEAMS: Readonly<Record<string, { progress: number; accuracy: number }>> = {
  "side-seams": { progress: 1, accuracy: 0.9 },
  "shoulder-seams": { progress: 0.5, accuracy: 0.5 },
};

function halfSewn(): GameState {
  const base = withActiveGig(newTestGame(), "mom");
  const gig = base.gigs.active[0];
  if (gig === undefined) throw new Error("expected a gig");
  return assembleToSew(layoutAndCut(sketchAndShop(reduce(base, { type: "startRun", gigId: gig.id }))));
}

function legacyRun(state: GameState): unknown {
  return { ...state.activeRun, seams: LEGACY_SEAMS };
}

function migratedSeams(state: GameState): GameState {
  const run = state.activeRun;
  if (run === null) throw new Error("expected a run");
  const seams = Object.fromEntries(
    Object.entries(LEGACY_SEAMS).map(([id, seam]) => [id, legacySeamCounts(seam.progress, seam.accuracy)]),
  );
  return { ...state, activeRun: { ...run, seams } };
}

describe("save seam validation", () => {
  function withSeam(seam: Record<string, unknown>): boolean {
    const raw = JSON.parse(serialize(halfSewn())) as { activeRun: Record<string, unknown> };
    raw.activeRun.seams = { "side-seams": seam };
    return parseSave(JSON.stringify(raw)).ok;
  }

  it("accepts exact counts and rejects impossible ones", () => {
    expect(withSeam({ progress: 0.5, ticks: 100, insideTicks: 40, assisted: true })).toBe(true);
    expect(withSeam({ progress: 0.5, ticks: 100, insideTicks: 101, assisted: false })).toBe(false);
    expect(withSeam({ progress: 0.5, ticks: 10.5, insideTicks: 4, assisted: false })).toBe(false);
    expect(withSeam({ progress: 0.5, ticks: 0, insideTicks: 0, assisted: false })).toBe(false);
    expect(withSeam({ progress: 0, ticks: 3, insideTicks: 0, assisted: false })).toBe(false);
    expect(withSeam({ progress: 0.5, ticks: 100, insideTicks: 40 })).toBe(false);
    expect(withSeam({ progress: 0.5, accuracy: 0.4 })).toBe(false);
  });
});
