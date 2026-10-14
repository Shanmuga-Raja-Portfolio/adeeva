import type { DifficultyId } from "../../../../../engine/difficulty";
import type { ChopItemDef } from "../../../content/dish";
import { beatMs, chopMarkCount, MAX_OFFSET_MS, minceStretchMs } from "../../../core";

export const LEAD_BEATS = 2;
export const TURN_BEATS = 2;

export interface ChopTimeline {
  readonly beat: number;
  readonly marks: readonly number[];
  readonly stretch: readonly [number, number] | null;
  readonly turnAt: number | null;
  readonly endsAt: number;
}

export function chopTimeline(item: ChopItemDef, difficulty: DifficultyId): ChopTimeline {
  const beat = beatMs(item, difficulty);
  const lead = LEAD_BEATS * beat;
  if (item.cut === "mince") {
    const end = lead + minceStretchMs(item, difficulty);
    return { beat, marks: [], stretch: [lead, end], turnAt: null, endsAt: end + MAX_OFFSET_MS };
  }
  const count = chopMarkCount(item);
  const pass = item.cut === "dice" ? count / 2 : count;
  const marks = Array.from({ length: count }, (_, index) => {
    const second = index >= pass ? TURN_BEATS * beat : 0;
    return lead + index * beat + second;
  });
  const last = marks[marks.length - 1] ?? lead;
  return {
    beat,
    marks,
    stretch: null,
    turnAt: item.cut === "dice" ? lead + pass * beat - beat / 2 : null,
    endsAt: last + MAX_OFFSET_MS,
  };
}

export function clampOffset(value: number): number {
  return Math.max(-MAX_OFFSET_MS, Math.min(MAX_OFFSET_MS, Math.round(value)));
}

export function assignTap(
  marks: readonly number[],
  offsets: readonly (number | null)[],
  at: number,
  window: number,
): (number | null)[] | null {
  let best = -1;
  let gap = Infinity;
  marks.forEach((mark, index) => {
    if (offsets[index] !== null) return;
    const distance = Math.abs(at - mark);
    if (distance < gap) {
      gap = distance;
      best = index;
    }
  });
  const mark = marks[best];
  if (mark === undefined || gap > 2 * window) return null;
  return offsets.map((entry, index) => (index === best ? clampOffset(at - mark) : entry));
}
