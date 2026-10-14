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

describe("trend reward options", () => {
  it("uses custom bonus labels and adds extra buzz", () => {
    const dreamer: TrendRewardTerms = { ...TERMS, trait: "dreamer", colourCount: 3 };
    const reward = settleTrendReward({
      ...dreamer,
      labels: { trend: "Crowd pleaser", dreamer: "Wild streak" },
      extraBuzz: 4,
    });
    expect(reward.lines.map((line) => line.label)).toEqual(["Fee", "Crowd pleaser", "Wild streak"]);
    expect(reward.buzz).toBe(settleTrendReward(dreamer).buzz + 4);
  });
});

describe("trend rewards over a game's own tags", () => {
  it("matches any tag pool and appends the game's extra lines after the trait lines", () => {
    const reward = settleTrendReward({
      ...TERMS,
      trait: "dreamer",
      hotTags: ["rustic", "cosy"],
      tags: ["rustic", "sturdy"],
      colourCount: 3,
      labels: { trend: "Neighbourhood favourite", dreamer: "Big ideas" },
      extraLines: [{ label: "Fine wood bonus", amount: 15 }],
    });
    expect(reward.lines.map((line) => line.label)).toEqual([
      "Fee",
      "Neighbourhood favourite",
      "Big ideas",
      "Fine wood bonus",
    ]);
    expect(reward.trendMatches).toEqual(["rustic"]);
  });
});
