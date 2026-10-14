import { describe, expect, it } from "vitest";
import { serialize } from "./core/save";
import { newTestGame } from "./core/testPlaythrough";
import { workshopModule } from "./module";

describe("studio reputation from a Workshop save", () => {
  it("reads earned reputation straight from the raw save", () => {
    const save = JSON.parse(serialize({ ...newTestGame(), reputation: 9 })) as unknown;
    expect(workshopModule.reputationOf(save)).toBe(9);
  });

  it("earns nothing from saves the game cannot open", () => {
    expect(workshopModule.reputationOf(null)).toBe(0);
    expect(workshopModule.reputationOf({ reputation: 50 })).toBe(0);
    expect(workshopModule.reputationOf({ schemaVersion: 9, reputation: 50, profile: {} })).toBe(0);
    expect(workshopModule.reputationOf({ schemaVersion: 1, reputation: "lots", profile: {} })).toBe(0);
    expect(workshopModule.reputationOf({ schemaVersion: 1, reputation: -4, profile: {} })).toBe(0);
  });
});
