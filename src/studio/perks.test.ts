import { describe, expect, it } from "vitest";
import { DEFAULT_LOOK, HAIR_COLOURS, OUTFIT_STYLES } from "../engine/avatar";
import { adeevaModule } from "../games/adeeva/module";
import {
  lookAllowed,
  lookOptions,
  nextPerk,
  PER_GAME_REPUTATION_CAP,
  PERKS,
  studioReputation,
  unlockedPerks,
} from "./perks";

function adeevaSave(reputation: unknown, career: unknown, schemaVersion: unknown = 3) {
  return { schemaVersion, reputation, profile: { career } };
}

describe("studio reputation", () => {
  it("sums the best slot of every game", () => {
    const games = [
      { id: "adeeva" as const, reputationOf: (raw: unknown) => (typeof raw === "number" ? raw : 0) },
      { id: "patisserie" as const, reputationOf: (raw: unknown) => (typeof raw === "number" ? raw * 2 : 0) },
    ];
    const slots = { adeeva: [3, 9, "broken"], patisserie: [2] } as const;
    expect(studioReputation(games, (id) => (id === "adeeva" ? slots.adeeva : slots.patisserie))).toBe(13);
    expect(studioReputation(games, () => [])).toBe(0);
  });

  it("caps what any one game adds, so every perk needs play across at least three games", () => {
    const flat = (raw: unknown) => (typeof raw === "number" ? raw : 0);
    const three = [
      { id: "adeeva" as const, reputationOf: flat },
      { id: "patisserie" as const, reputationOf: flat },
      { id: "chef" as const, reputationOf: flat },
    ];
    const last = PERKS[PERKS.length - 1]?.threshold ?? 0;
    expect(studioReputation(three.slice(0, 1), () => [999])).toBe(PER_GAME_REPUTATION_CAP);
    expect(studioReputation(three.slice(0, 2), () => [999])).toBeLessThan(last);
    expect(studioReputation(three, () => [999])).toBeGreaterThanOrEqual(last);
    expect(studioReputation(three, () => [5])).toBe(15);
    expect(PER_GAME_REPUTATION_CAP).toBeGreaterThanOrEqual(PERKS[3]?.threshold ?? Infinity);
  });

  it("counts only the reputation earned in ADEEVA, never below zero", () => {
    expect(adeevaModule.reputationOf(adeevaSave(7, "student"))).toBe(7);
    expect(adeevaModule.reputationOf(adeevaSave(26, "label"))).toBe(6);
    expect(adeevaModule.reputationOf(adeevaSave(12, "label"))).toBe(0);
    expect(adeevaModule.reputationOf(adeevaSave(9, "student", 1))).toBe(9);
    expect(adeevaModule.reputationOf(null)).toBe(0);
    expect(adeevaModule.reputationOf(adeevaSave("lots", "student"))).toBe(0);
  });

  it("ignores saves ADEEVA itself would refuse to open", () => {
    expect(adeevaModule.reputationOf({ reputation: 999 })).toBe(0);
    expect(adeevaModule.reputationOf({ reputation: 999, profile: { career: "student" } })).toBe(0);
    expect(adeevaModule.reputationOf(adeevaSave(999, "student", 4))).toBe(0);
    expect(adeevaModule.reputationOf(adeevaSave(999, "student", 0))).toBe(0);
    expect(adeevaModule.reputationOf(adeevaSave(999, "student", 2.5))).toBe(0);
    expect(adeevaModule.reputationOf(adeevaSave(999, "astronaut"))).toBe(0);
  });
});

describe("perks", () => {
  it("are cosmetic and ordered by a rising threshold", () => {
    const thresholds = PERKS.map((perk) => perk.threshold);
    expect([...thresholds].sort((a, b) => a - b)).toEqual(thresholds);
    expect(new Set(PERKS.map((perk) => perk.id)).size).toBe(PERKS.length);
    expect(
      PERKS.every((perk) => ["hair-colour", "outfit", "accessory", "home-theme"].includes(perk.kind)),
    ).toBe(true);
  });

  it("unlock the first perk after a few good orders", () => {
    const firstThreshold = PERKS[0]?.threshold ?? 0;
    expect(firstThreshold).toBeGreaterThan(2);
    expect(firstThreshold).toBeLessThanOrEqual(6);
    expect(unlockedPerks(firstThreshold - 1, [])).toEqual([]);
    expect(unlockedPerks(firstThreshold, [])).toEqual(["rose-gold-hair"]);
  });

  it("never take an unlocked perk away", () => {
    expect(unlockedPerks(0, ["star-clip"])).toEqual(["star-clip"]);
    expect(unlockedPerks(8, ["flower-crown"])).toEqual(["rose-gold-hair", "star-clip", "flower-crown"]);
  });

  it("names the next perk to aim for", () => {
    expect(nextPerk(0, [])?.id).toBe("rose-gold-hair");
    expect(nextPerk(9, unlockedPerks(9, []))?.id).toBe("twilight-hall");
    expect(nextPerk(999, unlockedPerks(999, []))).toBeNull();
  });

  it("hold back perk looks until they are unlocked", () => {
    const base = lookOptions([]);
    expect(base.hairColours).not.toContain("rose-gold");
    expect(base.hairColours).not.toContain("ocean-teal");
    expect(base.outfits).not.toContain("dungarees");
    expect(base.hairColours.length).toBe(HAIR_COLOURS.length - 2);
    const all = lookOptions(unlockedPerks(999, []));
    expect(all.hairColours).toEqual(HAIR_COLOURS.map((colour) => colour.id));
    expect(all.outfits).toEqual([...OUTFIT_STYLES]);
  });

  it("refuse a perk look that is still locked", () => {
    const base = lookOptions([]);
    expect(lookAllowed(base, DEFAULT_LOOK)).toBe(true);
    expect(lookAllowed(base, { ...DEFAULT_LOOK, hairColour: "rose-gold" })).toBe(false);
    expect(lookAllowed(base, { ...DEFAULT_LOOK, outfit: "dungarees" })).toBe(false);
    const owned = lookOptions(["rose-gold-hair", "dungarees"]);
    expect(lookAllowed(owned, { ...DEFAULT_LOOK, hairColour: "rose-gold", outfit: "dungarees" })).toBe(true);
  });
});
