import { afterEach, describe, expect, it, vi } from "vitest";
import { serialize } from "../core";
import { newTestGame } from "../core/testPlaythrough";
import { continueSlot, markLastSlot, readAllSlots, savingAvailable, writeSlot } from "./saveSlots";

class MemoryStorage {
  readonly items = new Map<string, string>();
  failWrites = false;

  getItem(key: string): string | null {
    return this.items.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    if (this.failWrites) throw new Error("QuotaExceededError");
    this.items.set(key, value);
  }

  removeItem(key: string): void {
    this.items.delete(key);
  }
}

function installStorage(store: MemoryStorage): void {
  vi.stubGlobal("window", { localStorage: store });
}

function installBlockedStorage(): void {
  vi.stubGlobal("window", {
    get localStorage(): Storage {
      throw new Error("SecurityError");
    },
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("save slots", () => {
  it("continues the slot that was loaded last, not only the one saved last", () => {
    const store = new MemoryStorage();
    installStorage(store);
    store.setItem("adeeva.save.1", serialize(newTestGame({ name: "Ada" })));
    store.setItem("adeeva.save.2", serialize(newTestGame({ name: "Bea" })));
    writeSlot(2, newTestGame({ name: "Bea" }));
    expect(continueSlot(readAllSlots())?.slot).toBe(2);
    markLastSlot(1);
    expect(continueSlot(readAllSlots())?.slot).toBe(1);
  });

  it("reports a failed write instead of pretending it saved", () => {
    const store = new MemoryStorage();
    installStorage(store);
    store.failWrites = true;
    expect(writeSlot(1, newTestGame())).toBe(false);
    expect(store.getItem("adeeva.save.1")).toBeNull();
    store.failWrites = false;
    expect(writeSlot(1, newTestGame())).toBe(true);
    expect(store.getItem("adeeva.lastSlot")).toBe("1");
  });

  it("treats blocked storage as saving switched off, with empty slots rather than damaged ones", () => {
    installBlockedStorage();
    expect(savingAvailable()).toBe(false);
    expect(readAllSlots().map((read) => read.kind)).toEqual(["empty", "empty", "empty"]);
    expect(writeSlot(1, newTestGame())).toBe(false);
    expect(continueSlot(readAllSlots())).toBeNull();
  });

  it("treats storage that refuses every write as saving switched off", () => {
    const store = new MemoryStorage();
    store.failWrites = true;
    installStorage(store);
    expect(savingAvailable()).toBe(false);
  });

  it("sees working storage as available", () => {
    installStorage(new MemoryStorage());
    expect(savingAvailable()).toBe(true);
  });
});
