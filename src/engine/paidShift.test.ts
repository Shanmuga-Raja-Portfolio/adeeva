import { describe, expect, it } from "vitest";
import { actionCheck } from "./actionCheck";
import { workPaidShift } from "./paidShift";

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
