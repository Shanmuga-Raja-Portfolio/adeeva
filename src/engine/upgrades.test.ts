import { describe, expect, it } from "vitest";
import { buyUpgrade, upgradeIssues, upgradePurchaseIssues } from "./upgrades";

describe("upgradeIssues", () => {
  const lamp = { id: "lamp", name: "Lamp", price: 50, minReputation: 4 };

  it("lists what stands in the way of buying an upgrade", () => {
    expect(upgradeIssues([], lamp, 50, 4)).toEqual([]);
    expect(upgradeIssues(["lamp"], lamp, 10, 1)).toEqual([
      "Lamp is already yours.",
      "Lamp unlocks at reputation 4.",
      "Lamp costs 50 coins.",
    ]);
  });
});

describe("upgrade purchase", () => {
  const lamp = { id: "lamp", name: "Lamp", price: 50, minReputation: 4 };
  const shop: { coins: number; reputation: number; upgrades: readonly string[] } = {
    coins: 80,
    reputation: 5,
    upgrades: [],
  };

  it("buys a known upgrade it can afford", () => {
    expect(upgradePurchaseIssues(shop, lamp)).toEqual([]);
    expect(buyUpgrade(shop, lamp)).toEqual({ coins: 30, reputation: 5, upgrades: ["lamp"] });
  });

  it("returns the same state for an unknown or blocked upgrade", () => {
    expect(upgradePurchaseIssues(shop, undefined)).toEqual(["That upgrade does not exist."]);
    expect(buyUpgrade(shop, undefined)).toBe(shop);
    const poor = { ...shop, coins: 10 };
    expect(buyUpgrade(poor, lamp)).toBe(poor);
  });
});
