import { describe, expect, it } from "vitest";
import { latestEntryFor } from "./runLog";

describe("latestEntryFor", () => {
  it("finds the newest log entry for a run", () => {
    const log = [
      { runId: "run-1", n: 1 },
      { runId: "run-2", n: 2 },
      { runId: "run-1", n: 3 },
    ];
    expect(latestEntryFor(log, "run-1")?.n).toBe(3);
    expect(latestEntryFor(log, "run-2")?.n).toBe(2);
    expect(latestEntryFor(log, "run-9")).toBeNull();
  });
});
