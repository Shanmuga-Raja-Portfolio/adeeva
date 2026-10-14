import { describe, expect, it } from "vitest";
import {
  advanceTrendWeek,
  HOT_TAGS_PER_WEEK,
  rollTrendState,
  visibleNextTrends,
  type TrendState,
} from "./trendMarket";

describe("visibleNextTrends", () => {
  const trends: TrendState = { current: ["playful", "regal"], next: ["bold", "classic"] };

  it("shows next week's trends only to a trendsetter", () => {
    expect(visibleNextTrends({ profile: { trait: "trendsetter" }, trends })).toEqual(["bold", "classic"]);
    expect(visibleNextTrends({ profile: { trait: "dreamer" }, trends })).toBeNull();
  });
});

describe("trend rolls over any tag pool", () => {
  it("draws distinct hot tags from the pool it is given and moves next week forward", () => {
    const pool = ["rustic", "cosy", "sturdy", "modern"] as const;
    const [trends, rng] = rollTrendState(7, pool);
    expect(trends.current).toHaveLength(HOT_TAGS_PER_WEEK);
    expect(new Set(trends.current).size).toBe(HOT_TAGS_PER_WEEK);
    expect([...trends.current, ...trends.next].every((tag) => pool.includes(tag))).toBe(true);
    const [after] = advanceTrendWeek(trends, rng, pool);
    expect(after.current).toEqual(trends.next);
    expect(rollTrendState(7, pool)).toEqual([trends, rng]);
  });
});
