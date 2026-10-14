import { describe, expect, it } from "vitest";
import { serialize } from "./core/save";
import { newTestGame } from "./core/testPlaythrough";
import { chefModule } from "./module";

describe("studio reputation", () => {
  it("counts only reputation earned past the chosen start, in a save the game could open", () => {
    expect(chefModule.reputationOf(JSON.parse(serialize({ ...newTestGame(), reputation: 12 })))).toBe(12);
    expect(
      chefModule.reputationOf(JSON.parse(serialize({ ...newTestGame({ start: "head" }), reputation: 75 }))),
    ).toBe(15);
    expect(chefModule.reputationOf(JSON.parse(serialize(newTestGame({ start: "head" }))))).toBe(0);
    expect(chefModule.reputationOf({ reputation: 50 })).toBe(0);
    expect(
      chefModule.reputationOf({
        schemaVersion: 9,
        reputation: 50,
        profile: { trait: "dreamer", start: "student" },
      }),
    ).toBe(0);
    expect(
      chefModule.reputationOf({
        schemaVersion: 1,
        reputation: 50,
        profile: { trait: "pirate", start: "student" },
      }),
    ).toBe(0);
    expect(
      chefModule.reputationOf({
        schemaVersion: 1,
        reputation: 50,
        profile: { trait: "dreamer", start: "sous" },
      }),
    ).toBe(0);
    expect(chefModule.reputationOf(null)).toBe(0);
  });

  it("is live in the studio as Six Kitchens", () => {
    expect(chefModule.id).toBe("chef");
    expect(chefModule.title).toBe("Six Kitchens");
  });
});
