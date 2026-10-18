import { afterEach, describe, expect, it, vi } from "vitest";
import { hostileTexts, hostileValues } from "../engine/hostileJson";
import { integerRangeParser, objectOf, oneOf, stringParser } from "../engine/parse";
import { parseSaveWith, serializeSave, type SaveCodec } from "../engine/saveEnvelope";
import { prototypeChanged, prototypeShape } from "../engine/saveFuzz";
import { TRAIT_IDS } from "../engine/trait";
import { GAME_IDS } from "./gameModule";
import { PER_GAME_REPUTATION_CAP, studioReputation } from "./perks";
import { readPlaytime, PLAYTIME_KEY } from "./playtime";
import { loadProfile, NEW_PROFILE, parseProfile, PROFILE_KEY, profileFromSave } from "./profile";
import { GAMES } from "./registry";
import { DEFAULT_SETTINGS, readSettings } from "./settings";
import {
  createSlotStore,
  lastSlotKey,
  readLastRawSlot,
  readRawSlots,
  SAVE_SLOTS,
  slotKey,
} from "./slotStore";

class MemoryStorage {
  readonly items = new Map<string, string>();

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.items.set(key, value);
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }
}

class BrokenStorage {
  getItem(): string | null {
    throw new DOMException("blocked", "SecurityError");
  }

  setItem(): void {
    throw new DOMException("full", "QuotaExceededError");
  }

  removeItem(): void {
    throw new DOMException("blocked", "SecurityError");
  }
}

interface Jar {
  readonly schemaVersion: 1;
  readonly label: string;
  readonly cookies: number;
}

const jarCodec: SaveCodec<Jar> = {
  version: 1,
  migrations: {},
  parse: objectOf<Jar>({
    schemaVersion: oneOf([1] as const),
    label: stringParser,
    cookies: integerRangeParser(0, 99),
  }),
};

const jarSlots = { parse: (json: string) => parseSaveWith(json, jarCodec), serialize: serializeSave };

const RAW_SAVE_SAMPLES: readonly unknown[] = [
  { schemaVersion: 1, reputation: 30, profile: { trait: TRAIT_IDS[0], career: "label", start: "head" } },
  { schemaVersion: 2, reputation: 12, profile: { trait: TRAIT_IDS[1], career: "stall", start: "student" } },
  { schemaVersion: 3, reputation: 99, profile: { name: "Ada", look: NEW_PROFILE.look, career: "garage" } },
];

const SETTINGS_SAMPLES: readonly unknown[] = [{ ...DEFAULT_SETTINGS, reducedMotion: true, assistSew: true }];

const PLAYTIME_SAMPLES: readonly unknown[] = [
  { version: 1, seconds: Object.fromEntries(GAME_IDS.map((id, index) => [id, index * 60])) },
];

const LAST_SLOT_TEXTS = [
  "1",
  "2",
  "3",
  "0",
  "4",
  " 1",
  "1 ",
  "01",
  "1.0",
  "1e0",
  "-1",
  "",
  "__proto__",
  "x".repeat(9000),
];

function texts(samples: readonly unknown[], seed: number, rounds = 300): string[] {
  return hostileTexts(
    samples.map((sample) => JSON.stringify(sample)),
    seed,
    rounds,
    3,
  ).map((entry) => entry.input);
}

function install(storage: object): void {
  vi.stubGlobal("window", { localStorage: storage, sessionStorage: storage });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("studio storage fuzzing", () => {
  it("always reads a usable profile, whatever the stored profile or seed save holds", () => {
    const before = prototypeShape();
    const storage = new MemoryStorage();
    install(storage);
    const stored = texts([NEW_PROFILE, { ...NEW_PROFILE, name: "Ada", perks: [] }], 0x9f0f);
    const seeds = hostileValues(RAW_SAVE_SAMPLES, 0x5eed, stored.length, 3);
    stored.forEach((text, index) => {
      storage.items.set(PROFILE_KEY, text);
      const profile = loadProfile(() => seeds[index]?.input);
      expect(parseProfile(JSON.parse(JSON.stringify(profile)))).toEqual(profile);
      expect(parseProfile(JSON.parse(storage.items.get(PROFILE_KEY) ?? "null"))).not.toBeNull();
      expect(parseProfile(JSON.parse(JSON.stringify(profileFromSave(seeds[index]?.input))))).not.toBeNull();
    });
    for (const entry of hostileValues([NEW_PROFILE], 0xbeef, 600)) {
      const parsed = parseProfile(entry.input);
      if (parsed !== null) expect(parseProfile(JSON.parse(JSON.stringify(parsed)))).toEqual(parsed);
    }
    expect(prototypeChanged(before)).toBe(false);
  }, 60_000);

  it("reads settings as five true-or-false switches and play time as whole seconds", () => {
    const before = prototypeShape();
    const storage = new MemoryStorage();
    install(storage);
    for (const text of texts(SETTINGS_SAMPLES, 0x5e7)) {
      storage.items.set("adeeva.settings", text);
      const settings = readSettings();
      expect(Object.keys(settings).sort()).toEqual(Object.keys(DEFAULT_SETTINGS).sort());
      expect(Object.values(settings).every((value) => typeof value === "boolean")).toBe(true);
    }
    for (const text of texts(PLAYTIME_SAMPLES, 0x71e)) {
      storage.items.set(PLAYTIME_KEY, text);
      const playtime = readPlaytime();
      expect(Object.keys(playtime).every((id) => GAME_IDS.some((gameId) => gameId === id))).toBe(true);
      expect(Object.values(playtime).every((value) => Number.isSafeInteger(value) && value >= 0)).toBe(true);
    }
    expect(prototypeChanged(before)).toBe(false);
  }, 60_000);

  it("lists slots as empty, ready or damaged and never throws on hostile slots", () => {
    const before = prototypeShape();
    const storage = new MemoryStorage();
    install(storage);
    const store = createSlotStore("fuzz", jarSlots);
    const valid = { schemaVersion: 1, label: "Oat", cookies: 3 };
    const slotTexts = texts([valid], 0x5107);
    slotTexts.forEach((text, index) => {
      const slot = SAVE_SLOTS[index % SAVE_SLOTS.length] ?? 1;
      storage.items.set(slotKey("fuzz", slot), text);
      storage.items.set(lastSlotKey("fuzz"), LAST_SLOT_TEXTS[index % LAST_SLOT_TEXTS.length] ?? "");
      const reads = store.readAllSlots();
      expect(reads.map((read) => read.slot)).toEqual([...SAVE_SLOTS]);
      expect(reads.every((read) => ["empty", "ready", "damaged"].includes(read.kind))).toBe(true);
      const next = store.continueSlot(reads);
      expect(next === null || next.kind === "ready").toBe(true);
      expect(readRawSlots("fuzz").length).toBeLessThanOrEqual(SAVE_SLOTS.length);
      readLastRawSlot("fuzz");
    });
    expect(prototypeChanged(before)).toBe(false);
  }, 60_000);

  it("keeps studio reputation finite and capped for any raw save in any game", () => {
    const before = prototypeShape();
    const cases = hostileValues(RAW_SAVE_SAMPLES, 0x4e9, 3000, 3).map((entry) => entry.input);
    for (let start = 0; start < cases.length; start += 3) {
      const slice = cases.slice(start, start + 3);
      const reputation = studioReputation(GAMES, () => slice);
      expect(Number.isFinite(reputation)).toBe(true);
      expect(reputation).toBeGreaterThanOrEqual(0);
      expect(reputation).toBeLessThanOrEqual(GAMES.length * PER_GAME_REPUTATION_CAP);
    }
    expect(prototypeChanged(before)).toBe(false);
  }, 60_000);

  it("falls back to defaults when the browser blocks or fills storage", () => {
    install(new BrokenStorage());
    expect(readSettings()).toEqual(DEFAULT_SETTINGS);
    expect(readPlaytime()).toEqual({});
    expect(loadProfile(() => RAW_SAVE_SAMPLES[2])).toEqual(profileFromSave(RAW_SAVE_SAMPLES[2]));
    const store = createSlotStore("fuzz", jarSlots);
    expect(store.savingAvailable()).toBe(false);
    expect(store.readAllSlots().every((read) => read.kind === "empty")).toBe(true);
    expect(store.writeSlot(1, { schemaVersion: 1, label: "Oat", cookies: 1 })).toBe(false);
    expect(() => store.deleteSlot(1)).not.toThrow();
    expect(readRawSlots("fuzz")).toEqual([]);
    expect(readLastRawSlot("fuzz")).toBeNull();
  });
});
