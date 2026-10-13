import { describe, expect, it } from "vitest";
import { addPlaytime, parsePlaytime, playtimeLabel } from "./playtime";

describe("playtime", () => {
  it("reads only known games with whole, non-negative seconds", () => {
    expect(
      parsePlaytime({ version: 1, seconds: { adeeva: 90, patisserie: -4, jewellery: 1.5, arcade: 30 } }),
    ).toEqual({ adeeva: 90 });
    expect(parsePlaytime({ version: 2, seconds: { adeeva: 90 } })).toEqual({});
    expect(parsePlaytime("90")).toEqual({});
  });

  it("adds time to one game and keeps the same record for nothing new", () => {
    const start = { adeeva: 10 };
    expect(addPlaytime(start, "adeeva", 5)).toEqual({ adeeva: 15 });
    expect(addPlaytime(start, "interior", 3)).toEqual({ adeeva: 10, interior: 3 });
    expect(addPlaytime(start, "adeeva", 0)).toBe(start);
  });

  it("says how long in plain words", () => {
    expect(playtimeLabel(0)).toBe("Not played yet");
    expect(playtimeLabel(42)).toBe("Under a minute");
    expect(playtimeLabel(60)).toBe("1 minute");
    expect(playtimeLabel(25 * 60)).toBe("25 minutes");
    expect(playtimeLabel(3600)).toBe("1 hour");
    expect(playtimeLabel(2 * 3600 + 60)).toBe("2 hours 1 minute");
  });
});
