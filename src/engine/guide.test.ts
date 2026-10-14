import { describe, expect, it } from "vitest";
import { coachOn, withGuide } from "./guide";

describe("withGuide", () => {
  it("switches the guide and returns the same state when nothing changes", () => {
    const on = { guide: true, coins: 3 };
    expect(withGuide(on, false)).toEqual({ guide: false, coins: 3 });
    expect(withGuide(on, true)).toBe(on);
    expect(withGuide(on, "no" as unknown as boolean)).toBe(on);
  });
});

describe("coachOn", () => {
  it("coaches only while the guide is on and nothing has been delivered", () => {
    expect(coachOn({ guide: true, ordersDelivered: 0 })).toBe(true);
    expect(coachOn({ guide: true, ordersDelivered: 1 })).toBe(false);
    expect(coachOn({ guide: false, ordersDelivered: 0 })).toBe(false);
  });
});
