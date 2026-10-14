import { clamp } from "./clamp";

export interface SubScore {
  readonly id: string;
  readonly label: string;
  readonly value: number;
  readonly weight: number;
  readonly detail: string;
}

export interface PanelScore<I extends string = string> {
  readonly id: I;
  readonly label: string;
  readonly score: number;
  readonly parts: readonly SubScore[];
}

export function panel<I extends string>(id: I, label: string, parts: readonly SubScore[]): PanelScore<I> {
  const score = Math.round(parts.reduce((sum, part) => sum + part.value * part.weight, 0));
  return { id, label, score: clamp(score, 0, 100), parts };
}
