import { describe, expect, it } from "vitest";
import { settleReward, type RewardTerms } from "./reward";

const base: RewardTerms = {
  passed: true,
  score: 50,
  stars: 3,
  fee: 100,
  late: false,
  difficulty: "standard",
  trait: "dreamer",
  bonusLines: [],
  extraBuzz: 0,
};

describe("settleReward", () => {
  it("pays the fee share by score with reputation and buzz", () => {
    expect(settleReward(base)).toEqual({
      outcome: "pass",
      coins: 100,
      reputation: 2,
      buzz: 4,
      lines: [{ label: "Fee", amount: 100 }],
    });
  });

  it("orders the fee, game bonuses, charmer tip and late penalty", () => {
    const reward = settleReward({
      ...base,
      trait: "charmer",
      late: true,
      difficulty: "challenging",
      bonusLines: [{ label: "Trend bonus", amount: 20 }],
      extraBuzz: 2,
    });
    expect(reward.lines.map((line) => line.label)).toEqual([
      "Fee",
      "Trend bonus",
      "Charmer tip",
      "Late delivery",
    ]);
    expect(reward.coins).toBe(100 + 20 + 10 - 50);
    expect(reward.buzz).toBe(6);
  });

  it("never pays below zero coins", () => {
    const reward = settleReward({ ...base, bonusLines: [{ label: "Damage", amount: -500 }] });
    expect(reward.coins).toBe(0);
  });

  it("treats every relaxed result as a pass", () => {
    expect(settleReward({ ...base, passed: false, difficulty: "relaxed" }).outcome).toBe("pass");
  });

  it("softens a standard miss and spares a charmer's reputation", () => {
    expect(settleReward({ ...base, passed: false })).toEqual({
      outcome: "soft-fail",
      coins: 40,
      reputation: -1,
      buzz: 0,
      lines: [{ label: "Part of the fee", amount: 40 }],
    });
    expect(settleReward({ ...base, passed: false, trait: "charmer" }).reputation).toBe(0);
  });

  it("pays nothing for a challenging miss", () => {
    expect(settleReward({ ...base, passed: false, difficulty: "challenging" })).toEqual({
      outcome: "fail",
      coins: 0,
      reputation: -3,
      buzz: 0,
      lines: [],
    });
  });
});
