import { describe, expect, it } from "vitest";
import type { Action } from "./action";
import type { GameState } from "./gameState";
import { matchedFaces, matchedPairs } from "./matchedFaces";
import { matchingHardware, SIMPLE_AND_CALM } from "./matchingHardware";
import { runPieces } from "./pieceParts";
import { reduce } from "./reduce";
import { setEvenness } from "./setEvenness";
import { playSetUntil, READING_PLAN, showroomTestGame } from "./setPlaythrough";
import { fineWoodFactor, setPrice } from "./setPrice";
import { SHOW_ME_GRAIN_CAP } from "./woodGrain";
import { dispatchAll, runOf } from "./testPlaythrough";

function atLayout(templateId: "reading-corner" | "cottage-bedroom" = "reading-corner"): GameState {
  return playSetUntil(showroomTestGame(), { ...READING_PLAN, templateId }, "layout");
}

function panelOf(state: GameState) {
  const panel = state.boards.find((board) => board.size === "panel" && board.woodId === "pine");
  if (panel === undefined) throw new Error("No panel");
  return panel;
}

function place(partId: string, boardId: string, x: number, y: number, rotation = 0): Action {
  return { type: "placePart", partId, boardId, x, y, rotation };
}

describe("matched faces", () => {
  it("counts show faces of different pieces placed by hand on one board", () => {
    const state = atLayout();
    const panel = panelOf(state);
    const shared = dispatchAll(state, [
      place("0:side-1", panel.id, 0, 0),
      place("1:top", panel.id, 55, 0, 90),
    ]);
    expect(matchedPairs(runOf(shared))).toBe(1);
    expect(matchedFaces(runOf(shared))).toBe(1);
    expect(matchedFaces(runOf(state))).toBe(0);
  });

  it("never matches faces placed by Show me or Plan the rest", () => {
    const planned = reduce(atLayout(), { type: "planTheRest" });
    expect(matchedPairs(runOf(planned))).toBe(0);
  });

  it("is left out when the set can't share a board", () => {
    expect(matchedFaces(runOf(atLayout("cottage-bedroom")))).toBeNull();
  });
});

describe("plan the rest", () => {
  it("places every part legally, each worth at most 0.9 for wood lines", () => {
    const planned = reduce(atLayout(), { type: "planTheRest" });
    const run = runOf(planned);
    expect(Object.keys(run.placements)).toHaveLength(10);
    expect(Object.values(run.placements).every((placement) => placement.assisted)).toBe(true);
    expect(SHOW_ME_GRAIN_CAP).toBe(0.9);
    expect(reduce(planned, { type: "planTheRest" })).toBe(planned);
  });
});

describe("evenness and hardware", () => {
  it("drops two points per point of spread", () => {
    expect(setEvenness([90, 90])).toBe(100);
    expect(setEvenness([80, 92])).toBe(76);
    expect(setEvenness([10, 90])).toBe(0);
    expect(setEvenness([])).toBe(0);
  });

  it("rewards the same extras on every piece, but not each product's own needs", () => {
    const atFinish = playSetUntil(showroomTestGame(), READING_PLAN, "finish");
    const run = runOf(atFinish);
    expect(runPieces(run)).toHaveLength(2);
    expect(matchingHardware(run)).toBe(SIMPLE_AND_CALM);
    const one = dispatchAll(atFinish, [{ type: "addExtra", extraId: "wood-knob", x: 100, y: 100, piece: 0 }]);
    expect(matchingHardware(runOf(one))).toBe(0);
    const both = reduce(one, { type: "addExtra", extraId: "wood-knob", x: 100, y: 100, piece: 1 });
    expect(matchingHardware(runOf(both))).toBe(100);
    const odd = reduce(both, { type: "addExtra", extraId: "star-stencil", x: 120, y: 120, piece: 0 });
    expect(matchingHardware(runOf(odd))).toBe(50);
  });
});

describe("set price", () => {
  const base = {
    products: ["bookshelf", "footstool"] as const,
    quality: 100,
    woodId: "pine" as const,
    harmony: 79,
    rosette: false,
  };

  it("follows show price, quality, fine wood, harmony and rosette", () => {
    expect(setPrice(base)).toBe(Math.round(90 * 1.2));
    expect(setPrice({ ...base, quality: 0 })).toBe(Math.round(90 * 0.6));
    expect(setPrice({ ...base, harmony: 80 })).toBe(Math.round(90 * 1.2 * 1.1));
    expect(setPrice({ ...base, rosette: true })).toBe(Math.round(90 * 1.2 * 1.1));
    expect(fineWoodFactor("hickory")).toBeCloseTo(1.3, 6);
    expect(fineWoodFactor("birch")).toBeCloseTo(1.15, 6);
    expect(setPrice({ ...base, woodId: "hickory" })).toBe(Math.round(90 * 1.2 * 1.3));
  });
});
