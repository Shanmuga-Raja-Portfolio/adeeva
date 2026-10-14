import { describe, expect, it } from "vitest";
import { miseInstruction, quickPassInstruction, STAGE_LINES } from "./stageInstruction";

describe("Stage instruction", () => {
  it("asks for bowls until every ingredient is ready, then names Start cooking", () => {
    expect(miseInstruction(3)).toBe(STAGE_LINES.mise);
    expect(miseInstruction(0)).toBe(STAGE_LINES.miseDone);
  });

  it("asks for a rim wipe before Service! at the service pass", () => {
    expect(quickPassInstruction(false)).toBe(STAGE_LINES.quickPass);
    expect(quickPassInstruction(true)).toBe(STAGE_LINES.quickPassWiped);
  });
});
