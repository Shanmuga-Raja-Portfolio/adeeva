import { describe, expect, it } from "vitest";
import type { CollectionBrief } from "./collectionState";
import type { GameState } from "./gameState";
import { sheetUse } from "./lineSheet";
import {
  collectionTestGame,
  confirmBoard,
  endDayOnce,
  LINE_PLAN,
  pickFirstTheme,
  playLinePiece,
  playWholeLine,
  shootLookbook,
  stagedLaunch,
  toLanternNight,
} from "./linePlaythrough";
import { reduce } from "./reduce";
import { placementIssue } from "./sheetPlan";
import { playRunTo } from "./testPlaythrough";

const SILVER_LINE: CollectionBrief = {
  products: ["shape-pendant", "drop-pair", "charm-bracelet"],
  motif: "star",
  metalId: "silver",
  hero: null,
  accent: null,
  finish: "high-shine",
  glaze: null,
};

function boarded(): GameState {
  return confirmBoard(pickFirstTheme(collectionTestGame()), SILVER_LINE);
}

describe("line sheets", () => {
  it("turn the starter wide sheet into the line sheet on the first cut, taking it from stock once", () => {
    const state = boarded();
    expect(state.stock.metal.silver.wide).toBe(1);
    const first = playLinePiece(state, 0);
    expect(first.stock.metal.silver.wide).toBe(0);
    expect(first.collection?.lineSheets).toHaveLength(1);
    expect(first.collection?.lineSheets[0]?.holes.length).toBeGreaterThan(0);
    const second = playLinePiece(endDayOnce(first), 1);
    expect(second.stock.metal.silver.wide).toBe(0);
    expect(second.collection?.lineSheets).toHaveLength(1);
    expect([...second.story.queue, ...second.story.seen]).toContain("jb-first-line-sheet");
    const holes = second.collection?.lineSheets[0]?.holes ?? [];
    expect(new Set(holes.map((hole) => hole.runId)).size).toBe(2);
  });

  it("plans the next piece around the holes left by earlier ones", () => {
    const first = playLinePiece(boarded(), 0);
    const hole = first.collection?.lineSheets[0]?.holes[0]?.points ?? [];
    const minX = Math.min(...hole.map(([x]) => x));
    const minY = Math.min(...hole.map(([, y]) => y));
    const started = reduce(endDayOnce(first), { type: "startCollectionPiece", slot: 1 });
    const onPlan = playRunTo(started, LINE_PLAN, "plan");
    const onHole = reduce(onPlan, {
      type: "placePart",
      partKey: "drop-l",
      size: "wide",
      x: minX + 4,
      y: minY + 2,
      rotation: 0,
    });
    expect(onHole).toBe(onPlan);
    const shown = reduce(onPlan, { type: "showMePlan" });
    const run = shown.activeRun;
    if (run === null) throw new Error("no run");
    expect(Object.keys(run.plan)).toHaveLength(2);
    expect(Object.values(run.plan).every((placement) => placement.size === "wide")).toBe(true);
    for (const [partKey, placement] of Object.entries(run.plan))
      expect(placementIssue(shown, run, partKey, placement)).toBeNull();
  });

  it("measures sheet use against the sheets consumed, the line sheet once, and clears line sheets after the Launch", () => {
    const night = toLanternNight(shootLookbook(playWholeLine(boarded())));
    const pieces = night.collection?.pieces ?? [];
    const wideArea = 80 * 40;
    const consumed = pieces.reduce((sum, piece) => sum + piece.sheetArea, 0);
    expect(consumed).toBeGreaterThanOrEqual(wideArea);
    expect(sheetUse(pieces)).toBeCloseTo(pieces.reduce((sum, piece) => sum + piece.partArea, 0) / consumed);
    expect(sheetUse([{ partArea: 400, sheetArea: 1600 }])).toBe(0.25);
    expect(sheetUse([])).toBe(0);
    expect(stagedLaunch(night).collection?.lineSheets).toEqual([]);
  });
});
