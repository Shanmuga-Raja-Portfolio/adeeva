import { describe, expect, it } from "vitest";
import type { ChopItemDef } from "../content/dish";
import {
  chopMarkCount,
  chopTempo,
  chopWindow,
  isValidChopRecord,
  markScore,
  minceScore,
  minceStretchMs,
  quickChopItems,
  scoreChop,
} from "./chop";

const SLICE: ChopItemDef = { ingredient: "onion", cut: "slice", marks: 6, tempo: 72 };
const DICE: ChopItemDef = { ingredient: "onion", cut: "dice", marks: 4, tempo: 72 };
const MINCE: ChopItemDef = { ingredient: "garlic", cut: "mince", marks: 2, tempo: 100 };

describe("Chop scoring", () => {
  it("counts marks for slice, dice and mince", () => {
    expect(chopMarkCount(SLICE)).toBe(6);
    expect(chopMarkCount(DICE)).toBe(8);
    expect(chopMarkCount(MINCE)).toBe(2);
  });

  it("scores a mark 1 inside the window, half inside twice the window, otherwise 0", () => {
    const window = chopWindow(1);
    expect(window).toBe(110);
    expect(markScore(0, window)).toBe(1);
    expect(markScore(-110, window)).toBe(1);
    expect(markScore(150, window)).toBe(0.5);
    expect(markScore(221, window)).toBe(0);
    expect(markScore(null, window)).toBe(0);
    expect(chopWindow(1.3)).toBeCloseTo(143);
  });

  it("averages the marks, and caps an assisted chop at 0.8", () => {
    const record = { offsets: [0, 0, 150, null, 0, 0], assisted: false };
    expect(scoreChop(SLICE, record, 1, "standard").accuracy).toBeCloseTo(4.5 / 6);
    expect(scoreChop(SLICE, { offsets: [0, 0, 0, 0, 0, 0], assisted: true }, 1, "standard").accuracy).toBe(
      0.8,
    );
  });

  it("marks a chop perfect only when every mark lands in the window without help", () => {
    expect(
      scoreChop(SLICE, { offsets: [0, 10, -20, 30, 0, 0], assisted: false }, 1, "standard").perfect,
    ).toBe(true);
    expect(
      scoreChop(SLICE, { offsets: [0, 10, -20, 130, 0, 0], assisted: false }, 1, "standard").perfect,
    ).toBe(false);
    expect(scoreChop(SLICE, { offsets: [0, 0, 0, 0, 0, 0], assisted: true }, 1, "standard").perfect).toBe(
      false,
    );
  });

  it("scores a mince hold by its overlap with the green stretch", () => {
    const stretch = minceStretchMs(MINCE, "standard");
    expect(stretch).toBe(2400);
    expect(minceScore([0, 0], stretch, 110)).toBe(1);
    expect(minceScore([600, 0], stretch, 110)).toBeLessThan(0.8);
    expect(minceScore([null, 0], stretch, 110)).toBe(0);
  });

  it("speeds up the beat on Challenging", () => {
    expect(chopTempo(SLICE, "challenging")).toBeCloseTo(79.2);
    expect(chopTempo(SLICE, "relaxed")).toBe(72);
  });

  it("refuses records of the wrong length or with wild offsets", () => {
    expect(isValidChopRecord(SLICE, { offsets: [0, 0, 0], assisted: false })).toBe(false);
    expect(isValidChopRecord(SLICE, { offsets: [0, 0, 0, 0, 0, 1001], assisted: false })).toBe(false);
    expect(isValidChopRecord(SLICE, { offsets: [0, 0, 0, 0, 0, 0.5], assisted: false })).toBe(false);
    expect(isValidChopRecord(SLICE, { offsets: [0, null, 0, 0, 0, -1000], assisted: false })).toBe(true);
  });

  it("uses four marks on the two main ingredients in service", () => {
    const quick = quickChopItems([SLICE, DICE, MINCE]);
    expect(quick).toHaveLength(2);
    expect(quick.map(chopMarkCount)).toEqual([4, 4]);
  });
});
