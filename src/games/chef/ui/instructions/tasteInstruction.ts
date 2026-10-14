import type { TasteDef } from "../../content/dish";
import type { JarId } from "../../content/seasoning";
import type { TasteState } from "../../core";

export interface TasteMoment {
  readonly def: TasteDef;
  readonly radius: number;
  readonly current: TasteState;
  readonly revealed: TasteState | null;
  readonly tastes: number;
  readonly seeing: boolean;
  readonly suggested: JarId | null;
  readonly served: boolean;
}

export const TASTE_LINES = {
  first: "Tap Taste to find where the dish is.",
  again: "Pinch added. Taste as you go: tap Taste again!",
  move: "Add a pinch to move toward the circle.",
  spotOn: "Spot on! Now tap Tastes right!",
  spotOnTaste: "Spot on! Tap Taste, then Tastes right!",
  followArrow: "Tap the glowing jar the arrow points to.",
  served: "Tastes right! Off it goes.",
} as const;

function sameTaste(a: TasteState, b: TasteState): boolean {
  return a.point[0] === b.point[0] && a.point[1] === b.point[1] && a.savoury === b.savoury;
}

export function onTarget(state: TasteState, def: TasteDef, radius: number): boolean {
  const distance = Math.hypot(state.point[0] - def.target[0], state.point[1] - def.target[1]);
  return distance <= radius && state.savoury === def.savoury;
}

export function tasteInstruction(moment: TasteMoment): string {
  const { def, radius, current, revealed, tastes, seeing, suggested, served } = moment;
  if (served) return TASTE_LINES.served;
  if (seeing) {
    if (onTarget(current, def, radius) || suggested === null)
      return tastes === 0 ? TASTE_LINES.spotOnTaste : TASTE_LINES.spotOn;
    return TASTE_LINES.followArrow;
  }
  if (revealed === null || tastes === 0) return TASTE_LINES.first;
  if (!sameTaste(revealed, current)) return TASTE_LINES.again;
  return onTarget(revealed, def, radius) ? TASTE_LINES.spotOn : TASTE_LINES.move;
}
