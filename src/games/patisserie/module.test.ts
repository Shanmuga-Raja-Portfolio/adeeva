import { describe, expect, it } from "vitest";
import { serialize } from "./core";
import { newTestGame } from "./core/testPlaythrough";
import { patisserieModule } from "./module";

describe("studio reputation from a Patisserie save", () => {
  it("reads earned reputation straight from the raw save", () => {
    const save = JSON.parse(serialize({ ...newTestGame(), reputation: 7 })) as unknown;
    expect(patisserieModule.reputationOf(save)).toBe(7);
  });

  it("earns nothing from saves the game cannot open", () => {
    expect(patisserieModule.reputationOf(null)).toBe(0);
    expect(patisserieModule.reputationOf({ reputation: 50 })).toBe(0);
    expect(patisserieModule.reputationOf({ schemaVersion: 9, reputation: 50, profile: {} })).toBe(0);
    expect(patisserieModule.reputationOf({ schemaVersion: 1, reputation: "lots", profile: {} })).toBe(0);
    expect(patisserieModule.reputationOf({ schemaVersion: 1, reputation: -4, profile: {} })).toBe(0);
    expect(patisserieModule.reputationOf({ schemaVersion: 1, reputation: 1e15 + 0.5, profile: {} })).toBe(0);
    expect(patisserieModule.reputationOf({ schemaVersion: 1, reputation: 2.5, profile: {} })).toBe(0);
  });
});
