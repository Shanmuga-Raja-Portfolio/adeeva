import type { GameState } from "./gameState";
import type { TableState, TeaPour } from "./salonState";
import { skillTolerance } from "./skillTolerance";
import { updateTable } from "./tableSession";
import { weighAccuracy, type ScoopStyle } from "./weighAccuracy";

export const TEA_TARGET_ML = 150;
export const MAX_POUR_ML = 300;
export const MAX_POUR_ACTIONS = 40;
export const BASE_TEA_BAND = 0.06;
export const GOOSENECK_MULTIPLIER = 1.2;
export const TEA_POUR_STYLE: ScoopStyle = { mode: "pour", pieceGrams: 1 };

export interface PourAttempt {
  readonly ml: number;
  readonly actions: number;
  readonly assisted: boolean;
}

export function teaBand(state: GameState): number {
  return (
    BASE_TEA_BAND * skillTolerance(state, { upgrade: "gooseneck-teapot", multiplier: GOOSENECK_MULTIPLIER })
  );
}

export function pourAccuracy(pour: TeaPour): number {
  return weighAccuracy(
    { grams: pour.ml, actions: pour.actions, assisted: pour.assisted },
    TEA_POUR_STYLE,
    TEA_TARGET_ML,
    pour.band,
  );
}

export function isPourValid(attempt: PourAttempt): boolean {
  return (
    Number.isInteger(attempt.ml) &&
    attempt.ml >= 0 &&
    attempt.ml <= MAX_POUR_ML &&
    Number.isInteger(attempt.actions) &&
    attempt.actions >= 1 &&
    attempt.actions <= MAX_POUR_ACTIONS &&
    typeof attempt.assisted === "boolean"
  );
}

export function pourTea(state: GameState, tableIndex: number, attempt: PourAttempt): GameState {
  if (!isPourValid(attempt)) return state;
  const band = teaBand(state);
  return updateTable(state, tableIndex, (table): TableState | null => {
    const pour: TeaPour = { ml: attempt.ml, actions: attempt.actions, assisted: attempt.assisted, band };
    const same =
      table.pour !== null &&
      table.pour.ml === pour.ml &&
      table.pour.actions === pour.actions &&
      table.pour.assisted === pour.assisted;
    return same ? null : { ...table, pour };
  });
}
