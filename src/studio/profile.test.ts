import { afterEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_LOOK } from "../engine/avatar";
import { loadProfile, NEW_PROFILE, parseProfile, profileFromSave, PROFILE_KEY } from "./profile";

const look = {
  skinTone: "cocoa",
  hairStyle: "braids",
  hairColour: "rose-gold",
  outfit: "dungarees",
} as const;

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("parseProfile", () => {
  it("reads a stored profile", () => {
    const stored = { ...NEW_PROFILE, name: "Ada", look, accessory: "star-clip", perks: ["star-clip"] };
    expect(parseProfile(stored)).toEqual(stored);
  });

  it("refuses anything it does not recognise", () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile({ ...NEW_PROFILE, version: 2 })).toBeNull();
    expect(parseProfile({ ...NEW_PROFILE, perks: ["free-coins"] })).toBeNull();
    expect(parseProfile({ ...NEW_PROFILE, theme: "neon" })).toBeNull();
    expect(parseProfile({ ...NEW_PROFILE, look: { ...look, hairStyle: "mohawk" } })).toBeNull();
  });
});

describe("profileFromSave", () => {
  it("takes the name and avatar from a game save", () => {
    expect(profileFromSave({ profile: { name: "  Bea ", look, career: "student" } })).toEqual({
      ...NEW_PROFILE,
      name: "Bea",
      look,
    });
  });

  it("starts fresh when there is no usable save", () => {
    expect(profileFromSave(null)).toEqual(NEW_PROFILE);
    expect(profileFromSave({ profile: { name: 4, look: "plain" } })).toEqual({
      ...NEW_PROFILE,
      look: DEFAULT_LOOK,
    });
  });
});

describe("loadProfile", () => {
  function install(items: Map<string, string>): void {
    vi.stubGlobal("window", {
      localStorage: {
        getItem: (key: string) => items.get(key) ?? null,
        setItem: (key: string, value: string) => items.set(key, value),
      },
    });
  }

  it("seeds and stores a profile from the last save on first run", () => {
    const items = new Map<string, string>();
    install(items);
    const seeded = loadProfile(() => ({ profile: { name: "Cy", look } }));
    expect(seeded.name).toBe("Cy");
    expect(JSON.parse(items.get(PROFILE_KEY) ?? "null")).toEqual(seeded);
  });

  it("keeps a stored profile instead of seeding again", () => {
    const items = new Map([[PROFILE_KEY, JSON.stringify({ ...NEW_PROFILE, name: "Dee" })]]);
    install(items);
    expect(loadProfile(() => ({ profile: { name: "Cy", look } })).name).toBe("Dee");
  });
});
