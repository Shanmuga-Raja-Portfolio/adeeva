import { describe, expect, it } from "vitest";
import { hoursShortfallReason, spendCalendarHours, spendHours } from "./dayHours";

describe("day hours", () => {
  const clock = { day: 2, hoursLeft: 3 };

  it("spends hours and keeps the same clock for zero hours", () => {
    expect(spendCalendarHours(clock, 2)).toEqual({ day: 2, hoursLeft: 1 });
    expect(spendCalendarHours(clock, 0)).toBe(clock);
    expect(spendCalendarHours(clock, 4)).toBeNull();
  });

  it("explains a shortfall in plain words", () => {
    expect(hoursShortfallReason(clock, 3)).toBeNull();
    expect(hoursShortfallReason({ day: 1, hoursLeft: 1 }, 2)).toBe(
      "This needs 2 hours and only 1 is left today. End the day to continue.",
    );
  });
});

describe("spendHours", () => {
  const state = { coins: 5, calendar: { day: 2, hoursLeft: 3 } };

  it("spends hours on the calendar of a state", () => {
    expect(spendHours(state, 2)).toEqual({ coins: 5, calendar: { day: 2, hoursLeft: 1 } });
    expect(spendHours(state, 0)).toBe(state);
    expect(spendHours(state, 4)).toBeNull();
  });
});
