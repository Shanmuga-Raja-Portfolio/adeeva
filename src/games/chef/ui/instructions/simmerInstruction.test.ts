import { describe, expect, it } from "vitest";
import { levelSpot, simmerInstruction, SIMMER_LINES, type SimmerMoment } from "./simmerInstruction";

const moment = (change: Partial<SimmerMoment> = {}): SimmerMoment => ({
  progress: 0,
  stirring: false,
  stopped: false,
  assisted: false,
  spot: "above",
  ...change,
});

describe("Simmer instruction", () => {
  it("places the level above, on or past the line", () => {
    expect(levelSpot(0.8, 0.44, 0.06)).toBe("above");
    expect(levelSpot(0.48, 0.44, 0.06)).toBe("on");
    expect(levelSpot(0.3, 0.44, 0.06)).toBe("past");
  });

  it("asks to press and follow, to keep stirring, and to resume after letting go", () => {
    expect(simmerInstruction(moment())).toBe(SIMMER_LINES.start);
    expect(simmerInstruction(moment({ progress: 0.4, stirring: true }))).toBe(SIMMER_LINES.stir);
    expect(simmerInstruction(moment({ progress: 0.4 }))).toBe(SIMMER_LINES.resume);
  });

  it("asks for Off the heat once the level reaches the line, or has passed it", () => {
    expect(simmerInstruction(moment({ progress: 2, stirring: true, spot: "on" }))).toBe(SIMMER_LINES.onLine);
    expect(simmerInstruction(moment({ progress: 3, spot: "past" }))).toBe(SIMMER_LINES.pastLine);
  });

  it("tells a Steady ladle player the pot stops itself", () => {
    expect(simmerInstruction(moment({ assisted: true }))).toBe(SIMMER_LINES.assistStart);
    expect(simmerInstruction(moment({ assisted: true, stirring: true, spot: "on" }))).toBe(
      SIMMER_LINES.assistStir,
    );
  });

  it("cheers once the pot is off the heat", () => {
    expect(simmerInstruction(moment({ stopped: true, spot: "on" }))).toBe(SIMMER_LINES.stopped);
  });
});
