import { describe, expect, it } from "vitest";
import { visibleNextTrends, type TrendState } from "./trendMarket";

describe("visibleNextTrends", () => {
  const trends: TrendState = { current: ["playful", "regal"], next: ["bold", "classic"] };

  it("shows next week's trends only to a trendsetter", () => {
    expect(visibleNextTrends({ profile: { trait: "trendsetter" }, trends })).toEqual(["bold", "classic"]);
    expect(visibleNextTrends({ profile: { trait: "dreamer" }, trends })).toBeNull();
  });
});
