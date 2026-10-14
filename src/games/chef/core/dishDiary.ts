import type { DishId } from "../content/dish";
import type { PlateColour } from "../content/plateComponent";
import { CAREER } from "../content/career";
import type { PlacedComponent } from "./plate";

export interface PlatingCard {
  readonly dishId: DishId;
  readonly plateColour: PlateColour;
  readonly components: readonly PlacedComponent[];
  readonly accuracy: number;
  readonly assisted: boolean;
  readonly stars: number;
}

export interface DiaryEntry {
  readonly id: string;
  readonly dishId: DishId;
  readonly day: number;
  readonly plateColour: PlateColour;
  readonly components: readonly PlacedComponent[];
  readonly stars: number;
  readonly note: string;
}

export function withCard(cards: readonly PlatingCard[], card: PlatingCard): readonly PlatingCard[] {
  return [...cards.filter((entry) => entry.dishId !== card.dishId), card];
}

export function cardFor(cards: readonly PlatingCard[], dishId: DishId): PlatingCard | null {
  return cards.find((entry) => entry.dishId === dishId) ?? null;
}

export function addToDiary(diary: readonly DiaryEntry[], entry: DiaryEntry): readonly DiaryEntry[] {
  return [...diary, entry].slice(-CAREER.diarySize);
}
