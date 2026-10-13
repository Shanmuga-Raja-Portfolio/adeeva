import { describe, expect, it } from "vitest";
import { dreamerFlair, settleTrendReward, type TrendRewardTerms } from "./trendReward";

const TERMS: TrendRewardTerms = {
  passed: true,
  score: 90,
  stars: 5,
  fee: 100,
  late: false,
  difficulty: "standard",
  trait: "trendsetter",
  hotTags: ["playful", "regal"],
  tags: ["playful", "regal", "classic"],
  colourCount: 1,
};

describe("trend rewards", () => {
  it("adds trend and trait bonuses on a pass", () => {
    const reward = settleTrendReward(TERMS);
    expect(reward.lines).toEqual([
      { label: "Fee", amount: 116 },
      { label: "Trend bonus", amount: 10 },
      { label: "Trendsetter eye", amount: 20 },
    ]);
    expect(reward.trendMatches).toEqual(["playful", "regal"]);
    expect(reward.buzz).toBe(1 + 5 + 6);
  });

  it("drops trend matches on a near miss and spots a dreamer's flair", () => {
    expect(settleTrendReward({ ...TERMS, passed: false }).trendMatches).toEqual([]);
    expect(dreamerFlair(3, [])).toBe(true);
    expect(dreamerFlair(1, ["bold"])).toBe(true);
    expect(dreamerFlair(2, ["classic"])).toBe(false);
  });
});
