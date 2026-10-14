import { describe, expect, it } from "vitest";
import { stepLine, type StepDetail } from "./kindFeedback";

const detail: StepDetail = {
  chopHeld: false,
  sizzleHeatFit: 1,
  sizzleCrispy: false,
  simmerFollow: 1,
  simmerLevel: 1,
  tasteJar: null,
  plateInWell: 1,
  plateWiped: true,
};

describe("Kind feedback", () => {
  it("coaches a tap for a weak slice or dice, and a hold for a weak mince", () => {
    expect(stepLine("chop", detail)).toMatch(/Tap as the mark meets the line/);
    const held = stepLine("chop", { ...detail, chopHeld: true });
    expect(held).toMatch(/Hold right to its end/);
    expect(held).not.toMatch(/tap/i);
  });
});
