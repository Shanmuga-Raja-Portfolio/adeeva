import { describe, expect, it } from "vitest";
import { PER_GAME_REPUTATION_CAP, studioReputation } from "../../studio/perks";
import { serialize } from "./core/save";
import { newTestGame } from "./core/testPlaythrough";
import { interiorModule } from "./module";

describe("studio reputation", () => {
  it("counts only reputation earned in a save the game could open", () => {
    const state = { ...newTestGame(), reputation: 14 };
    expect(interiorModule.reputationOf(JSON.parse(serialize(state)))).toBe(14);
    expect(interiorModule.reputationOf({ reputation: 50 })).toBe(0);
    expect(
      interiorModule.reputationOf({ schemaVersion: 9, reputation: 50, profile: { trait: "dreamer" } }),
    ).toBe(0);
    expect(
      interiorModule.reputationOf({ schemaVersion: 1, reputation: 5, profile: { trait: "pirate" } }),
    ).toBe(0);
    expect(
      interiorModule.reputationOf({ schemaVersion: 1, reputation: -4, profile: { trait: "dreamer" } }),
    ).toBe(0);
    expect(interiorModule.reputationOf(null)).toBe(0);
  });

  it("adds no more than the per-game cap to studio reputation", () => {
    const save = JSON.parse(serialize({ ...newTestGame(), reputation: 200 })) as unknown;
    const slots = (id: string): readonly unknown[] => (id === "interior" ? [save] : []);
    expect(interiorModule.reputationOf(save)).toBe(200);
    expect(studioReputation([interiorModule], slots)).toBe(PER_GAME_REPUTATION_CAP);
  });

  it("is live in the studio with its own save keys and the parent sentence", () => {
    expect(interiorModule.id).toBe("interior");
    expect(interiorModule.parentNote).toBe(
      "This game does not teach real painting, DIY, ladder use or electrical work. Its rooms and sizes are made up.",
    );
  });
});
