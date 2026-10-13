import type { SaveParseResult } from "../engine/saveEnvelope";
import { parseJson, readStoredText } from "./storedJson";

export const SAVE_SLOTS = [1, 2, 3] as const;
export type SaveSlotId = (typeof SAVE_SLOTS)[number];

export type SlotRead<S> =
  | { readonly kind: "empty"; readonly slot: SaveSlotId }
  | { readonly kind: "ready"; readonly slot: SaveSlotId; readonly state: S }
  | { readonly kind: "damaged"; readonly slot: SaveSlotId; readonly error: string };

export interface SlotCodec<S> {
  readonly parse: (json: string) => SaveParseResult<S>;
  readonly serialize: (state: S) => string;
}

export interface SlotStore<S> {
  readonly savingAvailable: () => boolean;
  readonly readAllSlots: () => SlotRead<S>[];
  readonly writeSlot: (slot: SaveSlotId, state: S) => boolean;
  readonly deleteSlot: (slot: SaveSlotId) => void;
  readonly markLastSlot: (slot: SaveSlotId) => boolean;
  readonly continueSlot: (reads: readonly SlotRead<S>[]) => SlotRead<S> | null;
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function slotKey(gameId: string, slot: SaveSlotId): string {
  return `${gameId}.save.${slot}`;
}

export function lastSlotKey(gameId: string): string {
  return `${gameId}.lastSlot`;
}

export function readRawSlots(gameId: string): unknown[] {
  return SAVE_SLOTS.flatMap((slot) => {
    const raw = readStoredText(slotKey(gameId, slot));
    return raw === null ? [] : [parseJson(raw)];
  });
}

export function readLastRawSlot(gameId: string): unknown {
  const last = SAVE_SLOTS.find((slot) => String(slot) === readStoredText(lastSlotKey(gameId)));
  if (last === undefined) return null;
  const raw = readStoredText(slotKey(gameId, last));
  return raw === null ? null : parseJson(raw);
}

export function clearGameSaves(gameId: string): void {
  try {
    for (const slot of SAVE_SLOTS) window.localStorage.removeItem(slotKey(gameId, slot));
    window.localStorage.removeItem(lastSlotKey(gameId));
  } catch {
    return;
  }
}

export function createSlotStore<S>(gameId: string, codec: SlotCodec<S>): SlotStore<S> {
  const lastKey = lastSlotKey(gameId);
  const probeKey = `${gameId}.probe`;

  function savingAvailable(): boolean {
    const store = storage();
    if (store === null) return false;
    try {
      store.setItem(probeKey, "1");
      store.removeItem(probeKey);
      return true;
    } catch {
      return false;
    }
  }

  function readSlot(slot: SaveSlotId): SlotRead<S> {
    const raw = readStoredText(slotKey(gameId, slot));
    if (raw === null) return { kind: "empty", slot };
    const parsed = codec.parse(raw);
    return parsed.ok
      ? { kind: "ready", slot, state: parsed.state }
      : { kind: "damaged", slot, error: parsed.error };
  }

  function markLastSlot(slot: SaveSlotId): boolean {
    const store = storage();
    if (store === null) return false;
    try {
      store.setItem(lastKey, String(slot));
      return true;
    } catch {
      return false;
    }
  }

  function writeSlot(slot: SaveSlotId, state: S): boolean {
    const store = storage();
    if (store === null) return false;
    try {
      store.setItem(slotKey(gameId, slot), codec.serialize(state));
    } catch {
      return false;
    }
    return markLastSlot(slot);
  }

  function deleteSlot(slot: SaveSlotId): void {
    const store = storage();
    if (store === null) return;
    try {
      store.removeItem(slotKey(gameId, slot));
      if (store.getItem(lastKey) === String(slot)) store.removeItem(lastKey);
    } catch {
      return;
    }
  }

  function continueSlot(reads: readonly SlotRead<S>[]): SlotRead<S> | null {
    const preferred = SAVE_SLOTS.find((slot) => String(slot) === readStoredText(lastKey)) ?? null;
    const ready = reads.filter((read) => read.kind === "ready");
    return ready.find((read) => read.slot === preferred) ?? ready[0] ?? null;
  }

  return {
    savingAvailable,
    readAllSlots: () => SAVE_SLOTS.map(readSlot),
    writeSlot,
    deleteSlot,
    markLastSlot,
    continueSlot,
  };
}
