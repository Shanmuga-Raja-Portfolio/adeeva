import { describe, expect, it } from "vitest";
import { upgradeIssues } from "./upgrades";

describe("upgradeIssues", () => {
  const lamp = { id: "lamp", name: "Lamp", price: 50, minReputation: 4 };

  it("lists what stands in the way of buying an upgrade", () => {
    expect(upgradeIssues([], lamp, 50, 4)).toEqual([]);
    expect(upgradeIssues(["lamp"], lamp, 10, 1)).toEqual([
      "Lamp is already in your studio.",
      "Lamp unlocks at reputation 4.",
      "Lamp costs 50 coins.",
    ]);
  });
});
