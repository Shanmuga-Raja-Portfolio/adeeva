import { parseSave, serialize, type GameState } from "../core";

const SAVE_SLOTS = [1, 2, 3] as const;
export type SaveSlotId = (typeof SAVE_SLOTS)[number];

export type SlotRead =
  | { readonly kind: "empty"; readonly slot: SaveSlotId }
  | { readonly kind: "ready"; readonly slot: SaveSlotId; readonly state: GameState }
  | { readonly kind: "damaged"; readonly slot: SaveSlotId; readonly error: string };

const LAST_SLOT_KEY = "adeeva.lastSlot";
const PROBE_KEY = "adeeva.probe";

function slotKey(slot: SaveSlotId): string {
  return `adeeva.save.${slot}`;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function savingAvailable(): boolean {
  const store = storage();
  if (store === null) return false;
  try {
    store.setItem(PROBE_KEY, "1");
    store.removeItem(PROBE_KEY);
    return true;
  } catch {
    return false;
  }
}

function readKey(key: string): string | null {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function readSlot(slot: SaveSlotId): SlotRead {
  const raw = readKey(slotKey(slot));
  if (raw === null) return { kind: "empty", slot };
  const parsed = parseSave(raw);
  return parsed.ok
    ? { kind: "ready", slot, state: parsed.state }
    : { kind: "damaged", slot, error: parsed.error };
}

export function readAllSlots(): SlotRead[] {
  return SAVE_SLOTS.map(readSlot);
}

export function markLastSlot(slot: SaveSlotId): boolean {
  const store = storage();
  if (store === null) return false;
  try {
    store.setItem(LAST_SLOT_KEY, String(slot));
    return true;
  } catch {
    return false;
  }
}

export function writeSlot(slot: SaveSlotId, state: GameState): boolean {
  const store = storage();
  if (store === null) return false;
  try {
    store.setItem(slotKey(slot), serialize(state));
  } catch {
    return false;
  }
  return markLastSlot(slot);
}

export function deleteSlot(slot: SaveSlotId): void {
  const store = storage();
  if (store === null) return;
  try {
    store.removeItem(slotKey(slot));
    if (store.getItem(LAST_SLOT_KEY) === String(slot)) store.removeItem(LAST_SLOT_KEY);
  } catch {
    return;
  }
}

function lastSlot(): SaveSlotId | null {
  const raw = readKey(LAST_SLOT_KEY);
  return SAVE_SLOTS.find((slot) => String(slot) === raw) ?? null;
}

export function continueSlot(reads: readonly SlotRead[]): SlotRead | null {
  const preferred = lastSlot();
  const ready = reads.filter((read) => read.kind === "ready");
  return ready.find((read) => read.slot === preferred) ?? ready[0] ?? null;
}
