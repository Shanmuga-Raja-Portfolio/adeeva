import { average } from "./average";
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

export function subScore(id: string, label: string, value: number, weight: number, detail: string): SubScore {
  return { id, label, value: clamp(Math.round(value), 0, 100), weight, detail };
}

export function panel<I extends string>(id: I, label: string, parts: readonly SubScore[]): PanelScore<I> {
  const score = Math.round(parts.reduce((sum, part) => sum + part.value * part.weight, 0));
  return { id, label, score: clamp(score, 0, 100), parts };
}

export function overallScore(panels: readonly Pick<PanelScore, "score">[], latePenalty: number): number {
  return clamp(Math.round(average(panels.map((entry) => entry.score))) - latePenalty, 0, 100);
}

export function bestSubScore(parts: readonly SubScore[]): SubScore | null {
  return parts.reduce<SubScore | null>(
    (top, entry) => (top === null || entry.value * entry.weight > top.value * top.weight ? entry : top),
    null,
  );
}

export function panelVerdict(score: number): string {
  if (score >= 85) return "Delighted";
  if (score >= 70) return "Loved it";
  if (score >= 55) return "Enjoyed it";
  return "Warmly cheered";
}
