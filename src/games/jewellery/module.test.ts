import { describe, expect, it } from "vitest";
import { serialize } from "./core/save";
import { newTestGame } from "./core/testPlaythrough";
import { jewelleryModule } from "./module";

describe("studio reputation", () => {
  it("counts only reputation earned in a save the game could open", () => {
    const state = { ...newTestGame(), reputation: 12 };
    expect(jewelleryModule.reputationOf(JSON.parse(serialize(state)))).toBe(12);
    expect(jewelleryModule.reputationOf({ reputation: 50 })).toBe(0);
    expect(
      jewelleryModule.reputationOf({ schemaVersion: 9, reputation: 50, profile: { trait: "dreamer" } }),
    ).toBe(0);
    expect(
      jewelleryModule.reputationOf({ schemaVersion: 1, reputation: 5, profile: { trait: "pirate" } }),
    ).toBe(0);
    expect(
      jewelleryModule.reputationOf({ schemaVersion: 1, reputation: -4, profile: { trait: "dreamer" } }),
    ).toBe(0);
    expect(jewelleryModule.reputationOf(null)).toBe(0);
  });

  it("is live in the studio with its own save keys", () => {
    expect(jewelleryModule.status).toBe("live");
    expect(jewelleryModule.id).toBe("jewellery");
  });
});
