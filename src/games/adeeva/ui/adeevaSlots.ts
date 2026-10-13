import { createSlotStore, type SlotRead as StoreSlotRead } from "../../../studio/slotStore";
import { parseSave, serialize, type GameState } from "../core";

export type { SaveSlotId } from "../../../studio/slotStore";
export type SlotRead = StoreSlotRead<GameState>;

export const adeevaSlots = createSlotStore<GameState>("adeeva", { parse: parseSave, serialize });

export const { savingAvailable, readAllSlots, writeSlot, deleteSlot, markLastSlot, continueSlot } =
  adeevaSlots;
