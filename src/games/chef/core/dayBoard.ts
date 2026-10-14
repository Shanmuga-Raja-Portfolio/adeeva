import type { CuisineId } from "../content/cuisine";

export interface LessonOffer {
  readonly cuisine: CuisineId;
  readonly fee: number;
}

export interface ShiftOffer {
  readonly id: string;
  readonly cuisines: readonly CuisineId[];
}

export interface DayBoard {
  readonly day: number;
  readonly lesson: LessonOffer | null;
  readonly shifts: readonly ShiftOffer[];
}

export const EMPTY_BOARD: DayBoard = { day: 1, lesson: null, shifts: [] };
