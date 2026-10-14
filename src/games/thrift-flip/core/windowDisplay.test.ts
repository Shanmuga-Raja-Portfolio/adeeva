import { describe, expect, it } from "vitest";
import type { WindowDisplay } from "./boutique";
import { boutiqueStart, endDays, rackPieceFixture, withRack } from "./boutiquePlaythrough";
import type { GameState } from "./gameState";
import { reduce } from "./reduce";
import { windowIssues } from "./windowDisplay";
import { scoreWindow } from "./windowScore";

function stocked(): GameState {
  const state = withRack(boutiqueStart(), [
    rackPieceFixture("piece-1", { tags: ["romantic"], colours: ["blush"], leaves: 80 }),
    rackPieceFixture("piece-2", { tags: ["playful"], colours: ["sage"], leaves: 60 }),
    rackPieceFixture("piece-3", { tags: ["casual"], colours: ["coral"], leaves: 70 }),
    rackPieceFixture("piece-4", { tags: ["classic"], colours: ["navy"], leaves: 50 }),
  ]);
  return { ...state, coins: 200 };
}

const DRESSED: WindowDisplay = {
  pieces: [
    { pieceId: "piece-1", x: 90, y: 240 },
    { pieceId: "piece-2", x: 300, y: 240 },
    { pieceId: "piece-3", x: 510, y: 240 },
  ],
  props: [{ propId: "paper-moon", x: 300, y: 80 }],
};

describe("the window display", () => {
  it("scores theme, colour, balance and leaves", () => {
    const state = reduce(stocked(), { type: "buyProp", propId: "paper-moon" });
    expect(scoreWindow(state, DRESSED)).toEqual({
      theme: 100,
      colour: 75,
      balance: 100,
      leaves: 70,
      total: Math.round(0.35 * 100 + 0.25 * 75 + 0.2 * 100 + 0.2 * 70),
      buzz: 4,
    });
    const leftOnly: WindowDisplay = { pieces: [{ pieceId: "piece-4", x: 50, y: 200 }], props: [] };
    expect(scoreWindow(state, leftOnly)).toMatchObject({ theme: 0, colour: 0, balance: 33, leaves: 50 });
    expect(scoreWindow(state, { pieces: [], props: [] }).total).toBe(0);
  });

  it("costs an hour, stays up and gives buzz on Till Day", () => {
    const bought = reduce(stocked(), { type: "buyProp", propId: "paper-moon" });
    expect(bought.coins).toBe(190);
    const dressed = reduce(bought, { type: "dressWindow", ...DRESSED });
    expect(dressed.calendar.hoursLeft).toBe(bought.calendar.hoursLeft - 1);
    expect(dressed.boutique?.window).toEqual(DRESSED);
    expect(dressed.story.queue).toContain("tf-first-window");
    const later = endDays(dressed, 6);
    expect(later.boutique?.window).toEqual(DRESSED);
    const prices = Object.fromEntries(later.rack.map((piece) => [piece.id, 1]));
    const held = reduce(later, { type: "holdStall", prices });
    expect(held.stall?.buzz).toBe(4);
    expect(held.boutique?.window.pieces).toEqual([]);
    expect(scoreWindow(held, held.boutique?.window ?? DRESSED).buzz).toBe(0);
  });

  it("gives no buzz for a window of props with no pieces", () => {
    const state = reduce(stocked(), { type: "buyProp", propId: "paper-moon" });
    const propsOnly: WindowDisplay = { pieces: [], props: [{ propId: "paper-moon", x: 300, y: 80 }] };
    const score = scoreWindow(state, propsOnly);
    expect(score.total).toBeGreaterThan(0);
    expect(score.buzz).toBe(0);
  });

  it("refuses a window it cannot hold", () => {
    const state = stocked();
    expect(windowIssues(state, DRESSED)).toContain("Buy a prop before it goes in the window.");
    const four: WindowDisplay = {
      pieces: ["piece-1", "piece-2", "piece-3", "piece-4"].map((pieceId, index) => ({
        pieceId,
        x: 100 * index,
        y: 200,
      })),
      props: [],
    };
    expect(windowIssues(state, four)).toContain("The window holds 3 pieces.");
    expect(windowIssues({ ...state, upgrades: ["window-plinths"] }, four)).toEqual([]);
    expect(reduce(state, { type: "dressWindow", ...four })).toBe(state);
    const outside: WindowDisplay = { pieces: [{ pieceId: "piece-1", x: 700, y: 10 }], props: [] };
    expect(reduce(state, { type: "dressWindow", ...outside })).toBe(state);
    const shelved = reduce(state, { type: "shelvePiece", pieceId: "piece-1" });
    expect(
      reduce(shelved, { type: "dressWindow", pieces: [{ pieceId: "piece-1", x: 100, y: 100 }], props: [] }),
    ).toBe(shelved);
    const dressed = reduce(state, {
      type: "dressWindow",
      pieces: [{ pieceId: "piece-2", x: 100, y: 100 }],
      props: [],
    });
    expect(
      reduce(dressed, { type: "dressWindow", pieces: [{ pieceId: "piece-2", x: 100, y: 100 }], props: [] }),
    ).toBe(dressed);
    expect(reduce({ ...state, coins: 3 }, { type: "buyProp", propId: "paper-moon" }).coins).toBe(3);
  });
});
