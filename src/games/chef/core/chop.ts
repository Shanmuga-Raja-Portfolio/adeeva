import { cappedAccuracy } from "../../../engine/assistCap";
import { average } from "../../../engine/average";
import type { DifficultyId } from "../../../engine/difficulty";
import type { ChopItemDef } from "../content/dish";

export const CHOP_WINDOW_MS = 110;
export const MAX_OFFSET_MS = 1000;
export const MINCE_BEATS = 4;
export const QUICK_CHOP_MARKS = 4;
export const QUICK_CHOP_ITEMS = 2;
export const CHALLENGING_TEMPO = 1.1;

export interface ChopRecord {
  readonly offsets: readonly (number | null)[];
  readonly assisted: boolean;
}

export interface ChopResult {
  readonly accuracy: number;
  readonly perfect: boolean;
  readonly assisted: boolean;
}

export function chopMarkCount(item: ChopItemDef): number {
  if (item.cut === "mince") return 2;
  return item.cut === "dice" ? item.marks * 2 : item.marks;
}

export function chopTempo(item: ChopItemDef, difficulty: DifficultyId): number {
  return difficulty === "challenging" ? item.tempo * CHALLENGING_TEMPO : item.tempo;
}

export function beatMs(item: ChopItemDef, difficulty: DifficultyId): number {
  return 60000 / chopTempo(item, difficulty);
}

export function minceStretchMs(item: ChopItemDef, difficulty: DifficultyId): number {
  return MINCE_BEATS * beatMs(item, difficulty);
}

export function quickChopItems(items: readonly ChopItemDef[]): ChopItemDef[] {
  return items.slice(0, QUICK_CHOP_ITEMS).map((item) => {
    if (item.cut === "mince") return item;
    return { ...item, marks: item.cut === "dice" ? QUICK_CHOP_MARKS / 2 : QUICK_CHOP_MARKS };
  });
}

export function chopWindow(tolerance: number): number {
  return CHOP_WINDOW_MS * tolerance;
}

export function markScore(offset: number | null, window: number): number {
  if (offset === null) return 0;
  const miss = Math.abs(offset);
  if (miss <= window) return 1;
  return miss <= 2 * window ? 0.5 : 0;
}

function endFactor(error: number, window: number): number {
  if (error <= window) return 1;
  return Math.max(0, 1 - (error - window) / (2 * window));
}

export function minceScore(offsets: readonly (number | null)[], stretchMs: number, window: number): number {
  const [press, release] = offsets;
  if (press === null || press === undefined || release === null || release === undefined) return 0;
  const start = press;
  const end = stretchMs + release;
  const overlap = Math.max(0, Math.min(end, stretchMs) - Math.max(start, 0));
  const coverage = overlap / stretchMs;
  return coverage * ((endFactor(Math.abs(press), window) + endFactor(Math.abs(release), window)) / 2);
}

export function isValidChopRecord(item: ChopItemDef, record: ChopRecord): boolean {
  return (
    typeof record.assisted === "boolean" &&
    record.offsets.length === chopMarkCount(item) &&
    record.offsets.every(
      (offset) => offset === null || (Number.isInteger(offset) && Math.abs(offset) <= MAX_OFFSET_MS),
    )
  );
}

export function scoreChop(
  item: ChopItemDef,
  record: ChopRecord,
  tolerance: number,
  difficulty: DifficultyId,
): ChopResult {
  const window = chopWindow(tolerance);
  const raw =
    item.cut === "mince"
      ? minceScore(record.offsets, minceStretchMs(item, difficulty), window)
      : average(record.offsets.map((offset) => markScore(offset, window)));
  const perfect =
    item.cut === "mince"
      ? record.offsets.every((offset) => offset !== null && Math.abs(offset) <= window)
      : record.offsets.every((offset) => markScore(offset, window) === 1);
  return {
    accuracy: cappedAccuracy(raw, record.assisted),
    perfect: perfect && !record.assisted,
    assisted: record.assisted,
  };
}
