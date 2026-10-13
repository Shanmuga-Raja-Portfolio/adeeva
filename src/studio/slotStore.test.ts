import { afterEach, describe, expect, it, vi } from "vitest";
import { createSlotStore, readLastRawSlot, readRawSlots, type SlotCodec } from "./slotStore";

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

interface Tray {
  readonly buns: number;
}

const trayCodec: SlotCodec<Tray> = {
  parse: (json) => {
    const value: unknown = JSON.parse(json);
    return typeof value === "object" && value !== null && "buns" in value && typeof value.buns === "number"
      ? { ok: true, state: { buns: value.buns } }
      : { ok: false, error: "Not a tray." };
  },
  serialize: (tray) => JSON.stringify(tray),
};

function install(): MemoryStorage {
  const store = new MemoryStorage();
  vi.stubGlobal("window", { localStorage: store });
  return store;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("createSlotStore", () => {
  it("keys every slot, the last slot and the probe by game id", () => {
    const store = install();
    const bakery = createSlotStore("bakery", trayCodec);
    expect(bakery.savingAvailable()).toBe(true);
    expect(bakery.writeSlot(2, { buns: 6 })).toBe(true);
    expect([...store.items.keys()].sort()).toEqual(["bakery.lastSlot", "bakery.save.2"]);
    expect(bakery.readAllSlots()).toEqual([
      { kind: "empty", slot: 1 },
      { kind: "ready", slot: 2, state: { buns: 6 } },
      { kind: "empty", slot: 3 },
    ]);
  });

  it("keeps games apart and reports damaged slots", () => {
    const store = install();
    store.setItem("bakery.save.1", '{"crumbs":1}');
    const bakery = createSlotStore("bakery", trayCodec);
    const forge = createSlotStore("forge", trayCodec);
    expect(bakery.readAllSlots()[0]).toEqual({ kind: "damaged", slot: 1, error: "Not a tray." });
    expect(forge.readAllSlots().every((read) => read.kind === "empty")).toBe(true);
  });

  it("forgets the last slot when that slot is deleted", () => {
    const store = install();
    const bakery = createSlotStore("bakery", trayCodec);
    bakery.writeSlot(1, { buns: 1 });
    bakery.writeSlot(3, { buns: 3 });
    expect(bakery.continueSlot(bakery.readAllSlots())?.slot).toBe(3);
    bakery.deleteSlot(3);
    expect(store.getItem("bakery.lastSlot")).toBeNull();
    expect(bakery.continueSlot(bakery.readAllSlots())?.slot).toBe(1);
  });
});

describe("raw slot reads", () => {
  it("reads parsed JSON for every filled slot and the last one played", () => {
    const store = install();
    store.setItem("bakery.save.1", '{"buns":1}');
    store.setItem("bakery.save.3", "{broken");
    store.setItem("bakery.lastSlot", "1");
    expect(readRawSlots("bakery")).toEqual([{ buns: 1 }, null]);
    expect(readLastRawSlot("bakery")).toEqual({ buns: 1 });
    expect(readLastRawSlot("forge")).toBeNull();
  });
});
