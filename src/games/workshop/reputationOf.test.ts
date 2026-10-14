import { describe, expect, it } from "vitest";
import { serialize } from "./core/save";
import { newTestGame } from "./core/testPlaythrough";
import { reputationOf } from "./reputationOf";

describe("studio reputation from a Workshop save", () => {
  it("reads earned reputation straight from the raw save", () => {
    const save = JSON.parse(serialize({ ...newTestGame(), reputation: 9 })) as unknown;
    expect(reputationOf(save)).toBe(9);
  });

  it("earns nothing from saves the game cannot open", () => {
    expect(reputationOf(null)).toBe(0);
    expect(reputationOf({ reputation: 50 })).toBe(0);
    expect(reputationOf({ schemaVersion: 9, reputation: 50, profile: {} })).toBe(0);
    expect(reputationOf({ schemaVersion: 1, reputation: "lots", profile: {} })).toBe(0);
    expect(reputationOf({ schemaVersion: 1, reputation: -4, profile: {} })).toBe(0);
  });
});
