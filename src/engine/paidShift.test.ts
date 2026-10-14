import { describe, expect, it } from "vitest";
import { actionCheck } from "./actionCheck";
import { freshDayCheck, workPaidShift } from "./paidShift";

describe("workPaidShift", () => {
  const state = { coins: 10, day: 1 };
  const endDay = (current: typeof state) => ({ ...current, day: current.day + 1 });

  it("pays the shift and ends the day", () => {
    expect(workPaidShift(state, actionCheck([]), 25, endDay)).toEqual({ coins: 35, day: 2 });
  });

  it("returns the same state when the shift is not allowed", () => {
    expect(workPaidShift(state, actionCheck(["No."]), 25, endDay)).toBe(state);
  });
});

describe("freshDayCheck", () => {
  it("allows a shift only with the whole day still ahead", () => {
    expect(freshDayCheck(8, 8)).toEqual({ ok: true, reasons: [] });
    expect(freshDayCheck(9, 8).ok).toBe(true);
    expect(freshDayCheck(7, 8)).toEqual({
      ok: false,
      reasons: ["A shift takes the whole day. Start it first thing in the morning."],
    });
  });
});
