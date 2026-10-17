import { describe, expect, it } from "vitest";
import { nextSeasonStart, seasonDay } from "./seasonClock";

describe("season clock", () => {
  it("counts season days from 1 and is null outside the season", () => {
    expect(seasonDay(8, 7, 14)).toBeNull();
    expect(seasonDay(8, 8, 14)).toBe(1);
    expect(seasonDay(8, 21, 14)).toBe(14);
    expect(seasonDay(8, 22, 14)).toBeNull();
  });

  it("starts the next season right after the last day", () => {
    expect(nextSeasonStart(8, 14)).toBe(22);
    expect(seasonDay(nextSeasonStart(8, 14), 22, 14)).toBe(1);
  });
});
