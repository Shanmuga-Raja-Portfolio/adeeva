import { describe, expect, it } from "vitest";
import { ingredientById } from "./catalog";
import { newTestGame } from "./testPlaythrough";
import {
  bandAccuracy,
  pourCap,
  pourFlow,
  scoopBackGrams,
  settleGrams,
  tidyFactor,
  weighAccuracy,
  weighBand,
} from "./weighAccuracy";

const flour = ingredientById("flour");
const butter = ingredientById("butter");

describe("Scoop & Weigh scoring", () => {
  it("scores the design's Standard examples", () => {
    const band = weighBand(newTestGame({ difficulty: "standard" }));
    expect(band).toBeCloseTo(0.05);
    expect(bandAccuracy(186, 180, band)).toBe(1);
    expect(bandAccuracy(198, 180, band)).toBeCloseTo(0.667, 2);
    expect(bandAccuracy(180 * 1.05, 180, band)).toBe(1);
    expect(bandAccuracy(180 * 1.2, 180, band)).toBe(0);
  });

  it("widens the band for each difficulty, trait and the Bright Scale", () => {
    expect(weighBand(newTestGame({ difficulty: "relaxed" }))).toBeCloseTo(0.065);
    expect(weighBand(newTestGame({ difficulty: "challenging" }))).toBeCloseTo(0.0425);
    expect(weighBand(newTestGame({ trait: "perfectionist" }))).toBeCloseTo(0.06);
    const scale = { ...newTestGame(), upgrades: ["bright-scale" as const] };
    expect(weighBand(scale)).toBeCloseTo(0.06);
  });

  it("lets piece ingredients take their natural taps before tidying costs anything", () => {
    expect(tidyFactor(butter, 175, 7)).toBe(1);
    expect(tidyFactor(butter, 175, 9)).toBe(1);
    expect(tidyFactor(butter, 175, 12)).toBeCloseTo(0.88);
    expect(tidyFactor(flour, 200, 3)).toBe(1);
    expect(tidyFactor(flour, 200, 40)).toBe(0.6);
  });

  it("caps assisted weighing at 0.8", () => {
    const perfect = { grams: 200, actions: 1, assisted: false };
    expect(weighAccuracy(perfect, flour, 200, 0.05)).toBe(1);
    expect(weighAccuracy({ ...perfect, assisted: true }, flour, 200, 0.05)).toBe(0.8);
  });

  it("pours slowly, then ramps up after a second and a half", () => {
    expect(pourFlow(200, 0)).toBeCloseTo(16);
    expect(pourFlow(200, 1.5)).toBeCloseTo(16);
    expect(pourFlow(200, 1.75)).toBeCloseTo(68);
    expect(pourFlow(200, 2)).toBeCloseTo(120);
    expect(pourFlow(200, 9)).toBeCloseTo(120);
  });

  it("keeps the scale moving after release, more for tricky pours", () => {
    expect(settleGrams(16, 0.6)).toBeCloseTo(4);
    expect(settleGrams(16, 0.9)).toBeGreaterThan(settleGrams(16, 0.2));
  });

  it("stops at three times the target or the stock, whichever is lower", () => {
    expect(pourCap(200, 1000)).toBe(600);
    expect(pourCap(200, 150)).toBe(150);
    expect(scoopBackGrams(flour, 200)).toBe(20);
    expect(scoopBackGrams(butter, 175)).toBe(25);
  });
});
