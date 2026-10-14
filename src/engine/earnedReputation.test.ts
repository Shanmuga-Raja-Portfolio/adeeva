import { describe, expect, it } from "vitest";
import { earnedReputation, traitGatedStart } from "./earnedReputation";

const fromZero = () => 0;

describe("earned reputation from a raw save", () => {
  it("starts trait careers only for a known trait", () => {
    const start = traitGatedStart(12);
    expect(start({ trait: "charmer" })).toBe(12);
    expect(start({ trait: "wizard" })).toBeNull();
    expect(start({})).toBeNull();
  });

  it("counts reputation above the career start", () => {
    const save = { schemaVersion: 2, reputation: 30, profile: { career: "label" } };
    expect(earnedReputation(save, 2, () => 20)).toBe(10);
    expect(earnedReputation(save, 2, () => 40)).toBe(0);
    expect(earnedReputation(save, 2, () => null)).toBe(0);
  });

  it("ignores saves that could never load", () => {
    expect(earnedReputation(undefined, 1, fromZero)).toBe(0);
    expect(earnedReputation({ schemaVersion: 1, reputation: 5 }, 1, fromZero)).toBe(0);
    expect(earnedReputation({ schemaVersion: 3, reputation: 5, profile: {} }, 2, fromZero)).toBe(0);
    expect(earnedReputation({ schemaVersion: 1.5, reputation: 5, profile: {} }, 2, fromZero)).toBe(0);
    expect(earnedReputation({ schemaVersion: 1, reputation: 1e15 + 0.5, profile: {} }, 1, fromZero)).toBe(0);
    expect(earnedReputation({ schemaVersion: 1, reputation: -3, profile: {} }, 1, fromZero)).toBe(0);
  });
});
