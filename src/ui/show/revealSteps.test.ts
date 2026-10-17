import { describe, expect, it } from "vitest";
import { restX, revealedSlots, revealSteps, type RevealTiming } from "./revealSteps";

const MOTION: RevealTiming = { title: 1, lights: 2, glide: 3, wait: 4, reveal: 5, finale: 6, panels: 7 };
const STILL: RevealTiming = { ...MOTION, lights: 0, glide: 0 };

describe("reveal steps", () => {
  it("plays title, lights, then glide, wait and reveal per piece, finale and panels", () => {
    const steps = revealSteps(2, false, { motion: MOTION, still: STILL, lights: true });
    expect(steps.map((step) => `${step.kind}${step.slot >= 0 ? step.slot : ""}`)).toEqual([
      "title",
      "lights",
      "glide0",
      "wait0",
      "reveal0",
      "glide1",
      "wait1",
      "reveal1",
      "finale",
      "panels",
    ]);
    expect(steps[2]?.ms).toBe(3);
  });

  it("drops glide and lights in reduced motion, and without lights when a game has none", () => {
    const still = revealSteps(1, true, { motion: MOTION, still: STILL, lights: true });
    expect(still.map((step) => step.kind)).toEqual(["title", "wait", "reveal", "finale", "panels"]);
    const plain = revealSteps(1, false, { motion: MOTION, still: STILL, lights: false });
    expect(plain.map((step) => step.kind)).toEqual(["title", "glide", "wait", "reveal", "finale", "panels"]);
  });

  it("lists the slots already revealed before a step", () => {
    const steps = revealSteps(3, true, { motion: MOTION, still: STILL, lights: false });
    expect(revealedSlots(steps, 0)).toEqual([]);
    expect(revealedSlots(steps, 5)).toEqual([0, 1]);
  });
});

describe("rest spots", () => {
  it("centres one piece and spreads more across the stage", () => {
    expect(restX(0, 1)).toBe(50);
    expect(restX(0, 2)).toBe(29);
    expect(restX(1, 2)).toBe(71);
    expect(restX(1, 3)).toBe(50);
    expect(restX(0, 5)).toBe(14);
    expect(restX(4, 5)).toBe(86);
  });
});
