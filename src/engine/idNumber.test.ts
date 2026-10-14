import { describe, expect, it } from "vitest";
import { idNumber, runIdsBelow, runNumber } from "./idNumber";

describe("numbered ids", () => {
  it("reads the number after the exact prefix and gives 0 otherwise", () => {
    expect(idNumber("board-12", "board")).toBe(12);
    expect(idNumber("board-12", "run")).toBe(0);
    expect(idNumber("board-", "board")).toBe(0);
    expect(idNumber("board-1a", "board")).toBe(0);
    expect(idNumber("board-1.5", "board")).toBe(0);
    expect(idNumber("xboard-3", "board")).toBe(0);
    expect(runNumber("run-7")).toBe(7);
    expect(runNumber("run-07")).toBe(7);
    expect(runNumber("service-7")).toBe(0);
  });

  it("checks that every run id is below the next run number", () => {
    expect(runIdsBelow([], 1)).toBe(true);
    expect(runIdsBelow(["run-1", "run-2"], 3)).toBe(true);
    expect(runIdsBelow(["run-1", "run-3"], 3)).toBe(false);
    expect(runIdsBelow(["odd"], 1)).toBe(true);
  });
});
