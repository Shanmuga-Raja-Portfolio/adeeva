import { describe, expect, it } from "vitest";
import type { CollectionBrief } from "./collectionState";
import { gemBudget, gemPrice, generateGemTray, lineSeats, lineStoneNeeds, TRAY_SIZE } from "./gemTray";
import type { GameState } from "./gameState";
import {
  buyLineGems,
  cheapestPicks,
  collectionTestGame,
  confirmBoard,
  LINE_PLAN,
  pickFirstTheme,
  playWholeLine,
  shootLookbook,
  stagedLaunch,
  toLanternNight,
} from "./linePlaythrough";
import { reduce } from "./reduce";
import { playRunTo } from "./testPlaythrough";
import { POT_SHORT, canBuyGems, potCovers } from "./stonePot";

const LINE: CollectionBrief = {
  products: ["stone-pendant", "clip-pair", "charm-bracelet"],
  motif: "heart",
  metalId: "silver",
  hero: "garnet",
  accent: "sky-glass",
  finish: "high-shine",
  glaze: null,
};

function boarded(): GameState {
  return confirmBoard(pickFirstTheme(collectionTestGame()), LINE);
}

describe("Kemi's Gem Market", () => {
  it("lays out 16 stones of the line's hero and accent types only, solvable within budget on every seed", () => {
    expect(lineSeats(LINE)).toBe(3);
    expect([...lineStoneNeeds(LINE).entries()]).toEqual([
      ["garnet", 1],
      ["sky-glass", 2],
    ]);
    for (const seed of [1, 2, 3, 4, 5, 99, 1234]) {
      const [tray] = generateGemTray(LINE, [], seed);
      expect(tray).toHaveLength(TRAY_SIZE);
      expect(new Set(tray.map((stone) => stone.stoneId))).toEqual(new Set(["garnet", "sky-glass"]));
      for (const [stoneId, need] of lineStoneNeeds(LINE)) {
        const plain = tray.filter((stone) => stone.stoneId === stoneId && stone.shimmer === 1);
        const byTint = new Map<string, number>();
        for (const stone of plain) byTint.set(stone.tint, (byTint.get(stone.tint) ?? 0) + 1);
        expect(Math.max(...byTint.values())).toBeGreaterThanOrEqual(need);
      }
    }
  });

  it("prices stones by shimmer and takes 1 off 2-shimmer stones with the Sorting Tray", () => {
    expect(gemPrice("garnet", 1, [])).toBe(6);
    expect(gemPrice("garnet", 2, [])).toBe(8);
    expect(gemPrice("garnet", 3, [])).toBe(11);
    expect(gemPrice("garnet", 2, ["sorting-tray"])).toBe(7);
    expect(gemPrice("garnet", 3, ["sorting-tray"])).toBe(11);
  });

  it("budgets seats × the spot's stone budget", () => {
    expect(gemBudget(LINE, 1)).toBe(24);
    expect(gemBudget(LINE, 2)).toBe(27);
    expect(gemBudget(LINE, 4)).toBe(33);
  });

  it("refuses to leave until the pot covers every seat, and blocks going over the budget", () => {
    const state = boarded();
    const collection = state.collection;
    if (collection === null) throw new Error("no loft");
    expect(canBuyGems(state, []).reasons).toContain(POT_SHORT);
    const picks = cheapestPicks(state);
    expect(potCovers(collection, picks)).toBe(true);
    expect(canBuyGems(state, picks.slice(1)).reasons).toContain(POT_SHORT);
    const dear = collection.gemTray
      .map((stone, index) => ({ stone, index }))
      .sort((a, b) => b.stone.price - a.stone.price)
      .slice(0, 6)
      .map((entry) => entry.index);
    const all = [...new Set([...picks, ...dear])];
    expect(canBuyGems(state, all).reasons.some((reason) => reason.includes("stone budget"))).toBe(true);
    const bought = reduce(state, { type: "buyGems", picks });
    expect(bought.collection?.stonePot).toHaveLength(picks.length);
    expect(bought.calendar.hoursLeft).toBe(state.calendar.hoursLeft - 1);
    expect(reduce(bought, { type: "buyGems", picks })).toBe(bought);
  });

  it("takes stones only from the pot at the Set step and returns unused ones as plain stock after the Launch", () => {
    const state = boarded();
    const collection = state.collection;
    if (collection === null) throw new Error("no loft");
    const spare = collection.gemTray.findIndex(
      (stone, index) => stone.stoneId === "garnet" && !cheapestPicks(state).includes(index),
    );
    const bought = reduce(state, { type: "buyGems", picks: [...cheapestPicks(state), spare] });
    const before = bought.stock.stones.garnet;
    const night = toLanternNight(shootLookbook(playWholeLine(bought)));
    expect(night.stock.stones.garnet).toBe(before);
    expect(night.collection?.stonePot.filter((stone) => !stone.used)).toHaveLength(1);
    const launched = stagedLaunch(night);
    expect(launched.stock.stones.garnet).toBe(before + 1);
    expect(launched.collection?.stonePot.every((stone) => stone.used)).toBe(true);
  });

  it("only lets a pot stone of the run's own type be picked", () => {
    const state = buyLineGems(boarded());
    const pot = state.collection?.stonePot ?? [];
    const started = reduce(state, { type: "startCollectionPiece", slot: 0 });
    expect(reduce(started, { type: "choosePotStones", indices: [0] })).toBe(started);
    const atSet = playRunTo(started, LINE_PLAN, "set");
    const sky = pot.findIndex((stone) => stone.stoneId === "sky-glass");
    const garnet = pot.findIndex((stone) => stone.stoneId === "garnet");
    expect(reduce(atSet, { type: "choosePotStones", indices: [sky] })).toBe(atSet);
    expect(reduce(atSet, { type: "choosePotStones", indices: [garnet, garnet] })).toBe(atSet);
    expect(reduce(atSet, { type: "choosePotStones", indices: [garnet] }).activeRun?.potStones).toEqual([
      garnet,
    ]);
  });
});
