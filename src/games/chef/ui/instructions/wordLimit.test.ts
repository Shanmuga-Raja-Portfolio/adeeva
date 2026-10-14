import { describe, expect, it } from "vitest";
import { CHOP_LINES } from "./chopInstruction";
import { PAUSED_LINE } from "./pausedLine";
import { garnishesLeftLine, PLATE_LINES } from "./plateInstruction";
import { LEVEL_LABELS, SIMMER_LINES } from "./simmerInstruction";
import { setHeatLine, SIZZLE_LINES } from "./sizzleInstruction";
import { STAGE_LINES } from "./stageInstruction";
import { TASTE_LINES } from "./tasteInstruction";

const words = (line: string) => line.split(/\s+/).filter((word) => word.length > 0).length;

describe("Station instruction lines", () => {
  it("keep every instruction to twelve words or fewer", () => {
    const lines = [
      PAUSED_LINE,
      ...Object.values(CHOP_LINES),
      ...Object.values(SIZZLE_LINES),
      setHeatLine(5),
      ...Object.values(SIMMER_LINES),
      ...Object.values(LEVEL_LABELS),
      ...Object.values(TASTE_LINES),
      ...Object.values(PLATE_LINES),
      garnishesLeftLine(1),
      garnishesLeftLine(3),
      ...Object.values(STAGE_LINES),
    ];
    for (const line of lines) expect(words(line), line).toBeLessThanOrEqual(12);
  });

  it("never mixes tapping and holding in one chop line", () => {
    for (const line of Object.values(CHOP_LINES)) {
      const taps = /\btap(ping)? (the board|as)\b/i.test(line);
      const holds = /\bhold/i.test(line);
      expect(taps && holds, line).toBe(false);
    }
  });
});
