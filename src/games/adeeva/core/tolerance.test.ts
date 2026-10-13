import { describe, expect, it } from "vitest";
import { CLIENTS } from "../content/client";
import { rollClientBrief } from "./brief";
import { cutTolerance } from "./cutTolerance";
import type { GameState } from "./gameState";
import { sewBand } from "./sewBand";
import { newTestGame } from "./testPlaythrough";
import { traceAccuracy } from "../../../engine/geometry/traceAccuracy";

describe("cut tolerance", () => {
  it("starts at 1.2 cm and widens for the Perfectionist, big table and assistant", () => {
    const base = newTestGame();
    expect(cutTolerance(base)).toBeCloseTo(1.2);
    expect(cutTolerance(newTestGame({ trait: "perfectionist" }))).toBeCloseTo(1.44);
    const kitted: GameState = {
      ...base,
      studio: { ...base.studio, upgrades: ["big-table"], assistantHired: true },
    };
    expect(cutTolerance(kitted)).toBeCloseTo(1.2 * 1.15 * 1.1);
  });

  it("follows the difficulty", () => {
    expect(cutTolerance(newTestGame({ difficulty: "relaxed" }))).toBeCloseTo(1.56);
    expect(cutTolerance(newTestGame({ difficulty: "challenging" }))).toBeCloseTo(1.02);
  });
});

describe("sew band", () => {
  it("narrows for tricky materials and widens for the Perfectionist and pro machine", () => {
    const base = newTestGame();
    expect(sewBand(base, "cotton", false)).toBeCloseTo(0.12 * 0.95);
    expect(sewBand(base, "silk", false)).toBeLessThan(sewBand(base, "cotton", false));
    expect(sewBand(newTestGame({ trait: "perfectionist" }), "silk", false)).toBeCloseTo(
      sewBand(base, "silk", false) * 1.2,
    );
    const machine: GameState = { ...base, studio: { ...base.studio, upgrades: ["pro-machine"] } };
    expect(sewBand(machine, "silk", false)).toBeCloseTo(sewBand(base, "silk", false) * 1.15);
  });

  it("widens by 1.6 when sewing is assisted", () => {
    const base = newTestGame();
    expect(sewBand(base, "linen", true)).toBeCloseTo(sewBand(base, "linen", false) * 1.6);
  });
});

describe("client briefs", () => {
  it("ask for the client's own minimum quality whatever the trait", () => {
    for (const client of CLIENTS) {
      const [brief] = rollClientBrief(client, 1, 42, 0);
      expect(brief.minQuality).toBe(client.brief.minQuality);
    }
  });
});

describe("trace accuracy", () => {
  it("counts samples inside the tolerance band", () => {
    const outline = [
      [0, 0],
      [10, 0],
      [10, 10],
      [0, 10],
    ] as const;
    const samples = [
      [5, 0.5],
      [5, -1],
      [5, 3],
      [10.2, 5],
    ] as const;
    expect(traceAccuracy(samples, outline, 1.2)).toBe(0.75);
    expect(traceAccuracy([], outline, 1.2)).toBe(0);
  });
});
