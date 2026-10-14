import type { RngState } from "../../../engine/rng";
import { drawDistinct } from "../../../engine/rngDraw";
import { FESTIVAL_IDS, type FestivalId } from "../content/festival";
import type { FestivalSlot, TruckState } from "./path";
import { weekServiceNights } from "./pathCalendar";

export const FESTIVALS_PER_WEEK = 3;

export function rollFestivalCycle(rng: RngState): [FestivalId[], RngState] {
  return drawDistinct(rng, FESTIVAL_IDS, FESTIVAL_IDS.length);
}

export function rollFestivalWeek(truck: TruckState, day: number, rng: RngState): [TruckState, RngState] {
  const [days, next] = drawDistinct(rng, weekServiceNights(day), FESTIVALS_PER_WEEK);
  const board = [...days]
    .sort((a, b) => a - b)
    .flatMap((slotDay, index): FestivalSlot[] => {
      const festivalId = truck.cycle[(truck.cycleIndex + index) % truck.cycle.length];
      return festivalId === undefined ? [] : [{ day: slotDay, festivalId, worked: false }];
    });
  return [{ ...truck, board, cycleIndex: (truck.cycleIndex + board.length) % truck.cycle.length }, next];
}

export function festivalToday(truck: TruckState, day: number): FestivalSlot | null {
  return truck.board.find((slot) => slot.day === day) ?? null;
}
