import { trimById } from "./catalog";
import type { Decoration } from "./dressRun";

export function decorationsCost(decorations: readonly Decoration[]): number {
  return decorations.reduce((sum, decoration) => sum + trimById(decoration.trimId).price, 0);
}

export function runSpend(run: {
  readonly fabricSpend: number;
  readonly decorations: readonly Decoration[];
}): number {
  return run.fabricSpend + decorationsCost(run.decorations);
}
