import { describe, expect, it } from "vitest";
import { weighBanner } from "./weighBanner";
import { FRESH_POUR } from "./weighPour";

const base = {
  pour: FRESH_POUR,
  target: 200,
  band: 0.05,
  unit: "g",
  piece: false,
  covered: false,
  verdict: null,
  great: false,
};

describe("weighBanner", () => {
  it("invites a pour before anything is on the scale", () => {
    expect(weighBanner(base)).toEqual({ text: "Hold the button to pour 200 g", tone: "ready" });
    expect(weighBanner({ ...base, piece: true }).text).toBe("Tap to add, up to 200 g");
  });

  it("cheers while the pour sits in the green", () => {
    const pour = { ...FRESH_POUR, holding: true, grams: 198 };
    expect(weighBanner({ ...base, pour }).tone).toBe("green");
    expect(weighBanner({ ...base, pour: { ...pour, grams: 120 } }).tone).toBe("pouring");
    expect(weighBanner({ ...base, pour: { ...pour, grams: 260 } }).tone).toBe("over");
  });

  it("keeps the green zone a secret on a covered scale", () => {
    const pour = { ...FRESH_POUR, holding: true, grams: 198 };
    expect(weighBanner({ ...base, pour, covered: true }).text).toBe("Pouring… stop near 200 g");
  });

  it("shows the verdict once the scale settles", () => {
    const pour = { ...FRESH_POUR, grams: 200, actions: 1 };
    expect(weighBanner({ ...base, pour, verdict: "Spot on!", great: true })).toEqual({
      text: "Spot on!",
      tone: "great",
    });
    expect(weighBanner({ ...base, pour: { ...pour, settleLeft: 0.4 } }).tone).toBe("pouring");
    expect(weighBanner({ ...base, pour: { ...pour, emptied: true } }).tone).toBe("over");
  });
});
