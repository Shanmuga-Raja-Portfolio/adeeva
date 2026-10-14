import { describe, expect, it } from "vitest";
import { serialize } from "./core/save";
import { newTestGame } from "./core/testPlaythrough";
import { thriftFlipModule } from "./module";

describe("studio reputation", () => {
  it("counts only reputation earned in a save it could open", () => {
    const state = { ...newTestGame(), reputation: 12 };
    expect(thriftFlipModule.reputationOf(JSON.parse(serialize(state)))).toBe(12);
    expect(thriftFlipModule.reputationOf({ reputation: 50 })).toBe(0);
    expect(
      thriftFlipModule.reputationOf({ schemaVersion: 9, reputation: 50, profile: { trait: "dreamer" } }),
    ).toBe(0);
    expect(
      thriftFlipModule.reputationOf({ schemaVersion: 1, reputation: 5, profile: { trait: "pirate" } }),
    ).toBe(0);
    expect(thriftFlipModule.reputationOf(null)).toBe(0);
  });
});
